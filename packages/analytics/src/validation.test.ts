import { describe, expect, it } from 'vitest';
import * as contract from '@tabsircg/schemas/analytics';
import { sanitizeEventData } from './validation';
import { isLocalhost, parseValidInt } from './utils';
import { isSameSite, isInternalDomain } from './dom';
import { setConfig } from './config';
import { routeKey } from './spa';
import * as constants from './constants';
import { GOAL_PROP_PREFIX, SCROLL_PROP_PREFIX } from './constants';

describe('sanitizeEventData', () => {
  it('rejects non-objects rather than degrading to empty data', () => {
    expect(sanitizeEventData(null as never)).toBeNull();
    expect(sanitizeEventData([1] as never)).toBeNull();
    expect(sanitizeEventData('x' as never)).toBeNull();
  });

  it('accepts an empty object', () => {
    expect(sanitizeEventData({})).toEqual({});
  });

  it('lowercases keys and stringifies values', () => {
    expect(sanitizeEventData({ Plan: 'pro', count: 3 })).toEqual({ plan: 'pro', count: '3' });
  });

  it('leaves URLs and markup characters untouched', () => {
    const url = 'https://cdn.example.com/a.jpg?w=64&h=64';
    expect(sanitizeEventData({ url })).toEqual({ url });
    expect(sanitizeEventData({ a: '<b>' })).toEqual({ a: '<b>' });
  });

  it('caps values at the shared wire limit', () => {
    expect(sanitizeEventData({ a: 'x'.repeat(5000) })?.a).toHaveLength(constants.EXTRA_DATA_MAX_VALUE_LENGTH);
  });

  it('rejects invalid key names', () => {
    expect(sanitizeEventData({ 'bad key': '1' })).toBeNull();
    expect(sanitizeEventData({ ['k'.repeat(33)]: '1' })).toBeNull();
  });

  it('rejects more than ten properties', () => {
    const many = Object.fromEntries(Array.from({ length: 11 }, (_, i) => [`k${i}`, '1']));
    expect(sanitizeEventData(many)).toBeNull();
  });

  it('exempts eventName from the property budget', () => {
    const ten = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`k${i}`, '1']));
    expect(sanitizeEventData({ eventName: 'signup', ...ten })).not.toBeNull();
  });

  it('rejects a payload that serialises past the byte budget', () => {
    const big = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`k${i}`, 'x'.repeat(1000)]));
    expect(sanitizeEventData(big)).toBeNull();
  });
});

describe('wire rules match the shared contract', () => {
  it('agrees with the dashboard on what a custom event type is', () => {
    expect(constants.CUSTOM_EVENT_TYPE).toBe(contract.CUSTOM_EVENT_TYPE);
  });

  it('mirrors every extra_data limit the worker enforces', () => {
    expect(constants.EXTRA_DATA_MAX_PROPERTIES).toBe(contract.EXTRA_DATA_MAX_PROPERTIES);
    expect(constants.EXTRA_DATA_MAX_KEY_LENGTH).toBe(contract.EXTRA_DATA_MAX_KEY_LENGTH);
    expect(constants.EXTRA_DATA_MAX_VALUE_LENGTH).toBe(contract.EXTRA_DATA_MAX_VALUE_LENGTH);
    expect(constants.EXTRA_DATA_MAX_BYTES).toBe(contract.EXTRA_DATA_MAX_BYTES);
    expect(constants.EXTRA_DATA_KEY_PATTERN.source).toBe(contract.EXTRA_DATA_KEY_PATTERN.source);
    expect(constants.EVENT_NAME_KEY).toBe(contract.EVENT_NAME_KEY);
  });

  it('produces data the worker schema accepts', () => {
    const sanitized = sanitizeEventData({ eventName: 'signup', Plan: 'pro', url: 'https://x.com/?a=1&b=2' });
    expect(contract.extraDataSchema.safeParse(sanitized).success).toBe(true);
  });
});

describe('goal attribute prefixes', () => {
  it('slices the whole prefix off, leaving the first character of the property', () => {
    expect(GOAL_PROP_PREFIX).toBe('data-cgd-goal-');
    expect(SCROLL_PROP_PREFIX).toBe('data-cgd-scroll-');
    expect('data-cgd-goal-source'.substring(GOAL_PROP_PREFIX.length)).toBe('source');
    expect('data-cgd-scroll-variant'.substring(SCROLL_PROP_PREFIX.length)).toBe('variant');
  });
});

describe('routeKey', () => {
  it('does not treat a query change as a new route', () => {
    expect(routeKey('https://x.com/p?tab=a')).toBe(routeKey('https://x.com/p?tab=b'));
    expect(routeKey('https://x.com/p?tab=a')).toBe(routeKey('https://x.com/p'));
  });

  it('distinguishes paths', () => {
    expect(routeKey('https://x.com/p')).not.toBe(routeKey('https://x.com/q'));
  });

  it('ignores the cross-domain handoff params so stripping them is not a pageview', () => {
    expect(routeKey('https://x.com/p?_cgd_vid=v&_cgd_sid=s&_cgd_vsn=2')).toBe('/p');
  });
});

describe('parseValidInt', () => {
  it('caps at the UInt16 ceiling of the session_number column', () => {
    expect(parseValidInt('999999')).toBe(65535);
  });

  it('rejects zero, negatives and junk', () => {
    expect(parseValidInt('0')).toBeNull();
    expect(parseValidInt('-3')).toBeNull();
    expect(parseValidInt('abc')).toBeNull();
    expect(parseValidInt(null)).toBeNull();
  });

  it('passes ordinary counts through', () => {
    expect(parseValidInt('7')).toBe(7);
  });
});

describe('isLocalhost', () => {
  it('matches loopback forms', () => {
    for (const host of ['localhost', '127.0.0.1', '::1', 'dev.local', 'app.localhost']) {
      expect(isLocalhost(host)).toBe(true);
    }
  });

  it('does not match real hosts', () => {
    expect(isLocalhost('tabsircg.com')).toBe(false);
    expect(isLocalhost('')).toBe(false);
  });
});

describe('isSameSite', () => {
  it('treats a parent and its subdomain as one site without any config', () => {
    setConfig({ domain: null, allowedHostnames: [] });
    expect(isSameSite('www.example.com', 'example.com')).toBe(true);
    expect(isSameSite('example.com', 'www.example.com')).toBe(true);
  });

  it('joins sibling subdomains under the declared domain', () => {
    setConfig({ domain: 'example.com', allowedHostnames: [] });
    expect(isSameSite('app.example.com', 'blog.example.com')).toBe(true);
  });

  it('no longer collapses unrelated hosts that share a multi-label suffix', () => {
    setConfig({ domain: 'foo.co.uk', allowedHostnames: [] });
    expect(isSameSite('bar.co.uk', 'foo.co.uk')).toBe(false);
  });

  it('keeps a declared cross-domain host separate so it gets decorated, not skipped', () => {
    setConfig({ domain: 'foo.co.uk', allowedHostnames: ['bar.co.uk'] });
    expect(isSameSite('bar.co.uk', 'foo.co.uk')).toBe(false);
    expect(isInternalDomain('bar.co.uk')).toBe(true);
  });

  it('does not treat a suffix collision as internal', () => {
    setConfig({ domain: 'example.com', allowedHostnames: [] });
    expect(isInternalDomain('notexample.com')).toBe(false);
    expect(isSameSite('notexample.com', 'example.com')).toBe(false);
  });
});
