import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Các package Node.js-only không được bundle bởi webpack
  serverExternalPackages: [
    "@apidevtools/swagger-parser",
    "handlebars",
    "jszip",
  ],
};

export default nextConfig;
