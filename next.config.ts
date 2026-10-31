import type { NextConfig } from "next";

// Product photos are served from the Cloudflare R2 public URL; allow next/image to optimise them.
const r2Host = process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL) : null;

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: r2Host
      ? [
          {
            protocol: r2Host.protocol.replace(":", "") as "https" | "http",
            hostname: r2Host.hostname,
            port: r2Host.port,
            pathname: `${r2Host.pathname.replace(/\/$/, "")}/products/**`,
          },
        ]
      : [],
  },
  experimental: {
    // Admin product photo uploads (up to 8 × 4 MB per request).
    serverActions: { bodySizeLimit: "34mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
