# Day 2 — Web UI

**Mục tiêu cuối ngày:** Full flow hoạt động trên web — paste URL → chọn endpoints → download .zip.

---

## Buổi Sáng: Next.js Setup + Input Form

### Task 2.1 — API route `/api/parse`
File: `app/api/parse/route.ts`

```typescript
export async function POST(req: Request) {
  const { url } = await req.json();

  if (!url || !isValidUrl(url)) {
    return Response.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const parsed = await parseSpec(url);
    return Response.json(parsed);
  } catch (e) {
    return Response.json({ error: "Failed to parse spec", detail: String(e) }, { status: 422 });
  }
}
```

### Task 2.2 — Landing page + input form
File: `app/page.tsx`

Layout:
```
┌─────────────────────────────────────────────────────┐
│  MCP Hub                                            │
│  Make any API callable by AI agents — in 30 seconds │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ https://your-api.com/openapi.json           │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [Paste URL]  or  [Upload JSON/YAML]                │
│                                                     │
│  [ Generate MCP Server → ]                          │
└─────────────────────────────────────────────────────┘
```

Components:
- `UrlInput.tsx` — text input + validate URL format on blur
- `FileUpload.tsx` — drag-and-drop JSON/YAML upload
- Loading state: spinner + "Analyzing your API..." text trong khi call `/api/parse`

### Task 2.3 — Wire up parse flow
```
User nhập URL → click Generate → POST /api/parse
→ nhận endpoints list → redirect sang /generate?spec={id}
```

Lưu parsed spec trong sessionStorage hoặc truyền qua query param.

**Checkpoint sáng:** Form hoạt động, parse Stripe URL và nhận lại danh sách endpoints.

---

## Buổi Chiều: Endpoint Selection UI

### Task 2.4 — API route `/api/generate`
File: `app/api/generate/route.ts`

```typescript
export async function POST(req: Request) {
  const { specMeta, selectedEndpoints } = await req.json();

  // Gọi codegen + zip builder
  const zip = await buildZip({ ...specMeta, tools: selectedEndpoints });

  return new Response(zip, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${specMeta.slug}-mcp.zip"`,
    },
  });
}
```

### Task 2.5 — Endpoint selection page
File: `app/generate/page.tsx`

Layout:
```
┌─────────────────────────────────────────────────────┐
│  Stripe API → Select your tools (12 selected)       │
│                                                     │
│  [Search endpoints...]          [Browse all / AI]   │
│                                                     │
│  ☑ create_payment_intent    ★ AI selected           │
│    "Create a PaymentIntent to begin collecting..."  │
│                                                     │
│  ☑ create_customer          ★ AI selected           │
│    "Create a new customer object..."                │
│                                                     │
│  ☐ list_customers                                   │
│    "Returns a list of your customers..."            │
│                                                     │
│  ... (scroll)                                       │
│                                                     │
│  [ ← Back ]              [ Generate & Download → ] │
└─────────────────────────────────────────────────────┘
```

Components:
- `EndpointList.tsx` — danh sách checkboxes với AI badge
- `EndpointSearch.tsx` — filter real-time theo text
- AI pre-selected endpoints được check sẵn và highlight

### Task 2.6 — "Browse all" mode
Toggle giữa:
- **AI Mode:** Chỉ hiện 10–15 endpoints AI chọn (default)
- **Browse All Mode:** Hiện toàn bộ endpoints, có thể search và check thêm

### Task 2.7 — Inline description editor (nice-to-have)
Click vào description → editable textarea → save on blur.

**Checkpoint chiều:** User có thể check/uncheck endpoints và click Generate.

---

## Buổi Tối: Download Flow + Polish

### Task 2.8 — Download zip từ UI
```typescript
async function handleGenerate() {
  setLoading(true);
  const response = await fetch("/api/generate", {
    method: "POST",
    body: JSON.stringify({ specMeta, selectedEndpoints }),
  });

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${specName}-mcp.zip`;
  a.click();
  setLoading(false);
}
```

### Task 2.9 — Loading states + error handling
- Parse: "Fetching and analyzing your OpenAPI spec..."
- AI selection: "AI is selecting the best endpoints..."
- Generate: "Generating your MCP server..."
- Error states: URL không hợp lệ, spec không parse được, network error

### Task 2.10 — Smoke test full flow
1. Paste PetStore URL → parse → select endpoints → download → unzip → `npm start`
2. Paste Stripe URL → parse → select endpoints → download → unzip → test với Cursor

---

## Rủi Ro & Mitigation

| Rủi ro | Xử lý |
|---|---|
| AI selection quá chậm (>10s) | Hiện loading progress; nếu timeout → fallback top-15 |
| Spec quá lớn → timeout Vercel (10s default) | Stream response hoặc dùng background job |
| User upload file lớn (>10MB) | Validate file size trước upload, giới hạn 5MB |
| UI lộn xộn với 300 endpoints | Search + pagination hoặc virtual scroll |

---

## Definition of Done — Day 2

- [ ] `/api/parse` hoạt động với URL input và file upload
- [ ] Endpoint selection UI hiển thị AI-selected endpoints với checkbox
- [ ] Search filter hoạt động real-time
- [ ] "Browse all" mode toggle hoạt động
- [ ] `/api/generate` trả về .zip hợp lệ
- [ ] Download từ UI hoạt động
- [ ] Loading states và error handling đầy đủ
- [ ] Full flow test với Stripe URL thành công
