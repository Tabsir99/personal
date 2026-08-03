import {
  BROWSER_ENGINE_MARKERS,
  CRAWLER_SIGNATURES,
  UNNAMED_CRAWLER_SIGNALS,
  type CrawlerCategory,
} from './signatures';

export interface Crawler {
  name: string;
  category: CrawlerCategory;
}

const CRAWLER_NAME_LIMIT = 64;
const AGENT_TOKEN_SEPARATORS = /[\s;,()]+/;

function looksLikeBrowser(lowerUserAgent: string): boolean {
  return BROWSER_ENGINE_MARKERS.some((marker) => marker.test(lowerUserAgent));
}

function namedAgentFor(userAgent: string, signal: string): string {
  const token = userAgent.split(AGENT_TOKEN_SEPARATORS).find((candidate) => candidate.toLowerCase().includes(signal));
  if (!token) return signal;
  const withoutVersion = token.split('/')[0];
  return (withoutVersion || signal).slice(0, CRAWLER_NAME_LIMIT);
}

export function classifyCrawler(userAgent: string | null | undefined): Crawler | null {
  if (!userAgent) return null;
  const lower = userAgent.toLowerCase();

  for (const signature of CRAWLER_SIGNATURES) {
    if (signature.pattern.test(lower)) {
      return { name: signature.name, category: signature.category };
    }
  }

  if (looksLikeBrowser(lower)) return null;

  for (const signal of UNNAMED_CRAWLER_SIGNALS) {
    if (lower.includes(signal)) {
      return { name: namedAgentFor(userAgent, signal), category: 'generic' };
    }
  }

  return null;
}
