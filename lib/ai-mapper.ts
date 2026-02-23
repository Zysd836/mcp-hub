import Anthropic from "@anthropic-ai/sdk";
import type { EndpointMeta, ToolConfig } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-sonnet-4-6";
const MAX_TOOLS = 15;

/**
 * Uses Claude to select the 10–15 most useful endpoints from a spec.
 * Returns the IDs of selected endpoints.
 */
export async function selectEndpoints(
  endpoints: EndpointMeta[],
  apiTitle: string
): Promise<string[]> {
  if (endpoints.length <= MAX_TOOLS) {
    return endpoints.map((e) => e.id);
  }

  const endpointSummaries = endpoints.map((e) => ({
    id: e.id,
    method: e.method,
    path: e.path,
    summary: e.summary ?? e.operationId ?? `${e.method} ${e.path}`,
    tags: e.tags,
  }));

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are an expert in MCP tool design and AI agent UX.

Here are the API endpoints from "${apiTitle}":

${JSON.stringify(endpointSummaries, null, 2)}

Select the ${MAX_TOOLS} most useful endpoints for an AI agent. Prioritize:
1. CRUD operations on core resources (create, read, update, delete)
2. Endpoints commonly used in automated workflows
3. Endpoints that surface the most important data

Exclude: admin/management endpoints, bulk import/export, deprecated operations, webhook configuration.

Return ONLY a valid JSON array of endpoint IDs. No explanation, no markdown, no code blocks.
Example: ["post_/v1/payment_intents", "get_/v1/customers"]`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return parseJsonArray(text, endpoints);
}

/**
 * Uses Claude to generate agent-optimized descriptions for each selected endpoint.
 */
export async function generateDescriptions(
  endpoints: EndpointMeta[]
): Promise<ToolConfig[]> {
  const results: ToolConfig[] = [];
  const batches = chunk(endpoints, 5);

  for (const batch of batches) {
    const batchResults = await Promise.all(
      batch.map((endpoint) => generateSingleDescription(endpoint))
    );
    results.push(...batchResults);
  }

  return results;
}

async function generateSingleDescription(endpoint: EndpointMeta): Promise<ToolConfig> {
  const toolName = toToolName(endpoint);

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `You write tool descriptions optimized for AI agent reasoning.

A good description tells the agent:
- What this tool does
- When to use it (vs similar tools)
- Key parameters and their meaning
- What it returns

Keep it to 2-4 sentences, under 300 characters.

Good example:
"Create a PaymentIntent to begin collecting payment from a customer. Use this before confirming a charge. Requires amount in the smallest currency unit (e.g. 100 = $1.00 USD). Returns a client_secret for front-end confirmation."

Now write a description for this endpoint:
Method: ${endpoint.method}
Path: ${endpoint.path}
Summary: ${endpoint.summary ?? "(none)"}
Parameters: ${JSON.stringify(endpoint.parameters.slice(0, 5))}
Request body schema: ${JSON.stringify(endpoint.requestBodySchema ?? {})}

Return ONLY the description text. No quotes, no markdown, no code blocks.`,
      },
    ],
  });

  const description =
    message.content[0].type === "text" ? message.content[0].text.trim() : "";

  const { inputSchemaProperties, requiredFields } = buildInputSchema(endpoint);
  const hasBody =
    !!endpoint.requestBodySchema && ["POST", "PUT", "PATCH"].includes(endpoint.method);

  return {
    name: toolName,
    description: description || `${endpoint.method} ${endpoint.path}`,
    endpoint,
    inputSchemaProperties,
    requiredFields,
    hasBody,
  };
}

function toToolName(endpoint: EndpointMeta): string {
  if (endpoint.operationId) {
    return endpoint.operationId
      .replace(/([A-Z])/g, "_$1")
      .toLowerCase()
      .replace(/^_/, "")
      .replace(/[^a-z0-9_]/g, "_");
  }
  const method = endpoint.method.toLowerCase();
  const pathPart = endpoint.path
    .replace(/^\//, "")
    .replace(/\//g, "_")
    .replace(/[{}]/g, "")
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/_$/, "");
  return `${method}_${pathPart}`;
}

function buildInputSchema(endpoint: EndpointMeta): {
  inputSchemaProperties: Record<string, unknown>;
  requiredFields: string[];
} {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const param of endpoint.parameters) {
    if (["path", "query"].includes(param.in)) {
      properties[param.name] = {
        type: "string",
        description: param.description ?? `${param.in} parameter`,
        ...(param.schema ?? {}),
      };
      if (param.required) required.push(param.name);
    }
  }

  if (endpoint.requestBodySchema) {
    const bodySchema = endpoint.requestBodySchema as {
      properties?: Record<string, Record<string, unknown>>;
      required?: string[];
    };
    if (bodySchema.properties) {
      for (const [key, val] of Object.entries(bodySchema.properties)) {
        properties[key] = val;
      }
      if (bodySchema.required) {
        required.push(
          ...bodySchema.required.filter((r) => !(r in properties) || required.includes(r))
        );
      }
    }
  }

  return { inputSchemaProperties: properties, requiredFields: [...new Set(required)] };
}

function parseJsonArray(text: string, fallbackEndpoints: EndpointMeta[]): string[] {
  try {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      const parsed = JSON.parse(match[0]) as unknown[];
      const validIds = new Set(fallbackEndpoints.map((e) => e.id));
      const filtered = parsed.filter(
        (id): id is string => typeof id === "string" && validIds.has(id)
      );
      if (filtered.length > 0) return filtered;
    }
  } catch {
    // Fall through to default
  }
  return fallbackEndpoints.slice(0, MAX_TOOLS).map((e) => e.id);
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
