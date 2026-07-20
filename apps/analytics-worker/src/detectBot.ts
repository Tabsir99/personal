import { classifyAICrawlerUserAgent } from "@datafast/ai-crawl";

export interface BotResult {
  is_bot: 1 | 0;
  bot_category: string;
  bot_name: string;
}

const GENERIC_BOT_PATTERNS = [
  "bot",
  "crawl",
  "spider",
  "slurp",
  "mediapartners",
  "feedfetcher",
  "wget",
  "curl",
  "python-requests",
  "go-http",
  "java/",
  "node-fetch",
  "axios",
  "postman",
  "httpclient",
] as const;

export function detectBot(ua: string): BotResult {
  const aiMatch = classifyAICrawlerUserAgent(ua);
  if (aiMatch) {
    return {
      is_bot: 1,
      bot_category: aiMatch.category,
      bot_name: aiMatch.agent,
    };
  }

  const lower = ua.toLowerCase();
  for (const pattern of GENERIC_BOT_PATTERNS) {
    if (lower.includes(pattern)) {
      return { is_bot: 1, bot_category: "generic", bot_name: pattern };
    }
  }

  return { is_bot: 0, bot_category: "", bot_name: "" };
}
