import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: { remotePatterns: [{ hostname: "images.tabsircg.com" }] },
};

export default nextConfig;
