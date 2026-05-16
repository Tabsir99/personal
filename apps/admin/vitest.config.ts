import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Neutralize Next's `server-only` marker so server modules can be unit-tested.
      "server-only": path.resolve(__dirname, "./vitest/server-only.stub.ts"),
      // The real `@open-notion/editor` ships a broken subpath that node's ESM
      // resolver can't load. We only use it for types, so swap in a no-op.
      "@open-notion/editor": path.resolve(
        __dirname,
        "./vitest/open-notion-editor.stub.ts",
      ),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    setupFiles: ["./vitest/setup.ts"],
    // Integration tests call Claude (web search + reasoning) — 3-minute cap.
    testTimeout: 180_000,
  },
});
