import { NextRequest, NextResponse } from "next/server";
import { generateDescriptions } from "@/lib/ai-mapper";
import { buildZip } from "@/lib/zip-builder";
import type { EndpointMeta, GenerateConfig } from "@/types";

interface GenerateRequestBody {
  specMeta: GenerateConfig["specMeta"];
  selectedEndpoints: EndpointMeta[];
}

export async function POST(req: NextRequest) {
  let body: GenerateRequestBody;

  try {
    body = await req.json() as GenerateRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { specMeta, selectedEndpoints } = body;

  if (!specMeta || !selectedEndpoints || selectedEndpoints.length === 0) {
    return NextResponse.json(
      { error: "specMeta and at least one selectedEndpoint are required." },
      { status: 400 }
    );
  }

  try {
    // Generate AI-optimized descriptions for each selected endpoint
    const tools = await generateDescriptions(selectedEndpoints);

    const config: GenerateConfig = { specMeta, tools };
    const zipBuffer = await buildZip(config);

    // Convert Buffer to Uint8Array for NextResponse compatibility
    const uint8 = new Uint8Array(zipBuffer);

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${specMeta.slug}-mcp.zip"`,
        "Content-Length": String(uint8.byteLength),
      },
    });
  } catch (err) {
    console.error("Generate error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Generation failed: ${message}` },
      { status: 500 }
    );
  }
}

// Vercel timeout: 60s for Pro, 10s for Hobby
export const maxDuration = 60;
