import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { cgd: 'src/index.ts' },
    format: ['iife'],
    outDir: 'dist',
    minify: true,
    clean: true,
    target: 'es2020',
    outExtension: () => ({ js: '.js' }),
  },
  {
    entry: { sdk: 'src/sdk.ts', react: 'src/react.tsx', middleware: 'src/middleware/index.ts' },
    format: ['esm'],
    outDir: 'dist',
    dts: true,
    minify: false,
    clean: false,
    target: 'es2020',
    external: ['react'],
  },
]);
