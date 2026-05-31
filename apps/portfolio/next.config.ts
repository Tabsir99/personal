import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.119"],
  transpilePackages: ["@tabsircg/schemas"],
  images: {
    remotePatterns: [
      { hostname: "media.tabsircg.com", protocol: "https" },
      { hostname: "placehold.co", protocol: "https" },
    ],
    qualities: [75, 100, 50, 25],
    minimumCacheTTL: 900,
  },
};

export default nextConfig;
