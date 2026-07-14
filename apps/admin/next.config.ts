import type { NextConfig } from "next";
import { withPremiumDS } from "premium-ds/next";

const nextConfig: NextConfig = {
  transpilePackages: ["@tabsircg/schemas"],
  logging: { serverFunctions: false },
  devIndicators: false,

  images: {
    remotePatterns: [
      { hostname: "localhost" },
      { hostname: "storage.googleapis.com" },
      { hostname: "images.tabsircg.com" },
      { hostname: "media.tabsircg.com" },
    ],
  },
};

export default withPremiumDS(nextConfig);
