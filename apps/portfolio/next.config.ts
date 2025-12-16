import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "media.tabsircg.com", protocol: "https" }],
    qualities: [75, 100, 50, 25],
    minimumCacheTTL: 900,
  },
};

export default nextConfig;
