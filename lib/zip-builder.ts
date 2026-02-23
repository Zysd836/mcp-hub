import JSZip from "jszip";
import { renderTemplate } from "@/lib/codegen";
import type { GenerateConfig } from "@/types";

/**
 * Builds a .zip buffer containing the full MCP server package:
 * - index.ts (MCP server)
 * - .env.example
 * - configs/cursor.json
 * - configs/claude-desktop.json
 * - README.md
 */
export async function buildZip(config: GenerateConfig): Promise<Buffer> {
  const zip = new JSZip();

  const templateData = buildTemplateData(config);

  zip.file("index.ts", renderTemplate("index.ts.hbs", templateData));
  zip.file(".env.example", renderTemplate("env.example.hbs", templateData));
  zip.file("configs/cursor.json", renderTemplate("cursor.json.hbs", templateData));
  zip.file("configs/claude-desktop.json", renderTemplate("claude-desktop.json.hbs", templateData));
  zip.file("README.md", renderTemplate("README.md.hbs", templateData));
  zip.file("package.json", renderTemplate("package.json.hbs", templateData));

  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

function buildTemplateData(config: GenerateConfig): Record<string, unknown> {
  const { specMeta, tools } = config;
  const { auth } = specMeta;

  return {
    serverName: specMeta.slug,
    title: specMeta.title,
    baseUrl: specMeta.baseUrl,
    authEnvVar: auth.envVar ?? null,
    isBearerAuth: auth.type === "bearer",
    isApiKeyAuth: auth.type === "apikey",
    apiKeyHeaderName: auth.headerName ?? "X-API-Key",
    hasAuth: auth.type !== "none",
    tools: tools.map((tool) => ({
      name: tool.name,
      description: tool.description.replace(/"/g, '\\"'),
      method: tool.endpoint.method,
      path: tool.endpoint.path,
      hasBody: tool.hasBody,
      inputSchemaProperties: JSON.stringify(tool.inputSchemaProperties, null, 6),
      requiredFields: JSON.stringify(tool.requiredFields),
    })),
  };
}
