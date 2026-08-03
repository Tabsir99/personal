import { trackCrawler, type CrawlerTrackingConfig } from './track';

interface NodeRequestLike {
  method?: string;
  url?: string;
  originalUrl?: string;
  protocol?: string;
  headers?: Record<string, string | string[] | undefined>;
  socket?: { encrypted?: boolean };
}

function toFetchRequest(req: NodeRequestLike): Request {
  const forwardedProtocol = req.headers?.['x-forwarded-proto'];
  const protocol =
    req.protocol ||
    (Array.isArray(forwardedProtocol) ? forwardedProtocol[0] : forwardedProtocol) ||
    (req.socket?.encrypted ? 'https' : 'http');
  const host = req.headers?.host || 'localhost';
  const path = req.originalUrl || req.url || '/';
  const absoluteUrl = /^https?:\/\//i.test(path) ? path : `${protocol}://${String(host)}${path}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers ?? {})) {
    if (Array.isArray(value)) headers.set(key, value.join(', '));
    else if (typeof value === 'string') headers.set(key, value);
  }

  return new Request(absoluteUrl, { method: req.method || 'GET', headers });
}

export function expressCrawlerMiddleware(config: CrawlerTrackingConfig) {
  return function crawlerTrackingMiddleware(req: NodeRequestLike, _res: unknown, next?: () => void): void {
    try {
      void trackCrawler(toFetchRequest(req), config);
    } catch (error) {
      if (config.debug) console.warn('[analytics] crawler event dropped', error);
    } finally {
      next?.();
    }
  };
}
