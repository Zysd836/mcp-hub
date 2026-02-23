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
        console.log("🚀 --------------------------------🚀")
        console.log("🚀 ~ handleGenerate ~ data:", data)
        console.log("🚀 --------------------------------🚀")
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
        <div className="flex items-center gap-3 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <span
            className="h-4 w-4 rounded-full border-2 border-t-transparent animate-spin inline-block"
            style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }}
          />
          Loading...
        </div>
      </main>
    );
  }

  const endpoints = filteredEndpoints();

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Ambient orbs */}
      <div
        className="pointer-events-none fixed -top-48 -right-48 h-160 w-160 rounded-full blur-3xl"
        style={{ background: "var(--gradient-primary)", opacity: 0.12 }}
      />
      <div
        className="pointer-events-none fixed -bottom-48 -left-32 h-130 w-130 rounded-full blur-3xl"
        style={{ background: "var(--gradient-fire)", opacity: 0.08 }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <button
              onClick={() => router.push("/")}
              className="text-xs font-medium transition-opacity hover:opacity-60"
              style={{ color: "var(--color-text-muted)" }}
            >
              ← Back
            </button>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
              {spec.title}
            </h1>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              <span className="gradient-text font-bold">{selectedIds.size}</span>{" "}
              tool{selectedIds.size !== 1 ? "s" : ""} selected
              {spec.baseUrl && <span> · {spec.baseUrl}</span>}
            </p>
          </div>

          {spec.auth && (
            <div
              className="glass-primary shrink-0 rounded-xl px-3 py-2 text-xs font-semibold"
              style={{ color: "var(--color-primary)" }}
            >
              {spec.auth.type === "apikey" ? "🔑 API Key" : spec.auth.type}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <EndpointSearch value={searchQuery} onChange={setSearchQuery} />
          <button
            onClick={() => setBrowseAll((v) => !v)}
            className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200"
            style={
              browseAll
                ? {
                    background: "var(--color-primary-muted)",
                    border: "1px solid rgba(255,77,77,0.3)",
                    color: "var(--color-primary)",
                  }
                : {
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                    color: "var(--color-text-secondary)",
                    backdropFilter: "blur(var(--glass-blur))",
                  }
            }
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

        {/* Sticky footer */}
        <div className="sticky bottom-0 pt-4" style={{ borderTop: "1px solid var(--glass-border)" }}>
          <div className="glass rounded-2xl p-4 space-y-3" style={{ backdropFilter: "blur(24px)" }}>
            {error && (
              <p
                className="rounded-xl px-4 py-2.5 text-sm font-medium"
                style={{
                  color: "var(--color-primary)",
                  background: "var(--color-primary-muted)",
                  border: "1px solid rgba(255,77,77,0.25)",
                }}
              >
                {error}
              </p>
            )}
            <button
              onClick={handleGenerate}
              disabled={generating || selectedIds.size === 0}
              className="w-full rounded-xl px-6 py-3.5 text-sm font-bold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "var(--gradient-primary)",
                boxShadow: generating || selectedIds.size === 0 ? "none" : "0 0 28px var(--color-primary-glow)",
              }}
            >
              {generating
                ? "Generating your MCP server..."
                : `Generate & Download (${selectedIds.size} tools)`}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
