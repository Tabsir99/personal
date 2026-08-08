export const INTRO_DURATION_MS = 2400;

const phase = (fraction: number) => Math.round(INTRO_DURATION_MS * fraction);

export const MORPH_AT_MS = phase(0.66);
export const HERO_HANDOFF_MS = phase(0.5);

export const RING_STAGGER_MS = (index: number) => phase(0.007 + index * 0.0083);
