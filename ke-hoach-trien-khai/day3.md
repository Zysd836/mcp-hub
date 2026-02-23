# Day 3 — Polish + Demo + Registry (nếu còn thời gian)

**Mục tiêu cuối ngày:** Demo hoàn chỉnh với Stripe + GitHub spec. Static registry page nếu còn thời gian.

---

## Buổi Sáng: Real-World Spec Testing

### Task 3.1 — Test Stripe spec (priority #1)
URL: `https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json`

Kiểm tra:
- [ ] Parser xử lý được spec 3MB+
- [ ] AI chọn đúng các endpoints cốt lõi (payment intents, customers, charges)
- [ ] Auth được detect là Bearer token, env var = `STRIPE_API_KEY`
- [ ] Generated server compile không lỗi
- [ ] Agent trong Cursor gọi được `create_payment_intent` với args đúng

**Demo script Stripe:**
```
Prompt: "Create a $50 payment intent for john@example.com"
Agent calls: create_payment_intent({ amount: 5000, currency: "usd", ... })
Returns: { id: "pi_xxx", client_secret: "pi_xxx_secret_xxx", ... }
```

### Task 3.2 — Test GitHub spec
URL: `https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json`

Kiểm tra:
- [ ] Spec rất lớn (20MB+) — parser phải handle được
- [ ] AI selection có ý nghĩa (list repos, create issue, get PR, v.v.)
- [ ] Auth detect là Bearer token, env var = `GITHUB_TOKEN`

### Task 3.3 — Fix edge cases
Các vấn đề thường gặp với real-world specs:
- Circular references trong schema → swagger-parser `dereference` xử lý
- Endpoints không có `summary` → dùng `operationId` hoặc `{METHOD} {PATH}`
- Auth scheme không chuẩn → fallback to "none"
- Response schema quá phức tạp → simplify trước khi codegen

**Checkpoint sáng:** Cả Stripe và GitHub spec đều generate được MCP server hoạt động.

---

## Buổi Chiều: Polish + Demo Rehearsal

### Task 3.4 — Inline description editor (nếu chưa làm ở Day 2)
- Click vào description → `<textarea>` editable
- Character count (max 300)
- Save on blur, cancel on Escape

### Task 3.5 — UI Polish
- Responsive layout (mobile optional, desktop priority)
- Typography và spacing nhất quán
- Empty states (no endpoints found, search no results)
- Success state sau khi download

### Task 3.6 — Demo rehearsal đầy đủ

**Sequence demo (5 phút):**

```
1. Mở mcphub.dev (30s)
   - Giới thiệu problem: "Expose API cho AI agent mà không viết boilerplate"
   - Giải thích: tool descriptions là vấn đề thực sự

2. Paste Stripe URL (30s)
   - Paste URL → click Generate
   - Xem loading: "AI đang phân tích spec..."

3. Endpoint selection (1 phút)
   - Chỉ ra AI đã chọn sẵn 12 endpoints phù hợp
   - So sánh description gốc vs generated
   - Demo search: gõ "payment" → filter realtime
   - Demo uncheck một endpoint không cần thiết

4. Generate & Download (30s)
   - Click "Generate MCP Server"
   - Download stripe-mcp.zip
   - Unzip → chỉ ra cấu trúc file

5. Chạy và demo trong Cursor (2 phút)
   - `cd stripe-mcp && npm start`
   - Mở Cursor, add config
   - Gửi prompt: "Create a $50 payment intent"
   - Agent gọi tool → nhận response
```

### Task 3.7 — Buffer cho bug fixes
Dùng thời gian này để fix các lỗi phát hiện trong rehearsal.

---

## Nếu Còn Thời Gian: Static Registry Page

### Task 3.8 — Registry demo page
File: `app/registry/page.tsx`

Layout:
```
┌─────────────────────────────────────────────────────┐
│  MCP Hub Registry                                   │
│  Pre-built, curated MCP servers — install in 1 click│
│                                                     │
│  [Search servers...]                                │
│                                                     │
│  ┌──────────────────────┐  ┌──────────────────────┐ │
│  │ 🏦 stripe-mcp v1.4   │  │ 🐙 github-mcp v2.1   │ │
│  │ 12 tools · 4.8★      │  │ 15 tools · 4.9★      │ │
│  │ Payments, customers  │  │ Repos, issues, PRs   │ │
│  │ [Install to Cursor]  │  │ [Install to Cursor]  │ │
│  └──────────────────────┘  └──────────────────────┘ │
│                                                     │
│  ┌──────────────────────┐  ┌──────────────────────┐ │
│  │ 🛍️ shopify-mcp v1.0  │  │ 📝 notion-mcp v1.2   │ │
│  │ ...                  │  │ ...                  │ │
│  └──────────────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Hardcode 5–10 servers:** Stripe, GitHub, Shopify, Notion, Twilio, SendGrid, OpenAI, Slack

### Task 3.9 — "Install to Cursor" button
Click → Modal hiện config snippet để copy:

```json
{
  "mcpServers": {
    "stripe-mcp": {
      "command": "npx",
      "args": ["-y", "@mcphub/stripe-mcp"],
      "env": { "STRIPE_API_KEY": "sk_test_..." }
    }
  }
}
```

→ "Copy to clipboard" button
→ "View on GitHub" link (fake cho demo)

---

## Rủi Ro & Mitigation

| Rủi ro | Xử lý |
|---|---|
| GitHub spec quá lớn, parse timeout | Cache parsed result; hoặc dùng subset spec |
| Demo trong Cursor fail live | Chuẩn bị video backup của demo thành công |
| Bug xuất hiện khi demo | Dùng pre-generated zip đã test sẵn |

---

## Definition of Done — Day 3

- [ ] Stripe spec: generate → chạy → Cursor agent gọi tool thành công
- [ ] GitHub spec: generate → chạy → agent gọi tool thành công
- [ ] Demo rehearsal completed không có blocking bugs
- [ ] (Optional) Static registry page với 5+ servers
- [ ] (Optional) "Install to Cursor" copy snippet hoạt động

---

## Checklist Pre-Demo

```
□ Stripe API key test có sẵn trong .env
□ Cursor đã cài MCP extension
□ Demo script đã tập ít nhất 2 lần
□ Video backup đã record sẵn
□ mcphub.dev đã deploy lên Vercel
□ Fallback: localhost:3000 đã chạy sẵn
```
