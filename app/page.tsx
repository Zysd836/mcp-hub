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
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 overflow-hidden">
      {/* Ambient orbs */}
      <div
        className="pointer-events-none fixed -top-48 -right-48 h-160 w-160 rounded-full blur-3xl"
        style={{ background: "var(--gradient-primary)", opacity: 0.18 }}
      />
      <div
        className="pointer-events-none fixed -bottom-64 -left-48 h-130 w-130 rounded-full blur-3xl"
        style={{ background: "var(--gradient-fire)", opacity: 0.12 }}
      />
      <div
        className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-200 w-200 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(255,77,77,0.04) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 w-full max-w-2xl space-y-10 text-center">
        {/* Live badge */}
        <div className="flex justify-center">
          <span
            className="glass-primary inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--color-primary)" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ background: "var(--color-primary)" }}
            />
            Now in Beta
          </span>
        </div>

        {/* Headline */}
        <div className="space-y-5">
          <h1 className="text-5xl font-extrabold tracking-tight leading-[1.1] sm:text-6xl">
            Make any API{" "}
            <span className="gradient-text">AI-ready</span>
            <br />
            in 30 seconds.
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            Paste your OpenAPI spec URL. Get a production-ready MCP server —
            AI-curated tools, agent-optimized descriptions, full auth support.
          </p>
        </div>

        {/* Input card */}
        <div className="glass-card p-6 text-left">
          <UrlInput onSubmit={handleSubmit} loading={loading} />

          {error && (
            <p
              className="mt-3 rounded-xl px-4 py-2.5 text-sm font-medium"
              style={{
                color: "var(--color-primary)",
                background: "var(--color-primary-muted)",
                border: "1px solid rgba(255,77,77,0.25)",
              }}
            >
              {error}
            </p>
          )}

          {loading && (
            <p
              className="mt-3 text-sm animate-pulse"
              style={{ color: "var(--color-text-muted)" }}
            >
              Fetching and analyzing your OpenAPI spec...
            </p>
          )}
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: "⚡",
              title: "AI endpoint selection",
              desc: "Picks the 10–15 most useful tools automatically",
            },
            {
              icon: "🧠",
              title: "Description engineering",
              desc: "Optimized for agent reasoning, not just docs",
            },
            {
              icon: "🚀",
              title: "Production-ready",
              desc: "try/catch, auth, Cursor + Claude Desktop configs",
            },
          ].map((f) => (
            <div key={f.title} className="glass rounded-2xl p-4 text-left space-y-2">
              <div className="text-2xl">{f.icon}</div>
              <div
                className="text-sm font-semibold leading-snug"
                style={{ color: "var(--color-text-primary)" }}
              >
                {f.title}
              </div>
              <div
                className="text-xs leading-relaxed"
                style={{ color: "var(--color-text-muted)" }}
              >
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
