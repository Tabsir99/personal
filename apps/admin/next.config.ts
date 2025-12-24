import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { hostname: "localhost" },
      { hostname: "storage.googleapis.com" },
      { hostname: "images.tabsircg.com" },
      { hostname: "media.tabsircg.com" },
    ],
  },
};

export default nextConfig;
