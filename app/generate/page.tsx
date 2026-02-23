"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EndpointList from "@/components/EndpointList";
import EndpointSearch from "@/components/EndpointSearch";
import type { ParsedSpec, EndpointMeta } from "@/types";

export default function GeneratePage() {
  const router = useRouter();
  const [spec, setSpec] = useState<ParsedSpec | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [browseAll, setBrowseAll] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("parsedSpec");
    if (!raw) {
      router.push("/");
      return;
    }
    const parsed = JSON.parse(raw) as ParsedSpec;
    setSpec(parsed);
    // Pre-select all endpoints (AI selection happens in /api/parse)
    setSelectedIds(new Set(parsed.endpoints.map((e) => e.id)));
  }, [router]);

  function toggleEndpoint(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function filteredEndpoints(): EndpointMeta[] {
    if (!spec) return [];
    const pool = browseAll ? spec.endpoints : spec.endpoints.filter((e) => selectedIds.has(e.id));
    if (!searchQuery) return pool;
    const q = searchQuery.toLowerCase();
    return pool.filter(
      (e) =>
        e.path.toLowerCase().includes(q) ||
        (e.summary ?? "").toLowerCase().includes(q) ||
        e.method.toLowerCase().includes(q)
    );
  }

  async function handleGenerate() {
    if (!spec || selectedIds.size === 0) return;
    setGenerating(true);
    setError(null);

    const selected = spec.endpoints.filter((e) => selectedIds.has(e.id));

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specMeta: {
            title: spec.title,
            slug: spec.slug,
            baseUrl: spec.baseUrl,
            auth: spec.auth,
          },
          selectedEndpoints: selected,
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${spec.slug}-mcp.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  if (!spec) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  const endpoints = filteredEndpoints();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{spec.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {selectedIds.size} tool{selectedIds.size !== 1 ? "s" : ""} selected
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <EndpointSearch value={searchQuery} onChange={setSearchQuery} />
        <button
          onClick={() => setBrowseAll((v) => !v)}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            browseAll
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
          }`}
        >
          {browseAll ? "AI selection" : "Browse all"}
        </button>
      </div>

      {/* Endpoint list */}
      <EndpointList
        endpoints={endpoints}
        selectedIds={selectedIds}
        onToggle={toggleEndpoint}
        showAiBadge={!browseAll}
      />

      {/* Generate button */}
      <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-100">
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        <button
          onClick={handleGenerate}
          disabled={generating || selectedIds.size === 0}
          className="w-full rounded-xl bg-gray-900 px-6 py-3 text-white font-semibold
                     hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
        >
          {generating ? "Generating your MCP server..." : `Generate & Download (${selectedIds.size} tools)`}
        </button>
      </div>
    </main>
  );
}
