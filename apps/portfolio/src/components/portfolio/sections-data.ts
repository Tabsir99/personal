// Header nav metadata. `id` must match a rendered `<section id>` / `<footer id>`.
// Sections are discovered from the DOM by scroll-island; this list is only the
// subset surfaced as nav pills.
export const SECTIONS = [
  { id: "about", label: "About" },
  { id: "stack", label: "Stack" },
  { id: "work", label: "Work" },
  { id: "voices", label: "Voices" },
  { id: "writing", label: "Writing" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

export const BACKGROUND_PLANES = {
  "atm-far": -0.025,
  "atm-mid": -0.1,
  "atm-near": -0.2,
} as const;
