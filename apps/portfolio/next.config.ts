import type { NextConfig } from "next";
import analyzer from "@next/bundle-analyzer";

const withAnalyzer = analyzer({ enabled: process.env.ANALYZE === "true" });

// Deploy nudge 2026-06-22: rebuild blog pages after Firestore index deploy (clears stale 404 cache).
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

export default withAnalyzer(nextConfig);
