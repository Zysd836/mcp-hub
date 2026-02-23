# Day 1 — Backend Pipeline

**Mục tiêu cuối ngày:** CLI test hoàn chỉnh — chạy generated MCP server, kết nối Cursor, agent thực hiện tool call thành công.

---

## Buổi Sáng: Parser + Codegen Template

### Task 1.1 — Khởi tạo project
```bash
npx create-next-app@latest mcphub --typescript --tailwind --app
cd mcphub
npm install swagger-parser @modelcontextprotocol/sdk jszip
npm install -D @types/swagger-parser handlebars
```

### Task 1.2 — Setup swagger-parser
File: `lib/parser.ts`

```typescript
import SwaggerParser from "@apidevtools/swagger-parser";

export async function parseSpec(urlOrJson: string) {
  const api = await SwaggerParser.dereference(urlOrJson);
  return {
    title: api.info.title,
    version: api.info.version,
    baseUrl: extractBaseUrl(api),
    auth: detectAuth(api),
    endpoints: extractEndpoints(api),
  };
}
```

**Test với PetStore:** `https://petstore3.swagger.io/api/v3/openapi.json` (~20 endpoints, đơn giản)

### Task 1.3 — Codegen template cơ bản
- Tạo `templates/index.ts.hbs` — MCP server template với try/catch + isError
- Tạo `templates/env.example.hbs`
- Tạo `templates/README.md.hbs`
- Tạo `templates/cursor.json.hbs`
- Tạo `templates/claude-desktop.json.hbs`

**Checkpoint sáng:** `lib/parser.ts` parse được PetStore spec và trả về danh sách endpoints chuẩn hóa.

---

## Buổi Chiều: AI Mapper

### Task 1.4 — Endpoint selection prompt
File: `lib/ai-mapper.ts`

Yêu cầu:
- Gọi Claude API với danh sách endpoints
- Prompt yêu cầu chọn 10–15 endpoints hữu ích nhất
- Parse JSON response, validate IDs hợp lệ
- Fallback: nếu AI trả về sai format → lấy 15 endpoints đầu tiên

**Iterate prompt** cho đến khi selection cho Stripe spec hợp lý (chứa create_payment_intent, create_customer, v.v.)

### Task 1.5 — Description generation
- Gọi Claude API cho từng endpoint đã chọn
- Prompt yêu cầu mô tả agent-optimized (context, khi nào dùng, params quan trọng, return value)
- **Đo chất lượng:** So sánh description gốc vs generated — generated phải rõ hơn cho agent

**Test thực tế:**
```
❌ Naive: "Create a PaymentIntent."
✅ Generated: "Create a PaymentIntent to begin collecting payment from a customer.
              Use this before confirming a charge. Requires amount in the smallest
              currency unit (e.g. 100 = $1.00 USD). Returns a client_secret."
```

### Task 1.6 — Auth detector
- Parse `components.securitySchemes` từ spec
- Detect: Bearer token, API Key (header), none
- Derive env var name từ API title

**Checkpoint chiều:** AI mapper chọn endpoints tốt và generate descriptions chất lượng cho Stripe spec.

---

## Buổi Tối: End-to-End CLI Test

### Task 1.7 — Zip builder
File: `lib/zip-builder.ts`

```typescript
import JSZip from "jszip";
import Handlebars from "handlebars";

export async function buildZip(config: GenerateConfig): Promise<Buffer> {
  const zip = new JSZip();
  zip.file("index.ts", renderTemplate("index.ts.hbs", config));
  zip.file(".env.example", renderTemplate("env.example.hbs", config));
  zip.file("configs/cursor.json", renderTemplate("cursor.json.hbs", config));
  zip.file("configs/claude-desktop.json", renderTemplate("claude-desktop.json.hbs", config));
  zip.file("README.md", renderTemplate("README.md.hbs", config));
  return zip.generateAsync({ type: "nodebuffer" });
}
```

### Task 1.8 — CLI test script
File: `scripts/test-generate.ts`

```typescript
// Chạy: npx tsx scripts/test-generate.ts
const result = await parseSpec("https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json");
const selected = await aiMapper(result);
const zip = await buildZip({ ...result, tools: selected });
fs.writeFileSync("test-output/stripe-mcp.zip", zip);
```

### Task 1.9 — Validate generated server
```bash
cd test-output
unzip stripe-mcp.zip -d stripe-mcp
cd stripe-mcp
cp .env.example .env   # thêm STRIPE_API_KEY test
npm install
npm start
# → MCP server running
```

Kết nối Cursor, gửi prompt: *"List my Stripe customers"* — nếu agent gọi tool và nhận response → **Day 1 done.**

---

## Rủi Ro & Mitigation

| Rủi ro | Xử lý |
|---|---|
| swagger-parser fail với một số spec | Thêm try/catch, log lỗi rõ ràng, test với PetStore trước |
| AI selection không ổn định | Thêm JSON schema validation cho response, fallback to top-N |
| Generated server không compile | Kiểm tra TypeScript template kỹ trước khi test end-to-end |
| Stripe spec quá lớn (3MB+) | Normalize trước khi gửi cho AI — chỉ gửi `summary` + `path` + `method` |

---

## Definition of Done — Day 1

- [ ] `lib/parser.ts` parse được PetStore và Stripe spec
- [ ] `lib/ai-mapper.ts` select 10–15 endpoints hợp lý từ Stripe spec
- [ ] Descriptions generated rõ ràng hơn descriptions gốc
- [ ] `lib/zip-builder.ts` tạo .zip với đủ 5 files
- [ ] Generated `index.ts` compile được TypeScript
- [ ] Agent trong Cursor gọi thành công ít nhất 1 Stripe tool
