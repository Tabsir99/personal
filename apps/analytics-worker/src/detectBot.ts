import type { BotCategory } from "@tabsircg/schemas/analytics";

export interface BotResult {
  is_bot: 1 | 0;
  bot_category: BotCategory;
  bot_name: string;
}

interface BotSignature {
  pattern: RegExp;
  name: string;
  category: BotCategory;
}

const BOT_SIGNATURES: BotSignature[] = [
  { pattern: /chatgpt-user/, name: "ChatGPT-User", category: "answer_fetch" },
  { pattern: /perplexity-user/, name: "Perplexity-User", category: "answer_fetch" },
  { pattern: /claude-user/, name: "Claude-User", category: "answer_fetch" },
  { pattern: /claude-web/, name: "Claude-Web", category: "answer_fetch" },
  { pattern: /meta-externalfetcher/, name: "Meta-ExternalFetcher", category: "answer_fetch" },
  { pattern: /duckassistbot/, name: "DuckAssistBot", category: "answer_fetch" },
  { pattern: /mistralai-user/, name: "MistralAI-User", category: "answer_fetch" },

  { pattern: /gptbot/, name: "GPTBot", category: "training" },
  { pattern: /claudebot|anthropic-ai/, name: "ClaudeBot", category: "training" },
  { pattern: /ccbot/, name: "CCBot", category: "training" },
  { pattern: /bytespider/, name: "Bytespider", category: "training" },
  { pattern: /meta-externalagent/, name: "Meta-ExternalAgent", category: "training" },
  { pattern: /facebookbot/, name: "FacebookBot", category: "training" },
  { pattern: /omgili/, name: "Omgilibot", category: "training" },
  { pattern: /ai2bot/, name: "AI2Bot", category: "training" },
  { pattern: /img2dataset/, name: "img2dataset", category: "training" },
  { pattern: /cohere/, name: "cohere-ai", category: "training" },

  { pattern: /perplexitybot/, name: "PerplexityBot", category: "ai_crawler" },
  { pattern: /youbot/, name: "YouBot", category: "ai_crawler" },
  { pattern: /amazonbot/, name: "Amazonbot", category: "ai_crawler" },
  { pattern: /diffbot/, name: "Diffbot", category: "ai_crawler" },
  { pattern: /firecrawl/, name: "Firecrawl", category: "ai_crawler" },
  { pattern: /timpibot/, name: "Timpibot", category: "ai_crawler" },

  { pattern: /oai-searchbot/, name: "OAI-SearchBot", category: "search_index" },
  { pattern: /googlebot|google-inspectiontool|googleother|storebot-google/, name: "Googlebot", category: "search_index" },
  { pattern: /bingpreview/, name: "BingPreview", category: "search_index" },
  { pattern: /bingbot|msnbot|adidxbot/, name: "Bingbot", category: "search_index" },
  { pattern: /duckduckbot|duckduckgo/, name: "DuckDuckBot", category: "search_index" },
  { pattern: /yandex/, name: "YandexBot", category: "search_index" },
  { pattern: /baiduspider/, name: "Baiduspider", category: "search_index" },
  { pattern: /applebot/, name: "Applebot", category: "search_index" },
  { pattern: /petalbot/, name: "PetalBot", category: "search_index" },
  { pattern: /sogou/, name: "Sogou", category: "search_index" },
  { pattern: /seznambot/, name: "SeznamBot", category: "search_index" },
  { pattern: /naver|yeti\//, name: "NaverBot", category: "search_index" },
  { pattern: /slurp/, name: "Yahoo! Slurp", category: "search_index" },
  { pattern: /exabot/, name: "Exabot", category: "search_index" },

  { pattern: /ahrefs/, name: "AhrefsBot", category: "seo" },
  { pattern: /semrush/, name: "SemrushBot", category: "seo" },
  { pattern: /mj12bot/, name: "MJ12bot", category: "seo" },
  { pattern: /dotbot/, name: "DotBot", category: "seo" },
  { pattern: /rogerbot/, name: "rogerbot", category: "seo" },
  { pattern: /dataforseo/, name: "DataForSeoBot", category: "seo" },
  { pattern: /blexbot/, name: "BLEXBot", category: "seo" },
  { pattern: /barkrowler/, name: "Barkrowler", category: "seo" },
  { pattern: /serpstat/, name: "serpstatbot", category: "seo" },
  { pattern: /screaming frog/, name: "Screaming Frog", category: "seo" },
  { pattern: /zoominfobot/, name: "ZoominfoBot", category: "seo" },

  { pattern: /facebookexternalhit|facebookcatalog|facebot/, name: "facebookexternalhit", category: "social" },
  { pattern: /twitterbot/, name: "Twitterbot", category: "social" },
  { pattern: /linkedinbot/, name: "LinkedInBot", category: "social" },
  { pattern: /slackbot|slack-imgproxy/, name: "Slackbot", category: "social" },
  { pattern: /discordbot/, name: "Discordbot", category: "social" },
  { pattern: /telegrambot/, name: "TelegramBot", category: "social" },
  { pattern: /whatsapp/, name: "WhatsApp", category: "social" },
  { pattern: /pinterest/, name: "Pinterestbot", category: "social" },
  { pattern: /redditbot/, name: "redditbot", category: "social" },
  { pattern: /skypeuripreview/, name: "SkypeUriPreview", category: "social" },
  { pattern: /vkshare/, name: "vkShare", category: "social" },
  { pattern: /embedly|iframely/, name: "Embedly", category: "social" },
  { pattern: /mastodon|akkoma|pleroma/, name: "Mastodon", category: "social" },

  { pattern: /uptimerobot/, name: "UptimeRobot", category: "monitoring" },
  { pattern: /pingdom/, name: "Pingdom", category: "monitoring" },
  { pattern: /statuscake/, name: "StatusCake", category: "monitoring" },
  { pattern: /betteruptime|betterstack/, name: "BetterStack", category: "monitoring" },
  { pattern: /site24x7/, name: "Site24x7", category: "monitoring" },
  { pattern: /newrelicpinger/, name: "NewRelicPinger", category: "monitoring" },
  { pattern: /datadog/, name: "Datadog", category: "monitoring" },
  { pattern: /gtmetrix/, name: "GTmetrix", category: "monitoring" },
  { pattern: /chrome-lighthouse|lighthouse/, name: "Lighthouse", category: "monitoring" },
  { pattern: /uptime-kuma/, name: "Uptime Kuma", category: "monitoring" },
  { pattern: /hetrixtools/, name: "HetrixTools", category: "monitoring" },
  { pattern: /checkly/, name: "Checkly", category: "monitoring" },
  { pattern: /ptst\//, name: "WebPageTest", category: "monitoring" },

  { pattern: /archive\.org_bot|ia_archiver|wayback|heritrix/, name: "Internet Archive", category: "archive" },

  { pattern: /headlesschrome/, name: "HeadlessChrome", category: "tooling" },
  { pattern: /puppeteer/, name: "Puppeteer", category: "tooling" },
  { pattern: /playwright/, name: "Playwright", category: "tooling" },
  { pattern: /selenium|webdriver/, name: "Selenium", category: "tooling" },
  { pattern: /phantomjs/, name: "PhantomJS", category: "tooling" },
  { pattern: /scrapy/, name: "Scrapy", category: "tooling" },
  { pattern: /curl|libcurl/, name: "curl", category: "tooling" },
  { pattern: /wget/, name: "Wget", category: "tooling" },
  { pattern: /python-requests|python-urllib|aiohttp|httpx/, name: "Python", category: "tooling" },
  { pattern: /postmanruntime/, name: "Postman", category: "tooling" },
  { pattern: /httpie/, name: "HTTPie", category: "tooling" },
  { pattern: /go-http-client/, name: "Go-http-client", category: "tooling" },
  { pattern: /okhttp|apache-httpclient|java\//, name: "Java", category: "tooling" },
  { pattern: /node-fetch|undici|axios/, name: "Node", category: "tooling" },
  { pattern: /guzzlehttp|php\//, name: "PHP", category: "tooling" },
  { pattern: /libwww-perl|lwp::/, name: "libwww-perl", category: "tooling" },
  { pattern: /restsharp/, name: "RestSharp", category: "tooling" },
  { pattern: /ruby$|ruby\//, name: "Ruby", category: "tooling" },
  { pattern: /wordpress\//, name: "WordPress", category: "tooling" },
  { pattern: /censys|internetmeasurement|expanse/, name: "Censys", category: "tooling" },
  { pattern: /shodan/, name: "Shodan", category: "tooling" },
  { pattern: /zgrab|masscan|nmap/, name: "zgrab", category: "tooling" },
  { pattern: /nuclei|nikto|sqlmap|wpscan/, name: "Nuclei", category: "tooling" },
];

const UNNAMED_BOT_SIGNALS = [
  "bot",
  "crawler",
  "crawl",
  "spider",
  "scraper",
  "fetcher",
  "monitor",
  "checker",
  "validator",
  "archiver",
  "indexer",
  "scan",
] as const;

const BOT_NAME_LIMIT = 64;
const AGENT_TOKEN_SEPARATORS = /[\s;,()]+/;

function namedAgentFor(ua: string, signal: string): string {
  const token = ua
    .split(AGENT_TOKEN_SEPARATORS)
    .find((candidate) => candidate.toLowerCase().includes(signal));
  if (!token) return signal;
  const withoutVersion = token.split("/")[0];
  return (withoutVersion || signal).slice(0, BOT_NAME_LIMIT);
}

export function detectBot(ua: string): BotResult {
  const lower = ua.toLowerCase();

  for (const signature of BOT_SIGNATURES) {
    if (signature.pattern.test(lower)) {
      return {
        is_bot: 1,
        bot_category: signature.category,
        bot_name: signature.name,
      };
    }
  }

  for (const signal of UNNAMED_BOT_SIGNALS) {
    if (lower.includes(signal)) {
      return {
        is_bot: 1,
        bot_category: "generic",
        bot_name: namedAgentFor(ua, signal),
      };
    }
  }

  return { is_bot: 0, bot_category: "generic", bot_name: "" };
}
