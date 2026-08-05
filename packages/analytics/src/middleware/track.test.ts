import { describe, expect, it, vi } from 'vitest';
import { inspectCrawlerRequest, trackCrawler, type CrawlerTrackingConfig } from './track';

const GOOGLEBOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const CHROME =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function requestFor(path: string, headers: Record<string, string> = {}, method = 'GET'): Request {
  return new Request(`https://tabsircg.com${path}`, {
    method,
    headers: { 'user-agent': GOOGLEBOT, ...headers },
  });
}

function okFetch() {
  return vi.fn(async () => new Response('{}', { status: 200 }));
}

const config: CrawlerTrackingConfig = { websiteId: 'portfolio-and-blog', apiUrl: 'https://ingest.test/api/events' };

describe('inspectCrawlerRequest', () => {
  it('accepts a crawler on a document path', () => {
    const decision = inspectCrawlerRequest(requestFor('/blog/foo'), config);
    expect(decision.crawler).toEqual({ name: 'Googlebot', category: 'search_index' });
    expect(decision.reason).toBeUndefined();
  });

  it('skips real browsers before anything else', () => {
    const decision = inspectCrawlerRequest(requestFor('/blog/foo', { 'user-agent': CHROME }), config);
    expect(decision.reason).toBe('not_a_crawler');
    expect(decision.crawler).toBeUndefined();
  });

  it('tracks every path until a hook opts out', () => {
    for (const path of ['/_next/static/chunk.js', '/og/cover.png']) {
      expect([path, inspectCrawlerRequest(requestFor(path), config).reason]).toEqual([path, undefined]);
    }
  });

  it('skips subresource fetches and non-document methods', () => {
    expect(inspectCrawlerRequest(requestFor('/blog/foo', { 'sec-fetch-dest': 'image' }), config).reason).toBe(
      'static_fetch_destination'
    );
    expect(inspectCrawlerRequest(requestFor('/blog/foo', {}, 'POST'), config).reason).toBe('method_not_tracked');
  });

  it('honours excluded categories and the shouldTrack hook', () => {
    expect(
      inspectCrawlerRequest(requestFor('/blog/foo'), { ...config, excludeCategories: ['search_index'] }).reason
    ).toBe('category_excluded');
    expect(inspectCrawlerRequest(requestFor('/blog/foo'), { ...config, shouldTrack: () => false }).reason).toBe(
      'path_rejected'
    );
  });

  it('rebuilds the url from publicOrigin behind a proxy', () => {
    const request = new Request('http://0.0.0.0:3001/blog/foo?page=2', { headers: { 'user-agent': GOOGLEBOT } });
    const decision = inspectCrawlerRequest(request, { ...config, publicOrigin: 'https://tabsircg.com' });
    expect(decision.url?.href).toBe('https://tabsircg.com/blog/foo?page=2');
  });
});

describe('trackCrawler', () => {
  it('posts the crawl payload the ingest worker expects', async () => {
    const fetchImpl = okFetch();
    const request = requestFor('/blog/foo', { referer: 'https://news.example/x', 'cf-connecting-ip': '66.249.66.1' });

    const result = await trackCrawler(request, { ...config, fetch: fetchImpl });

    expect(result.tracked).toBe(true);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://ingest.test/api/events');
    expect((init.headers as Record<string, string>).Origin).toBe('https://tabsircg.com');
    expect(JSON.parse(init.body as string)).toEqual({
      websiteId: 'portfolio-and-blog',
      domain: 'tabsircg.com',
      href: 'https://tabsircg.com/blog/foo',
      referrer: 'https://news.example/x',
      type: 'pageview',
      bot: {
        name: 'Googlebot',
        category: 'search_index',
        userAgent: GOOGLEBOT,
        ip: '66.249.66.1',
      },
    });
  });

  it('sends the ingest token only when configured', async () => {
    const withToken = okFetch();
    await trackCrawler(requestFor('/blog/foo'), { ...config, fetch: withToken, ingestToken: 'secret' });
    const [, tokenInit] = withToken.mock.calls[0] as unknown as [string, RequestInit];
    expect((tokenInit.headers as Record<string, string>)['X-Ingest-Token']).toBe('secret');

    const withoutToken = okFetch();
    await trackCrawler(requestFor('/blog/foo'), { ...config, fetch: withoutToken });
    const [, plainInit] = withoutToken.mock.calls[0] as unknown as [string, RequestInit];
    expect(plainInit.headers as Record<string, string>).not.toHaveProperty('X-Ingest-Token');
  });

  it('sends nothing for human traffic', async () => {
    const fetchImpl = okFetch();
    const result = await trackCrawler(requestFor('/blog/foo', { 'user-agent': CHROME }), {
      ...config,
      fetch: fetchImpl,
    });
    expect(result.reason).toBe('not_a_crawler');
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('defers to waitUntil and returns without awaiting the network', async () => {
    const fetchImpl = okFetch();
    const scheduled: Promise<unknown>[] = [];
    const result = trackCrawler(requestFor('/blog/foo'), (promise) => void scheduled.push(promise), {
      ...config,
      fetch: fetchImpl,
    });

    expect(result).toEqual({
      tracked: false,
      scheduled: true,
      crawler: { name: 'Googlebot', category: 'search_index' },
    });
    await Promise.all(scheduled);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('reports a failing ingest instead of throwing', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('unreachable');
    });
    const result = await trackCrawler(requestFor('/blog/foo'), { ...config, fetch: fetchImpl });
    expect(result).toEqual({
      tracked: false,
      reason: 'network_error',
      crawler: { name: 'Googlebot', category: 'search_index' },
    });
  });
});
