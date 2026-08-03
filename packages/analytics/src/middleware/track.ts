import { API_URL, MAX_HREF_LENGTH } from '../constants';
import { classifyCrawler, type Crawler } from './classify';
import type { CrawlerCategory } from './signatures';

export interface CrawlerTrackingConfig {
  websiteId: string;
  domain?: string;
  apiUrl?: string;
  publicOrigin?: string;
  enabled?: boolean;
  excludeCategories?: CrawlerCategory[];
  methods?: string[];
  ignoredPathPrefixes?: string[];
  additionalIgnoredPathPrefixes?: string[];
  ignoredExtensions?: string[];
  additionalIgnoredExtensions?: string[];
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
  | 'ignored_path_prefix'
  | 'ignored_file_extension'
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
const IP_HEADERS = [
  'cf-connecting-ip',
  'x-real-ip',
  'true-client-ip',
  'fastly-client-ip',
  'fly-client-ip',
  'x-vercel-forwarded-for',
  'x-forwarded-for',
];

const DEFAULT_IGNORED_PATH_PREFIXES = [
  '/api',
  '/_next',
  '/_nuxt',
  '/_astro',
  '/static',
  '/assets',
  '/public',
  '/images',
  '/img',
  '/fonts',
  '/favicon',
  '/build',
  '/dist',
  '/cdn-cgi',
  '/.well-known',
];

const DEFAULT_IGNORED_EXTENSIONS = [
  'avif',
  'bmp',
  'br',
  'css',
  'csv',
  'eot',
  'gif',
  'gz',
  'ico',
  'jpeg',
  'jpg',
  'js',
  'json',
  'map',
  'mjs',
  'mov',
  'mp3',
  'mp4',
  'otf',
  'pdf',
  'png',
  'svg',
  'ttf',
  'txt',
  'wasm',
  'wav',
  'webm',
  'webmanifest',
  'webp',
  'woff',
  'woff2',
  'xml',
  'zip',
];

const CRAWLER_FACING_PATHS = new Set(['/robots.txt', '/llms.txt', '/llms-full.txt']);

const STATIC_FETCH_DESTINATIONS = new Set([
  'audio',
  'embed',
  'font',
  'image',
  'manifest',
  'object',
  'script',
  'style',
  'track',
  'video',
  'worker',
]);

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return withLeadingSlash.replace(/\/{2,}/g, '/').toLowerCase();
}

function isCrawlerFacingPath(pathname: string): boolean {
  if (CRAWLER_FACING_PATHS.has(pathname)) return true;
  const lastSegment = pathname.split('/').pop() || '';
  return lastSegment.includes('sitemap') && lastSegment.endsWith('.xml');
}

function startsWithPrefix(pathname: string, prefix: string): boolean {
  const normalized = normalizePathname(prefix);
  return pathname === normalized || pathname.startsWith(`${normalized}/`);
}

function ignoredPathPrefixes(config: CrawlerTrackingConfig): string[] {
  return (
    config.ignoredPathPrefixes ?? [...DEFAULT_IGNORED_PATH_PREFIXES, ...(config.additionalIgnoredPathPrefixes ?? [])]
  );
}

function ignoredExtensions(config: CrawlerTrackingConfig): Set<string> {
  const extensions = config.ignoredExtensions ?? [
    ...DEFAULT_IGNORED_EXTENSIONS,
    ...(config.additionalIgnoredExtensions ?? []),
  ];
  return new Set(extensions.map((extension) => extension.replace(/^\./, '').toLowerCase()));
}

function hasIgnoredExtension(pathname: string, extensions: Set<string>): boolean {
  const lastSegment = pathname.split('/').pop() || '';
  const match = /\.([a-z0-9]+)$/i.exec(lastSegment);
  return Boolean(match && extensions.has(match[1].toLowerCase()));
}

function requestUrl(request: Request, config: CrawlerTrackingConfig): URL | null {
  try {
    const url = new URL(request.url);
    if (!config.publicOrigin) return url;
    const publicOrigin = new URL(config.publicOrigin);
    const rebuilt = new URL(publicOrigin.origin);
    rebuilt.pathname = url.pathname;
    rebuilt.search = url.search;
    return rebuilt;
  } catch {
    return null;
  }
}

function crawlerIp(request: Request, config: CrawlerTrackingConfig): string {
  const override = config.getIp?.(request);
  const raw = override || IP_HEADERS.map((header) => request.headers.get(header)).find(Boolean);
  const first = raw?.split(',')[0]?.trim();
  if (!first) return '';
  return first.startsWith('::ffff:') ? first.slice('::ffff:'.length) : first;
}

export function inspectCrawlerRequest(request: Request, config: CrawlerTrackingConfig): CrawlerTrackingDecision {
  if (config.enabled === false) return { tracked: false, reason: 'disabled' };
  if (!config.websiteId) return { tracked: false, reason: 'missing_website_id' };

  const methods = config.methods ?? ['GET', 'HEAD'];
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

  const pathname = normalizePathname(url.pathname);
  if (!isCrawlerFacingPath(pathname)) {
    if (ignoredPathPrefixes(config).some((prefix) => startsWithPrefix(pathname, prefix))) {
      return { tracked: false, reason: 'ignored_path_prefix', crawler };
    }
    if (hasIgnoredExtension(pathname, ignoredExtensions(config))) {
      return { tracked: false, reason: 'ignored_file_extension', crawler };
    }
  }

  if (config.shouldTrack) {
    let allowed = false;
    try {
      allowed = config.shouldTrack(url, crawler) !== false;
    } catch {
      allowed = false;
    }
    if (!allowed) return { tracked: false, reason: 'path_rejected', crawler };
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

  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = typeof AbortController === 'undefined' ? null : new AbortController();
  const timeout = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const response = await fetchImpl(config.apiUrl ?? API_URL, {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'text/plain',
        Origin: url.origin,
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
    if (!decision.crawler || !decision.url) return Promise.resolve(decision);
    return post(request, config, decision);
  }

  const decision = inspectCrawlerRequest(request, maybeConfig);
  if (!decision.crawler || !decision.url) return decision;

  const scheduled = scheduleWaitUntil(contextOrConfig as WaitUntilTarget, post(request, maybeConfig, decision));
  return { tracked: false, scheduled, crawler: decision.crawler };
}
