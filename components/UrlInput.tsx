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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (trimmed) onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-left text-sm font-medium text-gray-700">
        OpenAPI spec URL
      </label>
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://your-api.com/openapi.json"
          required
          disabled={loading}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5
                     text-sm placeholder:text-gray-400 focus:border-gray-900
                     focus:outline-none focus:ring-1 focus:ring-gray-900
                     disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold
                     text-white hover:bg-gray-700 disabled:opacity-50
                     disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Analyzing..." : "Generate →"}
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className="text-xs text-gray-400">Try:</span>
        {EXAMPLE_URLS.map((exUrl) => (
          <button
            key={exUrl}
            type="button"
            onClick={() => setUrl(exUrl)}
            className="text-xs text-blue-600 hover:underline truncate max-w-xs"
          >
            {exUrl.split("/").pop()}
          </button>
        ))}
      </div>
    </form>
  );
}
