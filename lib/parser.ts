import SwaggerParser from "@apidevtools/swagger-parser";
import type { OpenAPI, OpenAPIV3 } from "openapi-types";
import type { ParsedSpec, EndpointMeta, ParameterMeta } from "@/types";
import { detectAuth } from "@/lib/auth-detector";

/**
 * Parses an OpenAPI spec from a URL or file path.
 * Dereferences all $ref pointers before returning.
 */
export async function parseSpec(urlOrPath: string): Promise<ParsedSpec> {
  const api = (await SwaggerParser.dereference(urlOrPath)) as OpenAPI.Document;

  const info = api.info;
  const title = info?.title ?? "Unknown API";
  const version = info?.version ?? "0.0.0";
  const baseUrl = extractBaseUrl(api);
  const auth = detectAuth(api);
  const endpoints = extractEndpoints(api);

  return {
    title,
    version,
    baseUrl,
    auth,
    endpoints,
    slug: toSlug(title),
  };
}

function extractBaseUrl(api: OpenAPI.Document): string {
  // OpenAPI 3.x
  const v3 = api as OpenAPIV3.Document;
  if (v3.servers && v3.servers.length > 0) {
    return v3.servers[0].url.replace(/\/$/, "");
  }
  return "";
}

function extractEndpoints(api: OpenAPI.Document): EndpointMeta[] {
  const paths = (api as OpenAPIV3.Document).paths ?? {};
  const endpoints: EndpointMeta[] = [];
  const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!pathItem) continue;

    for (const method of HTTP_METHODS) {
      const operation = pathItem[method] as OpenAPIV3.OperationObject | undefined;
      if (!operation) continue;

      const parameters = ((operation.parameters ?? []) as OpenAPIV3.ParameterObject[]).map(
        (p): ParameterMeta => ({
          name: p.name,
          in: p.in as ParameterMeta["in"],
          required: p.required ?? false,
          description: p.description,
          schema: p.schema as Record<string, unknown> | undefined,
        })
      );

      const requestBodySchema = extractRequestBodySchema(operation.requestBody as OpenAPIV3.RequestBodyObject | undefined);
      const responseSchema = extractResponseSchema(operation.responses);

      endpoints.push({
        id: `${method}_${path}`,
        method: method.toUpperCase() as EndpointMeta["method"],
        path,
        summary: operation.summary,
        description: operation.description,
        operationId: operation.operationId,
        parameters,
        requestBodySchema,
        responseSchema,
        tags: operation.tags,
      });
    }
  }

  return endpoints;
}

function extractRequestBodySchema(
  requestBody: OpenAPIV3.RequestBodyObject | undefined
): Record<string, unknown> | undefined {
  if (!requestBody) return undefined;
  const content = requestBody.content?.["application/json"];
  return content?.schema as Record<string, unknown> | undefined;
}

function extractResponseSchema(
  responses: OpenAPIV3.ResponsesObject | undefined
): Record<string, unknown> | undefined {
  if (!responses) return undefined;
  const success = (responses["200"] ?? responses["201"]) as OpenAPIV3.ResponseObject | undefined;
  if (!success) return undefined;
  const content = success.content?.["application/json"];
  return content?.schema as Record<string, unknown> | undefined;
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
