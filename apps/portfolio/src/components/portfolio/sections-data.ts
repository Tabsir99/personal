// `id` must match a rendered `<section id>`/`<footer id>`. scroll-island finds
// sections in the DOM; this is only the subset surfaced as nav pills.
export const SECTIONS = [
  { id: "about", label: "About" },
  { id: "stack", label: "Stack" },
  { id: "services", label: "Services" },
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
