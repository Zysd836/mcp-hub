// Shared TypeScript interfaces for MCP Hub

export interface AuthConfig {
  type: "bearer" | "apikey" | "none";
  /** Environment variable name, e.g. STRIPE_API_KEY */
  envVar?: string;
  /** Header name for apikey auth, e.g. "X-API-Key" */
  headerName?: string;
}

export interface ParameterMeta {
  name: string;
  in: "query" | "path" | "header" | "cookie";
  required: boolean;
  description?: string;
  schema?: Record<string, unknown>;
}

export interface EndpointMeta {
  /** Unique ID derived from method + path, e.g. "post_/v1/payment_intents" */
  id: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  summary?: string;
  description?: string;
  operationId?: string;
  parameters: ParameterMeta[];
  requestBodySchema?: Record<string, unknown>;
  responseSchema?: Record<string, unknown>;
  tags?: string[];
}

export interface ParsedSpec {
  title: string;
  version: string;
  baseUrl: string;
  auth: AuthConfig;
  endpoints: EndpointMeta[];
  /** Slug derived from title, e.g. "stripe-api" → "stripe-api" */
  slug: string;
}

export interface ToolConfig {
  /** Snake_case tool name, e.g. "create_payment_intent" */
  name: string;
  /** Agent-optimized description (2–4 sentences, max 300 chars) */
  description: string;
  /** The original endpoint this tool is based on */
  endpoint: EndpointMeta;
  /** JSON Schema properties for input */
  inputSchemaProperties: Record<string, unknown>;
  requiredFields: string[];
  /** Whether this tool sends a request body */
  hasBody: boolean;
}

export interface GenerateConfig {
  specMeta: {
    title: string;
    slug: string;
    baseUrl: string;
    auth: AuthConfig;
  };
  tools: ToolConfig[];
}
