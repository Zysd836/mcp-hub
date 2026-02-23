# Kế Hoạch Triển Khai — MCP Hub

> Biến bất kỳ API nào thành công cụ cho AI agent — trong 30 giây.

---

## Tổng Quan Dự Án

**MCP Hub** là nền tảng chuyển đổi OpenAPI spec thành MCP server sẵn sàng production, giúp AI agent (Cursor, Claude, GPT) gọi API trực tiếp. Không boilerplate. Không mapping endpoint thủ công. Không mô tả tool kém chất lượng.

### Hai Phân Khúc Người Dùng

| Phân khúc | Mô tả | Vấn đề cần giải quyết |
|---|---|---|
| **Publisher** | Backend dev / indie hacker có REST API với OpenAPI spec | Không muốn tốn hàng giờ đọc docs MCP, viết boilerplate, tự craft tool descriptions |
| **Consumer** | Agent builder cần gọi third-party API | Không muốn tự viết MCP server — chỉ cần một cái hoạt động ngay |

> **Ưu tiên MVP:** Validate Publisher segment trước. Consumer segment chỉ có giá trị khi registry tồn tại.

---

## Ba Vấn Đề Cốt Lõi

1. **Tool descriptions là nút thắt thực sự** — Chất lượng `description` quyết định agent có biết khi nào và cách nào gọi tool. Developer viết descriptions qua loa → agent bỏ qua tool hoặc gọi sai context.

2. **Không ai muốn map thủ công 300 endpoints** — API như Stripe có 300+ endpoints. Expose tất cả tạo noise. Phải chọn đúng 10–15 cái cần sự phán đoán mà không phải dev nào cũng có thời gian.

3. **Output không production-ready** — Hầu hết MCP server thiếu `try/catch`, trả về exception thô, bỏ auth tự giải quyết → server lặng lẽ fail.

---

## Luồng Chính (Core Flow)

```
1. Paste OpenAPI spec URL (hoặc upload JSON/YAML)
        ↓
2. AI phân tích spec → phát hiện auth method → pre-select 10–15 endpoints quan trọng
        ↓
3. User review: check/uncheck endpoints, search, edit tool descriptions
   (fallback: "browse all" mode nếu AI selection sai)
        ↓
4. Click "Generate"
        ↓
5. Download .zip:
   - index.ts              (MCP server: try/catch + isError mọi handler)
   - .env.example          (auth env var với placeholder)
   - configs/
       cursor.json         (Cursor)
       claude-desktop.json (Claude Desktop)
   - README.md             (3 bước: copy .env → npm install → npm start)
        ↓
6. npm start → thêm config cho client → agent gọi API tools trực tiếp
```

---

## Mục Tiêu Demo

- **Phase A (Day 1–2):** Paste Stripe OpenAPI URL → 30 giây → agent tạo payment intent trong Cursor chat.
- **Phase B (Day 3, nếu còn thời gian):** Browse MCP Hub Registry → tìm `stripe-mcp` → click "Install to Cursor" → agent có Stripe tools ngay, không cần terminal.

---

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | Next.js + Tailwind CSS |
| Backend | Next.js API routes |
| OpenAPI parsing | `swagger-parser` |
| AI (description gen) | Claude API |
| MCP server output | `@modelcontextprotocol/sdk` (TypeScript) |
| Deploy | Vercel |
| Zip generation | `jszip` |

---

## Phạm Vi MVP (Không Cắt)

- [x] OpenAPI 3.x parser (`swagger-parser`)
- [x] AI mapper: endpoint selection + high-quality description generation
- [x] Codegen: TypeScript MCP server với `try/catch`, `isError`, `.env.example`, auto-generated README
- [x] Auth support: API Key header + Bearer token (không có OAuth2)
- [x] Web UI: URL input → endpoint selection → download .zip
- [x] Multi-client config: Cursor + Claude Desktop

## Cắt Bỏ Khỏi MVP

| Tính năng | Lý do |
|---|---|
| Input từ website URL (không có spec) | Không đáng tin, ngoài scope |
| Hosted / deployed MCP server | User chạy local — không cần infra |
| Output Python hoặc Go | TypeScript only — MCP SDK trưởng thành nhất |
| OAuth2 auth support | Quá phức tạp — edge cases khắp nơi |
| Version history / rollback | Không cần cho MVP |
| Multi-user / login | Single user, không auth trên tool của mình |
| Registry đầy đủ | Day 3 = static demo page only |

---

*Xem chi tiết từng ngày: [day1.md](./day1.md) · [day2.md](./day2.md) · [day3.md](./day3.md)*
*Xem kiến trúc kỹ thuật: [kien-truc.md](./kien-truc.md)*
