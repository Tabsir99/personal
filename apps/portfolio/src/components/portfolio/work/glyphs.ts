// Glyph + style tables for the Work section. The glyph itself is intentionally
// not part of the CMS schema — it's purely a visual decorator. We pick one
// deterministically per project based on its `tag`, falling back to a rotation
// by position so untagged projects still get a varied look.

const TAG_GLYPHS: Record<string, string> = {
  Operations: "◢",
  Tooling: "◇",
  Observability: "◐",
  Audio: "◉",
  Habit: "◔",
  Platform: "◢",
  Design: "◇",
  Data: "◐",
};

const FALLBACK_GLYPHS = ["◢", "◇", "◐", "◉", "◔"];

export function glyphFor(tag: string, index: number): string {
  return (
    TAG_GLYPHS[tag] ?? FALLBACK_GLYPHS[index % FALLBACK_GLYPHS.length]
  );
}

export const GLYPH_TINTS: Record<string, { tint: string; tint2: string }> = {
  "◢": { tint: "oklch(0.34 0.06 38)", tint2: "oklch(0.22 0.02 38)" },
  "◇": { tint: "oklch(0.32 0.04 80)", tint2: "oklch(0.20 0.015 80)" },
  "◐": { tint: "oklch(0.30 0.04 140)", tint2: "oklch(0.20 0.012 140)" },
  "◉": { tint: "oklch(0.30 0.05 210)", tint2: "oklch(0.18 0.015 210)" },
  "◔": { tint: "oklch(0.30 0.04 320)", tint2: "oklch(0.18 0.015 320)" },
};

export const LINK_ICONS: Record<string, string> = {
  live: "↗",
  repo: "⟨/⟩",
  "case-study": "¶",
  video: "▶",
  other: "→",
};

export const ROW_STATUS_STYLES: Record<string, string> = {
  shipped: "text-phosphor border-phosphor/35",
  "in-progress": "text-accent border-accent/40",
  archived: "text-muted-2 line-through decoration-line decoration-1",
  discontinued: "text-muted-2 opacity-60",
};

export const LINK_BG: Record<string, string> = {
  live: "bg-accent/6",
};
