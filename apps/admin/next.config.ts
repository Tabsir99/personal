import type { NextConfig } from "next";
import { withPremiumDS } from "premium-ds/next";
import { fileURLToPath } from "node:url";
import { dirname, resolve, relative } from "node:path";

const nextConfig: NextConfig = {
  transpilePackages: ["@tabsircg/schemas", "@tabsircg/analytics"],
  logging: { serverFunctions: false },
  devIndicators: false,
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { hostname: "localhost" },
      { hostname: "storage.googleapis.com" },
      { hostname: "images.tabsircg.com" },
      { hostname: "media.tabsircg.com" },
    ],
  },
};

const config = withPremiumDS(nextConfig);

if (config.turbopack) {
  const analyticsPkgDir =
    "/home/tabsir/ap/reactp/tabsircg/analytics/packages/analytics";
  const projectDir = dirname(fileURLToPath(import.meta.url));

  config.turbopack.resolveAlias = {
    ...config.turbopack.resolveAlias,
    "@tabsircg/analytics": relative(
      projectDir,
      resolve(analyticsPkgDir, "src/index.ts"),
    ),
    "@tabsircg/analytics/sdk": relative(
      projectDir,
      resolve(analyticsPkgDir, "src/sdk.ts"),
    ),
    "@tabsircg/analytics/react": relative(
      projectDir,
      resolve(analyticsPkgDir, "src/react.tsx"),
    ),
  };
}

export default config;
