"use client";

interface EndpointSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function EndpointSearch({ value, onChange }: EndpointSearchProps) {
  return (
    <div className="relative flex-1">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
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
        className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4
                   text-sm placeholder:text-gray-400 focus:border-gray-900
                   focus:outline-none focus:ring-1 focus:ring-gray-900"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      )}
    </div>
  );
}
