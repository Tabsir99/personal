// Canonical section list — single source of truth.
// `id` matches the rendered `<section id>`. `num`/`label` drive both the
// left rail (which prints "00 — Index") and the header pill (which filters
// by `inNav` and shows `num` next to `label`).
export const SECTIONS = [
  { id: "hero", label: "Index", inNav: false },
  { id: "about", label: "About", inNav: true },
  { id: "stack", label: "Stack", inNav: true },
  { id: "services", label: "Services", inNav: false },
  { id: "work", label: "Work", inNav: true },
  { id: "writing", label: "Writing", inNav: true },
  { id: "now", label: "Now", inNav: true },
  { id: "contact", label: "Contact", inNav: false },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];
