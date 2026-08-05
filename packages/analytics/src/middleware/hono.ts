import { trackCrawler, type CrawlerTrackingConfig, type WaitUntilTarget } from './track';

interface HonoContext {
  req: { raw: Request };
  executionCtx?: WaitUntilTarget;
}

export function honoCrawlerMiddleware(config: CrawlerTrackingConfig) {
  return async function crawlerTrackingMiddleware(c: HonoContext, next: () => Promise<void>): Promise<void> {
    let executionCtx: WaitUntilTarget;
    try {
      executionCtx = c.executionCtx;
    } catch {
      executionCtx = undefined;
    }
    trackCrawler(c.req.raw, executionCtx, config);
    await next();
  };
}
