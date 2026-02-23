"use client";

import type { EndpointMeta } from "@/types";

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-100 text-blue-700",
  POST: "bg-green-100 text-green-700",
  PUT: "bg-yellow-100 text-yellow-700",
  PATCH: "bg-orange-100 text-orange-700",
  DELETE: "bg-red-100 text-red-700",
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
      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-10 text-center text-sm text-gray-400">
        No endpoints found.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
      {endpoints.map((endpoint) => {
        const isSelected = selectedIds.has(endpoint.id);
        return (
          <label
            key={endpoint.id}
            className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${
              isSelected ? "bg-white" : "bg-gray-50/40"
            }`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggle(endpoint.id)}
              className="mt-1 h-4 w-4 rounded border-gray-300 accent-gray-900"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`rounded px-1.5 py-0.5 text-xs font-mono font-semibold ${
                    METHOD_COLORS[endpoint.method] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {endpoint.method}
                </span>
                <span className="text-sm font-mono text-gray-700 truncate">{endpoint.path}</span>
                {showAiBadge && isSelected && (
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700 font-medium">
                    AI selected
                  </span>
                )}
              </div>
              {endpoint.summary && (
                <p className="mt-0.5 text-sm text-gray-500 truncate">{endpoint.summary}</p>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}
