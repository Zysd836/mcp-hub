# Kiến Trúc Kỹ Thuật — MCP Hub

---

## Sơ Đồ Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                        Web UI (Next.js)                     │
│                                                             │
│  [URL Input / Upload]  →  [Endpoint Selector]  →  [Download]│
│         ↕                        ↕                          │
│    /api/parse             /api/generate                     │
└──────────────┬──────────────────┬──────────────────────────┘
               │                  │
               ▼                  ▼
    ┌─────────────────┐  ┌──────────────────────┐
    │ swagger-parser  │  │     Claude API        │
    │                 │  │                       │
    │ - Fetch spec    │  │ - Endpoint selection  │
    │ - Validate      │  │ - Description gen     │
    │ - Normalize     │  │ - Auth detection      │
    └────────┬────────┘  └──────────┬────────────┘
             │                      │
             └──────────┬───────────┘
                        ▼
              ┌───────────────────┐
              │    Codegen Engine  │
              │                   │
              │ - index.ts        │
              │ - .env.example    │
              │ - cursor.json     │
              │ - claude-desk.json│
              │ - README.md       │
              └────────┬──────────┘
                       │
                       ▼
                  .zip download
```

---

## Cấu Trúc Project

```
mcphub/
├── app/
│   ├── page.tsx                  ← Landing + input form
│   ├── generate/
│   │   └── page.tsx              ← Endpoint selection UI
│   └── api/
│       ├── parse/
│       │   └── route.ts          ← Parse OpenAPI spec
│       └── generate/
│           └── route.ts          ← AI selection + codegen + zip
├── lib/
│   ├── parser.ts                 ← swagger-parser wrapper
│   ├── ai-mapper.ts              ← Claude API: selection + descriptions
│   ├── codegen.ts                ← TypeScript MCP server template
│   ├── auth-detector.ts          ← Detect Bearer / API Key từ spec
│   └── zip-builder.ts            ← jszip wrapper
├── templates/
│   ├── index.ts.hbs              ← MCP server template (Handlebars)
│   ├── env.example.hbs
│   ├── cursor.json.hbs
│   ├── claude-desktop.json.hbs
│   └── README.md.hbs
└── components/
    ├── UrlInput.tsx
    ├── EndpointList.tsx
    ├── EndpointSearch.tsx
    └── DescriptionEditor.tsx
```

---

## API Routes

### `POST /api/parse`

**Input:**
```json
{
  "url": "https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json"
}
```

**Output:**
```json
{
  "title": "Stripe API",
  "version": "2024-06-20",
  "authMethod": "bearer",          // "bearer" | "apikey" | "none"
  "authEnvVar": "STRIPE_API_KEY",
  "baseUrl": "https://api.stripe.com",
  "endpoints": [
    {
      "id": "post_/v1/payment_intents",
      "method": "POST",
      "path": "/v1/payment_intents",
      "summary": "Create a PaymentIntent",
      "description": "...",
      "parameters": [...],
      "requestBody": {...}
    }
  ]
}
```

### `POST /api/generate`

**Input:**
```json
{
  "specMeta": { "title": "...", "baseUrl": "...", "authMethod": "bearer", "authEnvVar": "..." },
  "selectedEndpoints": [
    {
      "id": "post_/v1/payment_intents",
      "toolName": "create_payment_intent",
      "description": "Create a PaymentIntent to begin collecting payment..."
    }
  ]
}
```

**Output:** Binary `.zip` file

---

## AI Mapper — Prompt Strategy

### Bước 1: Endpoint Selection

```
System: Bạn là expert về MCP tool design và AI agent UX.

User: Đây là danh sách endpoints từ {API_NAME}:
{ENDPOINT_LIST}

Chọn 10-15 endpoints hữu ích nhất cho AI agent. Ưu tiên:
1. CRUD operations cho resources chính
2. Endpoints mà agent thường dùng trong workflow tự động
3. Bỏ qua: admin endpoints, bulk operations hiếm, deprecated

Trả về JSON array gồm endpoint IDs.
```

### Bước 2: Description Generation

```
System: Bạn viết tool descriptions tối ưu cho AI agent reasoning.
Description phải: context-aware, nêu rõ khi nào dùng tool này vs tool khác,
list tham số quan trọng, mô tả return value.

User: Endpoint: {METHOD} {PATH}
Summary: {ORIGINAL_SUMMARY}
Parameters: {PARAMS}
Response: {RESPONSE_SCHEMA}

Viết description cho tool này (2-4 câu, tối đa 300 ký tự).
Ví dụ tốt: "Create a PaymentIntent to begin collecting payment from a customer.
Use this before confirming a charge. Requires amount in the smallest currency unit
(e.g. 100 = $1.00 USD). Returns a client_secret for front-end confirmation."
```

---

## Codegen Template — index.ts

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const API_KEY = process.env.{{AUTH_ENV_VAR}};
const BASE_URL = "{{BASE_URL}}";

const server = new Server(
  { name: "{{SERVER_NAME}}", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {{#each tools}}
    {
      name: "{{name}}",
      description: "{{description}}",
      inputSchema: {
        type: "object",
        properties: {{{inputSchemaProperties}}},
        required: {{{requiredFields}}},
      },
    },
    {{/each}}
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    {{#each tools}}
    if (name === "{{name}}") {
      const response = await fetch(`${BASE_URL}{{path}}`, {
        method: "{{method}}",
        headers: {
          "Content-Type": "application/json",
          {{#if ../isBearerAuth}}"Authorization": `Bearer ${API_KEY}`,{{/if}}
          {{#if ../isApiKeyHeader}}"{{../apiKeyHeader}}": API_KEY ?? "",{{/if}}
        },
        {{#if hasBody}}body: JSON.stringify(args),{{/if}}
      });

      if (!response.ok) {
        const error = await response.text();
        return { isError: true, content: [{ type: "text", text: `Error ${response.status}: ${error}` }] };
      }

      const data = await response.json();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
    {{/each}}

    return { isError: true, content: [{ type: "text", text: `Unknown tool: ${name}` }] };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: `Request failed: ${error instanceof Error ? error.message : String(error)}` }],
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## Auth Detection Logic

```typescript
function detectAuth(spec: OpenAPIObject): AuthConfig {
  const securitySchemes = spec.components?.securitySchemes ?? {};

  for (const [name, scheme] of Object.entries(securitySchemes)) {
    if (scheme.type === "http" && scheme.scheme === "bearer") {
      return { type: "bearer", envVar: deriveEnvVarName(spec.info.title) };
    }
    if (scheme.type === "apiKey" && scheme.in === "header") {
      return { type: "apikey", header: scheme.name, envVar: deriveEnvVarName(spec.info.title) };
    }
  }

  return { type: "none" };
}

function deriveEnvVarName(title: string): string {
  // "Stripe API" → "STRIPE_API_KEY"
  return title.toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "") + "_KEY";
}
```

---

## Output Files

### `.env.example`
```
# Get your API key from: {{API_DOCS_URL}}
{{AUTH_ENV_VAR}}=your_key_here
```

### `configs/cursor.json`
```json
{
  "mcpServers": {
    "{{server-name}}": {
      "command": "node",
      "args": ["index.js"],
      "cwd": "/absolute/path/to/{{server-name}}",
      "env": {
        "{{AUTH_ENV_VAR}}": "${env:{{AUTH_ENV_VAR}}}"
      }
    }
  }
}
```

### `configs/claude-desktop.json`
```json
{
  "mcpServers": {
    "{{server-name}}": {
      "command": "node",
      "args": ["/absolute/path/to/{{server-name}}/index.js"]
    }
  }
}
```
