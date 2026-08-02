import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sendEvent } from './tracker';
import { initPageviewState, trackCustomEvent, trackIdentify, trackPageview } from './events';
import { setConfig } from './config';
import { STORAGE_PREFIX, UUID_PATTERN } from './constants';
import type { EventPayload, EventResult } from './types';

const payload: EventPayload = {
  websiteId: 'site-1',
  domain: 'example.com',
  type: 'custom',
  href: 'https://example.com/',
  referrer: null,
  viewport: { width: 1024, height: 768 },
  visitorId: 'v1',
  sessionId: '3f2504e0-4f89-41d3-9a0c-0305e82c3302',
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
  window.history.replaceState({}, '', '/');
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

  it('sends data the worker will refuse and reports the worker verdict, not its own', async () => {
    const fetchMock = respondWith(400);
    vi.stubGlobal('fetch', fetchMock);

    const seen: EventResult[] = [];
    trackCustomEvent('custom', { 'bad key': 'x' }, (r) => seen.push(r));
    await settled();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(seen).toEqual([{ outcome: 'rejected', status: 400 }]);
  });

  it('lets the worker rule on an empty user id', async () => {
    const fetchMock = respondWith(400);
    vi.stubGlobal('fetch', fetchMock);

    const seen: EventResult[] = [];
    trackIdentify('', { name: 'Nobody' }, (r) => seen.push(r));
    await settled();

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body as string).extraData.user_id).toBe('');
    expect(seen).toEqual([{ outcome: 'rejected', status: 400 }]);
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

  it('adopts the handoff ids but never puts them on the wire', async () => {
    const fetchMock = respondWith(200);
    vi.stubGlobal('fetch', fetchMock);
    const vid = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
    const sid = '3f2504e0-4f89-41d3-9a0c-0305e82c3302';
    window.history.replaceState({}, '', `/landing?utm_source=x&_cgd_vid=${vid}&_cgd_sid=${sid}&_cgd_vsn=4`);

    trackPageview();
    await settled();

    const [, init] = fetchMock.mock.calls[0];
    const sent = JSON.parse(init.body as string);
    expect(sent.visitorId).toBe(vid);
    expect(sent.sessionId).toBe(sid);
    expect(sent.visitorSessionNumber).toBe(4);
    expect(sent.href).toBe('https://example.com/landing?utm_source=x');
    expect(window.location.href).toBe('https://example.com/landing?utm_source=x');
  });

  it('mints its own id when the handoff one is not a uuid', async () => {
    const fetchMock = respondWith(200);
    vi.stubGlobal('fetch', fetchMock);
    window.history.replaceState({}, '', '/landing?_cgd_vid=v-abc&_cgd_sid=s-abc');

    trackPageview();
    await settled();

    const sent = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(sent.visitorId).not.toBe('v-abc');
    expect(sent.visitorId).toMatch(UUID_PATTERN);
  });

  it('ignores a handoff id that the worker would reject', async () => {
    const fetchMock = respondWith(200);
    vi.stubGlobal('fetch', fetchMock);
    window.history.replaceState({}, '', `/?_cgd_vid=${'a'.repeat(101)}`);

    trackPageview();
    await settled();

    const [, init] = fetchMock.mock.calls[0];
    const sent = JSON.parse(init.body as string);
    expect(sent.visitorId).not.toContain('aaaa');
    expect(sent.visitorId.length).toBeLessThanOrEqual(100);
    expect(document.cookie).not.toContain('aaaa');
  });
});
