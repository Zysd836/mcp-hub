# Spec — MCP Hub
### The distribution layer for agent-native APIs

---

## 1. Which theme?

**Agent-Ready Web**

---

## 2. Who is the user?

Two segments, both served by the same product:

**Publisher** — A backend developer / indie hacker who:
- Has a running REST API with an OpenAPI/Swagger spec
- Wants AI agents (Cursor, Claude) to call their API via MCP
- Is not willing to spend hours reading MCP docs, writing boilerplate, or crafting tool descriptions for dozens of endpoints by hand

**Consumer** — An agent builder who:
- Is building an AI agent or workflow that needs to call third-party APIs
- Doesn't want to write an MCP server themselves — just wants one that works
- Browses the registry, installs in one click, starts using immediately

Example publisher: a solo developer with an internal SaaS API whose team is adopting Cursor agents — they want the agent to call their API directly instead of copy-pasting outputs.

Example consumer: a developer building a Cursor agent for e-commerce automation — they need Stripe and Shopify tools without setting up each MCP server from scratch.

> Day 1–3 validates the Publisher segment only. Consumer segment only has value once the registry exists.

---

## 3. What is the problem?

Writing an MCP server is not hard in theory. In practice, three things make developers give up or ship something broken:

1. **Tool descriptions are the real bottleneck.** The quality of each tool's `description` determines whether an agent knows when and how to call it. Developers write them as an afterthought → agents ignore tools or call them in the wrong context. MCP is not a code problem — it's a semantic problem.

2. **Nobody wants to manually map 300 endpoints.** APIs like Stripe have 300+ endpoints. Exposing everything creates noise. Picking the right 10–15 requires judgment that most developers don't have time for.

3. **Output is not production-ready.** Most MCP servers lack `try/catch` on handlers, return raw exceptions, and leave auth as "figure it out yourself" → the server breaks silently and nobody knows why.

And for consumers: **there is no place to find ready-made MCP servers.** They're scattered across GitHub repos with no standard quality, no search, no one-click install.

---

## 4. What is the core flow? (one flow only)

```
Paste OpenAPI spec URL (or upload JSON/YAML)
        ↓
AI analyzes spec → detects auth method → pre-selects 10–15 key endpoints
        ↓
User reviews: check/uncheck endpoints, search across all endpoints, edit tool descriptions
        (fallback: if AI selection looks wrong, user can switch to "browse all" mode)
        ↓
Click "Generate"
        ↓
Download .zip:
  - index.ts                   (MCP server: try/catch + isError on every handler)
  - .env.example               (auth env var with placeholder)
  - configs/
      cursor.json              (Cursor)
      claude-desktop.json      (Claude Desktop)
  - README.md                  (3 steps: copy .env → npm install → npm start)
        ↓
npm start → add config for your client → agent calls API tools directly
```

**Demo target — Phase A (Day 1-2):** Paste Stripe OpenAPI URL → 30 seconds → agent creates a payment intent inside Cursor chat. (Server works with any MCP-compatible client — demo targets: Cursor and Claude Desktop.)

**Demo target — Phase B (Day 3, if registry is built):** Browse MCP Hub Registry → find `stripe-mcp` → click "Install to Cursor" → agent has Stripe tools immediately, no terminal needed.

---

## 5. What is cut to fit 3 days?

| Cut | Reason |
|---|---|
| Input from website URL (no spec) | Unreliable, out of scope |
| Hosted / deployed MCP server | User runs locally — no infra needed for MVP |
| Python or Go output | TypeScript only — most mature MCP SDK |
| OAuth2 auth support | Too complex — edge cases everywhere |
| Version history / rollback | Not needed for MVP |
| Multi-user / login | Single user, no auth on our tool |
| OpenClaw SKILL.md output | Post-MVP |
| Full working registry | Day 3 = static demo page only, not a real registry |

**Only build (non-negotiable):**
- OpenAPI 3.x parser (`swagger-parser`)
- AI mapper: endpoint selection + high-quality description generation
- Codegen: TypeScript MCP server with `try/catch`, `isError`, `.env.example`, auto-generated README
- Auth support: API Key header + Bearer token only (no OAuth2)
- Web UI (Next.js): URL input → endpoint selection (AI pre-select + manual browse all + search + edit) → download .zip
- Multi-client config generation: Cursor + Claude Desktop

**Build if time allows (Day 3):**
- Static registry demo page: hardcoded list of 5–10 generated servers (Stripe, GitHub, Shopify...)
- "Install to Cursor" button: copy config snippet
- Vision demo only — enough to show the direction to judges

---

## 6. The Bigger Vision: Distribution Layer for Agent Tools

The generator is the entry point. The registry is the moat.

After generating, users publish to **MCP Hub Registry** — a public, searchable catalog of MCP servers. Any developer can find and install a pre-built MCP server for Stripe, GitHub, Shopify, or any internal API in one click.

```
Browse registry → find "stripe-mcp" → click "Install to Cursor"
→ .cursor/mcp.json auto-configured
→ Agent has Stripe tools immediately — no terminal, no code
```

**Why this wins long-term:**

MCP Hub is not competing on code generation. A raw OpenAPI importer is easy to build and easy to copy. MCP Hub competes on:
- **Tool quality standardization** — descriptions engineered for agent reasoning, not just copy-pasted from API docs
- **Distribution** — the place where agent builders discover and install tools
- **Trust & discoverability** — curated, rated, versioned servers that agents can rely on
- **Auto-sync** — when an API spec changes, the MCP server updates automatically (Pro feature)

Once agents rely on high-quality curated tools from a trusted registry, a raw importer is not a substitute. That is the moat.

**Business model:**
- Free: generate + publish to public registry
- Pro $29/mo: private registry, auto-sync when spec changes
- Team $99/mo: multiple servers, usage analytics, rollback

**Why now:** MCP was released November 2024. Every major AI platform adopted it within months. There is no dominant registry today. The window to own distribution is open — the same window npm had in 2010, Docker Hub had in 2013.

---

## 7. Unfair Advantage

- **First mover** in the MCP registry space — no dominant player exists today
- **Description engineering focus** — we optimize for agent reasoning quality, not just syntactic correctness; most competitors will stop at codegen
- **Multi-client support** — configs generated for Cursor and Claude Desktop out of the box; server is standard MCP and works with any compatible client
- **Publisher flywheel** — every published server makes the registry more valuable for consumers, who attract more publishers

---

## 8. Key Risks & Mitigation

| Risk | Mitigation |
|---|---|
| Anthropic or Cursor builds a native OpenAPI importer | Focus on registry quality + distribution, not just the generator. Raw import ≠ curated registry. |
| MCP adoption slower than expected | Generator has standalone value even without the registry. Each user gets a working MCP server regardless. |
| AI description quality not significantly better than naive import | This is the core technical bet — invest heavily in prompt engineering on Day 1 and validate with real agent tests. |
| Registry has no content at launch | Pre-populate with 5–10 high-quality hand-crafted servers (Stripe, GitHub, Notion, Shopify) before demo. |

---

## 9. Success Metrics

**North Star:** Number of MCP servers generated that result in a successful agent tool call (not just downloaded — actually used).

**Supporting metrics:**
- % of generated tool descriptions rated "agent-usable" (tool called correctly in first attempt)
- Avg number of tools used per agent session
- Publisher retention: % who generate a second server within 7 days
- Registry install-to-use conversion: % who install a server and make a successful call

---

## 10. Tech Stack

- **Frontend:** Next.js + Tailwind CSS
- **Backend:** Next.js API routes
- **OpenAPI parsing:** `swagger-parser`
- **AI (description generation):** Claude API
- **MCP server output:** `@modelcontextprotocol/sdk` (TypeScript)
- **Deploy:** Vercel

---

## Timeline

**Day 1 — Backend pipeline:**
- Morning: `swagger-parser` setup + codegen template (try/catch + isError + auth + README + mcp.json). Test with PetStore spec (simple, ~20 endpoints).
- Afternoon: AI mapper prompt engineering — iterate until endpoint selection and descriptions are reliable.
- Evening: End-to-end CLI test → run generated MCP server → connect to Cursor → validate agent makes a successful tool call.

**Day 2 — Web UI:**
- Morning: Next.js setup + input form (URL + paste/upload) + wire up to backend API.
- Afternoon: Endpoint selection UI — checkbox list (AI pre-select), search across all endpoints, "browse all" fallback mode.
- Evening: Download .zip (`jszip`) + loading states + smoke test full flow.
- Cut if slow: inline description edit (nice-to-have, not non-negotiable).

**Day 3 — Polish + Demo:**
- Morning: Test Stripe + GitHub spec, fix edge cases from real-world specs.
- Afternoon: Add inline description edit if not done, rehearse full demo end-to-end in Cursor.
- Evening: Buffer for bug fixes. Static registry demo page if time allows.
