"use client";

import { useState } from "react";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  loading: boolean;
}

const EXAMPLE_URLS = [
  "https://petstore3.swagger.io/api/v3/openapi.json",
  "https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json",
];

export default function UrlInput({ onSubmit, loading }: UrlInputProps) {
  const [url, setUrl] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = url.trim();
    if (trimmed) onSubmit(trimmed);
  }

  const isReady = !loading && url.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label
        className="block text-xs font-bold uppercase tracking-widest"
        style={{ color: "var(--color-text-muted)" }}
      >
        OpenAPI Spec URL
      </label>

      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://your-api.com/openapi.json"
          required
          disabled={loading}
          className="flex-1 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 disabled:opacity-50"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            color: "var(--color-text-primary)",
            backdropFilter: "blur(var(--glass-blur))",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--color-primary)";
            e.target.style.boxShadow = "0 0 0 3px var(--color-primary-muted)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--glass-border)";
            e.target.style.boxShadow = "none";
          }}
        />
        <button
          type="submit"
          disabled={!isReady}
          className="rounded-xl px-6 py-3 text-sm font-bold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: "var(--gradient-primary)",
            boxShadow: isReady ? "0 0 24px var(--color-primary-glow)" : "none",
          }}
        >
          {loading ? "Analyzing..." : "Generate →"}
        </button>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          Try:
        </span>
        {EXAMPLE_URLS.map((exUrl) => (
          <button
            key={exUrl}
            type="button"
            onClick={() => setUrl(exUrl)}
            className="text-xs truncate max-w-xs transition-opacity hover:opacity-70"
            style={{ color: "var(--color-primary)" }}
          >
            {exUrl.split("/").pop()}
          </button>
        ))}
      </div>
    </form>
  );
}
