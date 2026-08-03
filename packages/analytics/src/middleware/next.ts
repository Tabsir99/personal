import { trackCrawler, type CrawlerTrackingConfig, type WaitUntilTarget } from './track';

type NextProxyHandler<TResponse> = (request: Request, event: WaitUntilTarget) => TResponse;

export function withCrawlerTracking<TResponse>(
  handler: NextProxyHandler<TResponse>,
  config: CrawlerTrackingConfig
): NextProxyHandler<TResponse> {
  return function crawlerTrackingProxy(request, event) {
    trackCrawler(request, event, config);
    return handler(request, event);
  };
}
