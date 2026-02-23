import type { OpenAPI } from "openapi-types";
import type { AuthConfig } from "@/types";

/**
 * Detects auth method from an OpenAPI spec's securitySchemes.
 * Supports: HTTP Bearer, API Key in header.
 * Falls back to "none" for OAuth2, OpenID, or missing schemes.
 */
export function detectAuth(spec: OpenAPI.Document): AuthConfig {
  const securitySchemes =
    (spec as Record<string, unknown> & { components?: { securitySchemes?: Record<string, unknown> } })
      .components?.securitySchemes ?? {};

  for (const scheme of Object.values(securitySchemes)) {
    const s = scheme as Record<string, unknown>;

    if (s.type === "http" && s.scheme === "bearer") {
      return {
        type: "bearer",
        envVar: deriveEnvVarName((spec.info?.title ?? "API")),
      };
    }

    if (s.type === "apiKey" && s.in === "header") {
      return {
        type: "apikey",
        envVar: deriveEnvVarName((spec.info?.title ?? "API")),
        headerName: String(s.name ?? "X-API-Key"),
      };
    }
  }

  return { type: "none" };
}

/**
 * Derives an environment variable name from an API title.
 * e.g. "Stripe API" → "STRIPE_API_KEY"
 */
export function deriveEnvVarName(title: string): string {
  const base = title
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  return base.endsWith("_KEY") ? base : `${base}_KEY`;
}
