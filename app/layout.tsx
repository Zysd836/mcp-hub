import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MCP Hub — Make any API callable by AI agents",
  description:
    "Turn your OpenAPI spec into a production-ready MCP server in 30 seconds. AI-powered endpoint selection and description engineering.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
