// Stub for `@open-notion/editor` during Vitest runs. The real package ships a
// broken sub-path import (`./renderers/react`) that node's ESM resolver
// rejects. We never use anything from this package at runtime in the modules
// being tested — only `DocContent` as a type — so a no-op module is enough.
export {};
