// Stub for the `server-only` package used during Vitest runs.
// At runtime in Next.js this module throws if imported from a Client Component
// bundle. In unit tests we run server code directly in Node, so the marker is
// a no-op.
export {};
