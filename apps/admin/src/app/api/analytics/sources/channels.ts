// Order matters: patterns are matched top-down, first hit wins. Channels whose
// domains embed a generic search-engine token (Email's mail.google/mail.yahoo,
// AI's gemini.google) MUST precede Search, or Search's "google"/"yahoo" steals
// them.
const CHANNELS = [
  {
    name: "Email",
    patterns: [
      "mail.google",
      "outlook.live",
      "outlook.office",
      "mail.yahoo",
      "protonmail",
      "proton.me",
      "mail.zoho",
    ],
  },
  {
    name: "AI",
    patterns: [
      "chatgpt",
      "chat.openai",
      "perplexity",
      "claude.ai",
      "gemini.google",
      "copilot.microsoft",
      "poe.com",
      "you.com",
      "phind.com",
    ],
  },
  {
    name: "Search",
    patterns: [
      "google",
      "bing",
      "duckduckgo",
      "yahoo",
      "baidu",
      "yandex",
      "ecosia",
      "brave.com/search",
      "startpage",
      "sogou",
      "naver",
      "qwant",
      "searx",
      "swisscows",
      "mojeek",
    ],
  },
  {
    name: "Social",
    patterns: [
      "facebook",
      "instagram",
      "twitter",
      "x.com",
      "linkedin",
      "reddit",
      "threads.net",
      "mastodon",
      "bluesky",
      "bsky.app",
      "pinterest",
      "tiktok",
      "tumblr",
      "snapchat",
    ],
  },
  {
    name: "Video",
    patterns: ["youtube", "vimeo", "twitch", "dailymotion", "rumble"],
  },
  {
    name: "Messaging",
    patterns: [
      "whatsapp",
      "web.telegram",
      "t.me",
      "discord",
      "slack",
      "signal",
      "messenger.com",
    ],
  },
  {
    name: "News",
    patterns: [
      "news.",
      "newsletter.",
      "medium.com",
      "dev.to",
      "substack",
      "hashnode",
      "lobste.rs",
      "slashdot",
      "techmeme",
      "theresanaiforthat",
    ],
  },
  {
    name: "Referral",
    patterns: [],
  },
] as const;

export function buildChannelSQL(field: string): string {
  const conditions: string[] = [];
  const lower = `lower(${field})`;

  for (const ch of CHANNELS) {
    if (ch.patterns.length === 0) continue;
    const checks = ch.patterns
      .map((p) => `${lower} LIKE '%${p}%'`)
      .join(" OR ");
    conditions.push(`${checks}, '${ch.name}'`);
  }

  return `multiIf(${field} = '', 'Direct', ${conditions.join(", ")}, 'Referral')`;
}
