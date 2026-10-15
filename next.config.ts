import type { NextConfig } from "next";

const tunnelHosts = [
  "*.devtunnels.ms",
  "**.devtunnels.ms",
  "*.inc1.devtunnels.ms",
  "*.asse.devtunnels.ms",
  "*.eastus2.rel.tunnels.api.visualstudio.com",
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  allowedDevOrigins: tunnelHosts,
  experimental: {
    serverActions: {
      allowedOrigins: tunnelHosts,
    },
  },
  serverExternalPackages: ["web-push"],
  images: {
    formats: ["image/avif", "image/webp"],
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
