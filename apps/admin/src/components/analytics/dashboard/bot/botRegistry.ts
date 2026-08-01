import {
  MagnifyingGlass,
  ChatCircleDots,
  GraduationCap,
  Robot,
  Bug,
  ChartLineUp,
  ShareNetwork,
  Heartbeat,
  Terminal,
  Archive as ArchiveIcon,
  type Icon,
} from "@phosphor-icons/react";
import type { BotCategory } from "@tabsircg/schemas/analytics";

export interface CategoryMeta {
  label: string;
  icon: Icon;
}

export const BOT_CATEGORIES: Record<BotCategory, CategoryMeta> = {
  search_index: { label: "Indexing", icon: MagnifyingGlass },
  answer_fetch: { label: "Answers", icon: ChatCircleDots },
  training: { label: "Training", icon: GraduationCap },
  ai_crawler: { label: "AI", icon: Robot },
  seo: { label: "SEO", icon: ChartLineUp },
  social: { label: "Previews", icon: ShareNetwork },
  monitoring: { label: "Monitors", icon: Heartbeat },
  tooling: { label: "Scripts", icon: Terminal },
  archive: { label: "Archives", icon: ArchiveIcon },
  generic: { label: "Other", icon: Bug },
};

export function categoryMeta(category: BotCategory): CategoryMeta {
  return BOT_CATEGORIES[category] ?? BOT_CATEGORIES.generic;
}

interface Provider {
  match: RegExp;
  domain: string;
  color: string;
}

// A stored bot_name (agent) is matched to a favicon domain + brand colour. The
// label stays the raw agent name — accurate when categories are mixed in one
// list. First match wins; unknown agents fall back to their category colour.
const PROVIDERS: Provider[] = [
  {
    match: /gptbot|chatgpt|oai-|openai/i,
    domain: "openai.com",
    color: "#000000",
  },
  { match: /claude|anthropic/i, domain: "anthropic.com", color: "#d97757" },
  {
    match: /gemini|google-extended|googlebot|google/i,
    domain: "google.com",
    color: "#4285f4",
  },
  { match: /perplexity/i, domain: "perplexity.ai", color: "#20808d" },
  { match: /bing|msnbot/i, domain: "bing.com", color: "#0078d4" },
  { match: /duckduck/i, domain: "duckduckgo.com", color: "#de5833" },
  {
    match: /bytespider|bytedance|tiktok/i,
    domain: "bytedance.com",
    color: "#3c8cff",
  },
  { match: /ccbot|commoncrawl/i, domain: "commoncrawl.org", color: "#f97316" },
  { match: /amazonbot|amazon/i, domain: "amazon.com", color: "#ff9900" },
  { match: /applebot|apple/i, domain: "apple.com", color: "#6b7280" },
  { match: /meta-|facebook|facebot/i, domain: "meta.com", color: "#0866ff" },
  { match: /yandex/i, domain: "yandex.com", color: "#fc3f1d" },
  { match: /mistral/i, domain: "mistral.ai", color: "#fa520f" },
];

export interface BotMeta {
  label: string;
  domain: string | null;
  /** Brand colour for a known provider; null → fall back to the wash token. */
  color: string | null;
}

export function resolveBot(name: string): BotMeta {
  const provider = PROVIDERS.find((p) => p.match.test(name));
  return {
    label: name,
    domain: provider?.domain ?? null,
    color: provider?.color ?? null,
  };
}

// Apply an alpha to a `#rgb`/`#rrggbb` or `rgb(...)` colour → `rgba(...)`.
export function withAlpha(color: string, alpha: number): string {
  if (color.startsWith("rgb(")) {
    return color.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
  }
  const hex = color.replace("#", "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Background tint for a bot accent: a known brand colour at `alpha`, otherwise
// the single primary wash token.
export function botTint(color: string | null, alpha: number): string {
  return color ? withAlpha(color, alpha) : "var(--accent-wash)";
}
