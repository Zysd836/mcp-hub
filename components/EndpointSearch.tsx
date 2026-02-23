"use client";

interface EndpointSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function EndpointSearch({ value, onChange }: EndpointSearchProps) {
  return (
    <div className="relative flex-1">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
        style={{ color: "var(--color-text-muted)" }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search endpoints..."
        className="w-full rounded-xl py-2.5 pl-9 pr-8 text-sm outline-none transition-all duration-200"
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
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm transition-opacity hover:opacity-60"
          style={{ color: "var(--color-text-muted)" }}
        >
          ×
        </button>
      )}
    </div>
  );
}
