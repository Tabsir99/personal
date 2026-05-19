// Canonical section list — single source of truth.
// `id` matches the rendered `<section id>`. `num`/`label` drive both the
// left rail (which prints "00 — Index") and the header pill (which filters
// by `inNav` and shows `num` next to `label`).
export const SECTIONS = [
  { id: "hero", num: "00", label: "Index", inNav: false },
  { id: "about", num: "01", label: "About", inNav: true },
  { id: "services", num: "02", label: "Services", inNav: false },
  { id: "work", num: "03", label: "Work", inNav: true },
  { id: "stack", num: "04", label: "Stack", inNav: true },
  { id: "writing", num: "05", label: "Writing", inNav: true },
  { id: "now", num: "06", label: "Now", inNav: true },
  { id: "contact", num: "07", label: "Contact", inNav: false },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];
