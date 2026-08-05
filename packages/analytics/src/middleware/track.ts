import { API_URL, MAX_HREF_LENGTH } from '../constants';
import { classifyCrawler, type Crawler } from './classify';
import type { CrawlerCategory } from './signatures';

export interface CrawlerTrackingConfig {
  websiteId: string;
  ingestToken?: string;
  domain?: string;
  apiUrl?: string;
  publicOrigin?: string;
  enabled?: boolean;
  excludeCategories?: CrawlerCategory[];
  methods?: string[];
  shouldTrack?: (url: URL, crawler: Crawler) => boolean;
  getIp?: (request: Request) => string | null | undefined;
  fetch?: typeof fetch;
  timeoutMs?: number;
  debug?: boolean;
}

export type CrawlerSkipReason =
  | 'disabled'
  | 'missing_website_id'
  | 'method_not_tracked'
  | 'not_a_crawler'
  | 'category_excluded'
  | 'invalid_url'
  | 'url_too_long'
  | 'static_fetch_destination'
  | 'path_rejected'
  | 'network_error'
  | 'api_error';

export interface CrawlerTrackingResult {
  tracked: boolean;
  scheduled?: boolean;
  reason?: CrawlerSkipReason;
  crawler?: Crawler;
  status?: number;
}

interface CrawlerTrackingDecision extends CrawlerTrackingResult {
  url?: URL;
  userAgent?: string;
}

export type WaitUntil = (promise: Promise<unknown>) => void;
export type WaitUntilTarget = WaitUntil | { waitUntil?: WaitUntil } | null | undefined;

const DEFAULT_TIMEOUT_MS = 1500;
const DEFAULT_METHODS = ['GET', 'HEAD'];

const IP_HEADERS = [
  'cf-connecting-ip',
  'x-real-ip',
  'true-client-ip',
  'fastly-client-ip',
  'fly-client-ip',
  'x-vercel-forwarded-for',
  'x-forwarded-for',
];

const STATIC_FETCH_DESTINATIONS = new Set([
  'audio', 'embed', 'font', 'image', 'manifest', 'object', 'script', 'style', 'track', 'video', 'worker',
]);

function requestUrl(request: Request, config: CrawlerTrackingConfig): URL | null {
  try {
    const url = new URL(request.url);
    if (!config.publicOrigin) return url;
    const rebuilt = new URL(new URL(config.publicOrigin).origin);
    rebuilt.pathname = url.pathname;
    rebuilt.search = url.search;
    return rebuilt;
  } catch {
    return null;
  }
}

function crawlerIp(request: Request, config: CrawlerTrackingConfig): string {
  const raw = config.getIp?.(request) || IP_HEADERS.map((header) => request.headers.get(header)).find(Boolean);
  const first = raw?.split(',')[0]?.trim();
  if (!first) return '';
  return first.startsWith('::ffff:') ? first.slice('::ffff:'.length) : first;
}

function allowedByHook(config: CrawlerTrackingConfig, url: URL, crawler: Crawler): boolean {
  if (!config.shouldTrack) return true;
  try {
    return config.shouldTrack(url, crawler) !== false;
  } catch {
    return false;
  }
}

function isTrackable(decision: CrawlerTrackingDecision): boolean {
  return Boolean(decision.crawler && decision.url);
}

export function inspectCrawlerRequest(request: Request, config: CrawlerTrackingConfig): CrawlerTrackingDecision {
  if (config.enabled === false) return { tracked: false, reason: 'disabled' };
  if (!config.websiteId) return { tracked: false, reason: 'missing_website_id' };

  const methods = config.methods ?? DEFAULT_METHODS;
  if (!methods.includes(request.method.toUpperCase())) {
    return { tracked: false, reason: 'method_not_tracked' };
  }

  const userAgent = request.headers.get('user-agent') ?? '';
  const crawler = classifyCrawler(userAgent);
  if (!crawler) return { tracked: false, reason: 'not_a_crawler' };

  if (config.excludeCategories?.includes(crawler.category)) {
    return { tracked: false, reason: 'category_excluded', crawler };
  }

  const url = requestUrl(request, config);
  if (!url || (url.protocol !== 'http:' && url.protocol !== 'https:')) {
    return { tracked: false, reason: 'invalid_url', crawler };
  }
  if (url.href.length > MAX_HREF_LENGTH) {
    return { tracked: false, reason: 'url_too_long', crawler };
  }

  const fetchDestination = (request.headers.get('sec-fetch-dest') ?? '').toLowerCase();
  if (STATIC_FETCH_DESTINATIONS.has(fetchDestination)) {
    return { tracked: false, reason: 'static_fetch_destination', crawler };
  }

  if (!allowedByHook(config, url, crawler)) {
    return { tracked: false, reason: 'path_rejected', crawler };
  }

  return { tracked: false, crawler, url, userAgent };
}

async function post(
  request: Request,
  config: CrawlerTrackingConfig,
  decision: CrawlerTrackingDecision
): Promise<CrawlerTrackingResult> {
  const { crawler, url } = decision;
  if (!crawler || !url) return decision;

  const fetchImpl = config.fetch ?? (typeof fetch === 'undefined' ? undefined : fetch);
  if (!fetchImpl) return { tracked: false, reason: 'network_error', crawler };

  const controller = typeof AbortController === 'undefined' ? null : new AbortController();
  const timeout = controller ? setTimeout(() => controller.abort(), config.timeoutMs ?? DEFAULT_TIMEOUT_MS) : null;

  try {
    const response = await fetchImpl(config.apiUrl ?? API_URL, {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'text/plain',
        Origin: url.origin,
        ...(config.ingestToken ? { 'X-Ingest-Token': config.ingestToken } : {}),
      },
      ...(controller ? { signal: controller.signal } : {}),
      body: JSON.stringify({
        websiteId: config.websiteId,
        domain: config.domain ?? url.hostname,
        href: url.href,
        referrer: request.headers.get('referer') ?? request.headers.get('referrer'),
        type: 'pageview',
        bot: {
          name: crawler.name,
          category: crawler.category,
          userAgent: decision.userAgent ?? '',
          ip: crawlerIp(request, config),
        },
      }),
    });
    return {
      tracked: response.ok,
      ...(response.ok ? {} : { reason: 'api_error' as const }),
      crawler,
      status: response.status,
    };
  } catch (error) {
    if (config.debug) console.warn('[analytics] crawler event dropped', error);
    return { tracked: false, reason: 'network_error', crawler };
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function scheduleWaitUntil(target: WaitUntilTarget, promise: Promise<unknown>): boolean {
  const settled = promise.catch(() => undefined);
  const waitUntil = typeof target === 'function' ? target : target?.waitUntil?.bind(target);
  if (!waitUntil) return false;
  try {
    waitUntil(settled);
    return true;
  } catch {
    return false;
  }
}

export function trackCrawler(request: Request, config: CrawlerTrackingConfig): Promise<CrawlerTrackingResult>;
export function trackCrawler(
  request: Request,
  context: WaitUntilTarget,
  config: CrawlerTrackingConfig
): CrawlerTrackingResult;
export function trackCrawler(
  request: Request,
  contextOrConfig: WaitUntilTarget | CrawlerTrackingConfig,
  maybeConfig?: CrawlerTrackingConfig
): Promise<CrawlerTrackingResult> | CrawlerTrackingResult {
  if (!maybeConfig) {
    const config = contextOrConfig as CrawlerTrackingConfig;
    const decision = inspectCrawlerRequest(request, config);
    return isTrackable(decision) ? post(request, config, decision) : Promise.resolve(decision);
  }

  const decision = inspectCrawlerRequest(request, maybeConfig);
  if (!isTrackable(decision)) return decision;

  const scheduled = scheduleWaitUntil(contextOrConfig as WaitUntilTarget, post(request, maybeConfig, decision));
  return { tracked: false, scheduled, crawler: decision.crawler };
}
