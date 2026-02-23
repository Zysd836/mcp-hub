"use client";

import type { EndpointMeta } from "@/types";

const METHOD_STYLES: Record<string, { bg: string; color: string }> = {
  GET:    { bg: "rgba(59,130,246,0.12)",  color: "#60a5fa" },
  POST:   { bg: "rgba(34,197,94,0.12)",   color: "#4ade80" },
  PUT:    { bg: "rgba(234,179,8,0.12)",   color: "#facc15" },
  PATCH:  { bg: "rgba(249,115,22,0.12)",  color: "#fb923c" },
  DELETE: { bg: "rgba(255,77,77,0.15)",   color: "#FF4D4D" },
};

interface EndpointListProps {
  endpoints: EndpointMeta[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  showAiBadge?: boolean;
}

export default function EndpointList({
  endpoints,
  selectedIds,
  onToggle,
  showAiBadge = false,
}: EndpointListProps) {
  if (endpoints.length === 0) {
    return (
      <div
        className="glass rounded-2xl px-4 py-10 text-center text-sm"
        style={{ color: "var(--color-text-muted)" }}
      >
        No endpoints found.
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden" style={{ borderColor: "var(--glass-border)" }}>
      {endpoints.map((endpoint) => {
        const isSelected = selectedIds.has(endpoint.id);
        const methodStyle = METHOD_STYLES[endpoint.method] ?? { bg: "rgba(128,128,128,0.12)", color: "#888" };

        return (
          <label
            key={endpoint.id}
            className="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors duration-150"
            style={{
              background: isSelected ? "rgba(255,77,77,0.04)" : "transparent",
              borderBottom: "1px solid var(--glass-border)",
            }}
          >
            {/* Checkbox */}
            <div className="mt-0.5 shrink-0">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(endpoint.id)}
                className="sr-only"
              />
              <div
                className="h-4 w-4 rounded flex items-center justify-center transition-all duration-150"
                style={{
                  background: isSelected ? "var(--gradient-primary)" : "var(--glass-bg)",
                  border: isSelected ? "none" : "1px solid var(--glass-border)",
                  boxShadow: isSelected ? "0 0 8px var(--color-primary-glow)" : "none",
                }}
              >
                {isSelected && (
                  <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 10 10">
                    <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="rounded px-1.5 py-0.5 text-xs font-mono font-bold"
                  style={{ background: methodStyle.bg, color: methodStyle.color }}
                >
                  {endpoint.method}
                </span>
                <span
                  className="text-sm font-mono truncate"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {endpoint.path}
                </span>
                {showAiBadge && isSelected && (
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{
                      background: "rgba(168,85,247,0.12)",
                      color: "#c084fc",
                    }}
                  >
                    AI selected
                  </span>
                )}
              </div>
              {endpoint.summary && (
                <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
                  {endpoint.summary}
                </p>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}
