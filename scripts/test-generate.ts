/**
 * CLI test script — runs the full pipeline without a web browser.
 *
 * Usage:
 *   npm run test:generate
 *   # or
 *   npx tsx scripts/test-generate.ts
 *
 * Requires ANTHROPIC_API_KEY in .env.local
 */

import { config } from "dotenv";
import { resolve } from "path";
import { writeFileSync, mkdirSync } from "fs";

// Load .env.local
config({ path: resolve(process.cwd(), ".env.local") });

import { parseSpec } from "../lib/parser";
import { selectEndpoints, generateDescriptions } from "../lib/ai-mapper";
import { buildZip } from "../lib/zip-builder";
import type { GenerateConfig } from "../types";

const TEST_SPEC_URL =
  process.argv[2] ?? "https://petstore3.swagger.io/api/v3/openapi.json";

async function main() {
  console.log(`\n🔍 Parsing spec: ${TEST_SPEC_URL}`);
  const spec = await parseSpec(TEST_SPEC_URL);
  console.log(`✓ Parsed: "${spec.title}" — ${spec.endpoints.length} endpoints found`);
  console.log(`  Auth: ${spec.auth.type}${spec.auth.envVar ? ` (${spec.auth.envVar})` : ""}`);
  console.log(`  Base URL: ${spec.baseUrl}`);

  console.log("\n🤖 Selecting endpoints with AI...");
  const selectedIds = await selectEndpoints(spec.endpoints, spec.title);
  const selectedEndpoints = spec.endpoints.filter((e) => selectedIds.includes(e.id));
  console.log(`✓ Selected ${selectedEndpoints.length} endpoints:`);
  for (const e of selectedEndpoints) {
    console.log(`  ${e.method.padEnd(6)} ${e.path}`);
  }

  console.log("\n✍️  Generating AI descriptions...");
  const tools = await generateDescriptions(selectedEndpoints);
  console.log(`✓ Generated ${tools.length} tool descriptions:`);
  for (const t of tools) {
    console.log(`  ${t.name}: "${t.description.slice(0, 80)}..."`);
  }

  console.log("\n📦 Building zip...");
  const config: GenerateConfig = {
    specMeta: {
      title: spec.title,
      slug: spec.slug,
      baseUrl: spec.baseUrl,
      auth: spec.auth,
    },
    tools,
  };
  const zip = await buildZip(config);

  const outDir = resolve(process.cwd(), "test-output");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, `${spec.slug}-mcp.zip`);
  writeFileSync(outPath, zip);

  console.log(`✓ Written: ${outPath} (${(zip.length / 1024).toFixed(1)} KB)`);
  console.log(`\n✅ Done! Run the server:`);
  console.log(`   cd test-output && unzip ${spec.slug}-mcp.zip -d ${spec.slug}`);
  console.log(`   cd ${spec.slug} && cp .env.example .env && npm install && npm start`);
}

main().catch((err) => {
  console.error("\n❌ Error:", err);
  process.exit(1);
});
