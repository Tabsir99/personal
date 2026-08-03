import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'tracker',
          include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
          exclude: ['src/middleware/**'],
          environment: 'happy-dom',
          environmentOptions: {
            happyDOM: { url: 'https://example.com/' },
          },
        },
      },
      {
        test: {
          name: 'middleware',
          include: ['src/middleware/**/*.test.ts'],
          environment: 'node',
        },
      },
    ],
  },
});
