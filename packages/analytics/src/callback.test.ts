import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sendEvent } from './tracker';
import { initPageviewState, trackCustomEvent, trackIdentify, trackPageview } from './events';
import { setConfig } from './config';
import { STORAGE_PREFIX } from './constants';
import type { EventPayload, EventResult } from './types';

const payload: EventPayload = {
  websiteId: 'site-1',
  domain: 'example.com',
  type: 'custom',
  href: 'https://example.com/',
  referrer: null,
  viewport: { width: 1024, height: 768 },
  visitorId: 'v1',
  sessionId: 's1',
  visitorSessionNumber: 1,
  language: 'en-US',
  timezone: 'UTC',
  screenWidth: 1024,
  screenHeight: 768,
};

const respondWith = (status: number) =>
  vi.fn((_url: string, _init: RequestInit) => Promise.resolve({ status } as Response));
const rejectWith = () => vi.fn((_url: string, _init: RequestInit) => Promise.reject(new TypeError('Failed to fetch')));

const settled = () => new Promise((resolve) => setTimeout(resolve, 0));

function presentAsRealBrowser() {
  Object.defineProperty(navigator, 'webdriver', { value: false, configurable: true });
}

beforeEach(() => {
  presentAsRealBrowser();
  setConfig({
    websiteId: 'site-1',
    domain: 'example.com',
    allowedHostnames: [],
    debug: false,
    disableConsole: true,
    allowLocalhost: false,
    allowIframe: false,
    allowFileProtocol: false,
    apiUrlRaw: null,
  });
  localStorage.clear();
  sessionStorage.clear();
  initPageviewState();
  vi.stubGlobal('fetch', respondWith(200));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('the callback fires exactly once, with the truth', () => {
  it('reports delivered on a 200', async () => {
    const seen: EventResult[] = [];
    sendEvent(payload, (r) => seen.push(r));
    await settled();
    expect(seen).toEqual([{ outcome: 'delivered', status: 200 }]);
  });

  it('reports rejected and carries the real status', async () => {
    vi.stubGlobal('fetch', respondWith(400));
    const seen: EventResult[] = [];
    sendEvent(payload, (r) => seen.push(r));
    await settled();
    expect(seen).toEqual([{ outcome: 'rejected', status: 400 }]);
  });

  it('reports failed when the request never completes', async () => {
    vi.stubGlobal('fetch', rejectWith());
    const seen: EventResult[] = [];
    sendEvent(payload, (r) => seen.push(r));
    await settled();
    expect(seen).toEqual([{ outcome: 'failed', status: 0 }]);
  });

  it('reports disabled for the ignore flag, and sends nothing', async () => {
    const fetchMock = respondWith(200);
    vi.stubGlobal('fetch', fetchMock);
    localStorage.setItem(`${STORAGE_PREFIX}ignore`, 'true');

    const seen: EventResult[] = [];
    sendEvent(payload, (r) => seen.push(r));
    await settled();

    expect(seen).toEqual([{ outcome: 'disabled', status: 0 }]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports invalid when extraData fails validation, and sends nothing', async () => {
    const fetchMock = respondWith(200);
    vi.stubGlobal('fetch', fetchMock);

    const seen: EventResult[] = [];
    trackCustomEvent('custom', { 'bad key': 'x' }, (r) => seen.push(r));
    await settled();

    expect(seen).toEqual([{ outcome: 'invalid', status: 0 }]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports invalid for an identify the worker would refuse', async () => {
    const seen: EventResult[] = [];
    trackIdentify('u1', { 'Bad Key': 'x' }, (r) => seen.push(r));
    await settled();
    expect(seen).toEqual([{ outcome: 'invalid', status: 0 }]);
  });

  it('reports throttled for a repeat pageview inside the window', async () => {
    const first: EventResult[] = [];
    const second: EventResult[] = [];

    trackPageview((r) => first.push(r));
    await settled();
    trackPageview((r) => second.push(r));
    await settled();

    expect(first).toEqual([{ outcome: 'delivered', status: 200 }]);
    expect(second).toEqual([{ outcome: 'throttled', status: 0 }]);
  });

  it('never fires twice, even when the consumer throws', async () => {
    const callback = vi.fn(() => {
      throw new Error('consumer blew up');
    });
    sendEvent(payload, callback);
    await settled();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('still delivers when localStorage is unavailable', async () => {
    const fetchMock = respondWith(200);
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });

    const seen: EventResult[] = [];
    sendEvent(payload, (r) => seen.push(r));
    await settled();

    expect(seen).toEqual([{ outcome: 'delivered', status: 200 }]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('the request the worker actually receives', () => {
  it('is a keepalive POST that stays CORS-simple', async () => {
    const fetchMock = respondWith(200);
    vi.stubGlobal('fetch', fetchMock);

    sendEvent(payload);
    await settled();

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.keepalive).toBe(true);
    expect(init.credentials).toBe('omit');
    expect(init.headers).toEqual({ 'Content-Type': 'text/plain' });
    expect(JSON.parse(init.body as string)).toEqual(payload);
  });
});
