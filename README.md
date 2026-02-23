# MCP Hub

> Make any API callable by AI agents — in 30 seconds.

MCP Hub turns your OpenAPI spec into a production-ready [MCP server](https://modelcontextprotocol.io) that AI agents (Cursor, Claude, GPT) can call directly. No boilerplate. No manual endpoint mapping. No bad tool descriptions.

**[Try it live →](#)** · [Read the spec](./spec.md)

---

## The problem

AI agents can now take real actions — but only if the tools are built right.

Most developers who try to expose their API to agents run into the same wall:

- MCP server boilerplate is tedious to write
- Picking which 10 endpoints to expose out of 300 requires judgment
- Tool `description` quality determines whether agents actually use the tool — and most descriptions are terrible
- Generated code breaks silently: no error handling, auth left as an exercise

The result: developers skip MCP entirely, or ship a server that agents can't reliably use.

---

## The solution

Paste your OpenAPI spec URL. MCP Hub does the rest.

```
Input:  https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json

Output: stripe-mcp/
        ├── index.ts         ← production-ready MCP server
        ├── .env.example     ← STRIPE_API_KEY=sk_test_...
        ├── .cursor/mcp.json ← drop into Cursor, done
        └── README.md        ← 3-step setup
```

**From URL to agent-callable API in 30 seconds.**

---

## Features

**AI-powered endpoint selection**
Automatically picks the 10–15 most useful endpoints from your spec. Override anything — search across all endpoints, check/uncheck, reorder.

**Description engineering, not just description copying**
The quality of a tool's `description` determines whether an agent knows when and how to call it. MCP Hub writes descriptions optimized for agent reasoning — not copy-pasted from API docs.

**Production-ready output**
Every tool handler ships with `try/catch`, returns `isError: true` on failure, and formats responses cleanly. Agents can recover from errors. Nothing breaks silently.

**Auth-aware**
Detects Bearer and API Key auth from your spec. Generates a `.env.example` with the right variable names. No more "figure out auth yourself."

**Cursor-first**
Output includes a pre-configured `.cursor/mcp.json`. Add it to your project, restart Cursor, and your agent has access to your API immediately.

---

## Demo

```bash
# 1. Generate your MCP server at mcphub.dev
# 2. Download and unzip

cd stripe-mcp
cp .env.example .env        # add STRIPE_API_KEY
npm install
npm start
# ✓ MCP server running on port 3001

# 3. Add .cursor/mcp.json to your project
# 4. Open Cursor chat:
```

> *"Create a $50 payment intent for john@example.com"*

Cursor agent calls `create_payment_intent` → returns payment intent ID. Done.

---

## Why descriptions matter

Most OpenAPI-to-MCP tools do a mechanical mapping. The result:

```
❌  name: "create_payment_intent"
    description: "Create a PaymentIntent."
```

That's not enough for an agent to understand context, parameters, or when to use this tool over another.

MCP Hub produces:

```
✅  name: "create_payment_intent"
    description: "Create a PaymentIntent to begin collecting payment from a
                  customer. Use this before confirming a charge. Requires amount
                  in the smallest currency unit (e.g. 100 = $1.00 USD).
                  Returns a client_secret for front-end confirmation."
```

This is the difference between an agent that works and one that doesn't.

---

## The registry

The generator is the entry point. The registry is where this becomes a platform.

**MCP Hub Registry** is a public catalog of pre-built, curated MCP servers. Any developer can browse, install, and use them in Cursor with one click — no setup, no terminal.

```
Search "stripe" → stripe-mcp v1.4 → Install to Cursor
→ .cursor/mcp.json auto-configured
→ Agent has Stripe tools. No code written.
```

Think npm, but for AI agent tools. The more servers get published, the more useful it becomes for every agent builder.

---

## Built for

- **Backend developers** who want agents to use their API without writing MCP boilerplate
- **Indie hackers** shipping side projects and want Cursor agents to interact with them
- **Agent builders** who need reliable, well-described tools for third-party APIs

---

## Stack

Next.js · Tailwind · Claude API · `swagger-parser` · `@modelcontextprotocol/sdk`

---

## Status

Early MVP — built in 3 days.

- [x] OpenAPI 3.x parser
- [x] AI endpoint selector + description generator
- [x] TypeScript MCP server codegen
- [x] Error handling + auth injection + auto README
- [x] Web UI
- [ ] Public registry
- [ ] Auto-sync on spec change
- [ ] Private registry (Pro)
