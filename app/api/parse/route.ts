import { NextRequest, NextResponse } from "next/server";
import { parseSpec } from "@/lib/parser";
import { selectEndpoints } from "@/lib/ai-mapper";
import { MOCK_URLS } from "@/lib/mocks/petstore";

export async function POST(req: NextRequest) {
  let url: string;

  try {
    const body = await req.json() as { url?: string };
    url = body.url ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!url || !isValidUrl(url)) {
    return NextResponse.json(
      { error: "Please provide a valid URL to an OpenAPI spec." },
      { status: 400 }
    );
  }

  // Return mock data for known URLs to avoid spending tokens during UI development
  if (MOCK_URLS[url]) {
    return NextResponse.json(MOCK_URLS[url]);
  }

  try {
    const spec = await parseSpec(url);

    // Use AI to pre-select endpoints (mutates spec.endpoints to only selected ones)
    const selectedIds = await selectEndpoints(spec.endpoints, spec.title);
    const selectedSet = new Set(selectedIds);
    spec.endpoints = spec.endpoints.filter((e) => selectedSet.has(e.id));

    return NextResponse.json(spec);
  } catch (err) {
    console.error("Parse error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to parse spec: ${message}` },
      { status: 422 }
    );
  }
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
