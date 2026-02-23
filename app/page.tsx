"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UrlInput from "@/components/UrlInput";
import type { ParsedSpec } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(url: string) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      const spec = await res.json() as ParsedSpec;
      sessionStorage.setItem("parsedSpec", JSON.stringify(spec));
      router.push("/generate");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-8 text-center">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            MCP Hub
          </h1>
          <p className="text-xl text-gray-500">
            Make any API callable by AI agents — in 30 seconds.
          </p>
        </div>

        {/* Input */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
          <UrlInput onSubmit={handleSubmit} loading={loading} />

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}

          {loading && (
            <p className="mt-3 text-sm text-gray-500 animate-pulse">
              Fetching and analyzing your OpenAPI spec...
            </p>
          )}
        </div>

        {/* Feature hints */}
        <div className="grid grid-cols-3 gap-4 text-sm text-gray-500">
          <div className="space-y-1">
            <div className="font-medium text-gray-700">AI endpoint selection</div>
            <div>Picks the 10–15 most useful tools automatically</div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-gray-700">Description engineering</div>
            <div>Optimized for agent reasoning, not just docs</div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-gray-700">Production-ready</div>
            <div>try/catch, auth, Cursor + Claude Desktop configs</div>
          </div>
        </div>
      </div>
    </main>
  );
}
