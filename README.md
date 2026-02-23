# MCP Hub

**The distribution layer for agent-native APIs.**

Paste your OpenAPI spec → get a production-ready MCP server in 30 seconds → your API is callable by any AI agent.

---

## What is this?

[Model Context Protocol (MCP)](https://modelcontextprotocol.io) is the standard that lets AI agents (Cursor, Claude, GPT) call external tools and APIs. Building an MCP server from scratch is tedious — you have to read the docs, write boilerplate, pick which endpoints to expose, and write high-quality tool descriptions that agents actually understand.

**MCP Hub automates all of that.**

---

## How it works

1. **Paste** your OpenAPI spec URL (or upload a JSON/YAML file)
2. **Review** the AI-suggested tool selection — check/uncheck endpoints, edit descriptions
3. **Generate** — download a `.zip` with a ready-to-run TypeScript MCP server
4. **Run** locally and connect to Cursor in 3 commands

```bash
cp .env.example .env   # add your API key
npm install
npm start              # MCP server running on port 3001
```

5. **Use** — paste the included `.cursor/mcp.json` config into Cursor. Your agent can now call your API.

---

## What's in the generated `.zip`

```
{your-api}-mcp/
├── index.ts              ← MCP server with error handling on every tool
├── package.json
├── tsconfig.json
├── .env.example          ← YOUR_API_KEY=your_key_here
├── .cursor/
│   └── mcp.json          ← drop this into your Cursor project
└── README.md             ← 3-step setup guide
```

Every generated tool handler includes:
- `try/catch` — no raw exceptions thrown to the agent
- `isError: true` on failures — agent knows when a call fails and can recover
- Proper response formatting — only relevant fields, not a 200-field dump

---

## Why not just import OpenAPI directly?

Most tools that convert OpenAPI to MCP do a mechanical mapping — every endpoint becomes a tool with a description copy-pasted from the API docs.

That doesn't work well for agents. Agents rely on `description` to decide *when* and *how* to call a tool. A description like `"Create payment"` is not enough. A description like `"Create a PaymentIntent to begin collecting payment from a customer. Use this before confirming a charge. Requires amount in smallest currency unit (e.g. cents for USD)"` is what makes an agent actually useful.

MCP Hub uses AI to write descriptions optimized for agent reasoning — not just API documentation.

---

## The bigger vision: "npm for MCP"

The generator is the entry point. The registry is the moat.

After generating, publish your MCP server to **MCP Hub Registry** — a public, searchable catalog. Any developer can find and install a pre-built MCP server for Stripe, GitHub, Shopify, or your API — in one click.

```
Browse registry → find "stripe-mcp" → click "Install to Cursor"
→ agent has Stripe tools immediately, no setup needed
```

---

## Status

This project was built as a 3-day MVP hackathon project.

| Feature | Status |
|---|---|
| OpenAPI 3.x parser (JSON + YAML) | ✅ Done |
| AI endpoint selector + description generator | ✅ Done |
| TypeScript MCP server codegen | ✅ Done |
| Error handling + auth injection | ✅ Done |
| Web UI (Next.js) | ✅ Done |
| Registry browse page (static demo) | 🔜 In progress |

---

## Tech stack

- **Frontend:** Next.js + Tailwind CSS
- **Backend:** Next.js API routes
- **OpenAPI parsing:** `swagger-parser`
- **AI:** Claude API
- **MCP output:** `@modelcontextprotocol/sdk` (TypeScript)
- **Deploy:** Vercel

---

## Demo

Live demo: _coming soon_

Demo cases: Stripe API · GitHub API · PetStore

---

## Spec

See [spec.md](./spec.md) for the full product spec.
