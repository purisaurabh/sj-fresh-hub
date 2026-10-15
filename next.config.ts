import type { NextConfig } from "next";

const tunnelHosts = [
  "*.devtunnels.ms",
  "**.devtunnels.ms",
  "*.inc1.devtunnels.ms",
  "*.asse.devtunnels.ms",
  "*.eastus2.rel.tunnels.api.visualstudio.com",
];

const nextConfig: NextConfig = {
  // Cache Components + Partial Prefetch crash every request on Cloudflare Workers (Error 1101).
  // https://github.com/vercel/next.js/issues/100122
  allowedDevOrigins: tunnelHosts,
  experimental: {
    serverActions: {
      allowedOrigins: [...tunnelHosts, "*.workers.dev"],
    },
  },
  serverExternalPackages: ["web-push"],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
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

void import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
