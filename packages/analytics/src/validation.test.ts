import { describe, expect, it } from 'vitest';
import * as contract from '@tabsircg/schemas/analytics';
import { toEventData } from './eventData';
import { isLocalhost, parseValidInt, usableHandoffId } from './utils';
import { isSameSite, isInternalDomain } from './dom';
import { setConfig } from './config';
import { routeKey } from './spa';
import * as constants from './constants';
import { GOAL_PROP_PREFIX, SCROLL_PROP_PREFIX } from './constants';

describe('toEventData', () => {
  it('marshals to the string map the wire requires', () => {
    expect(toEventData({ Plan: 'pro', count: 3 })).toEqual({ plan: 'pro', count: '3' });
  });

  it('accepts an empty object', () => {
    expect(toEventData({})).toEqual({});
  });

  it('leaves URLs and markup characters untouched', () => {
    const url = 'https://cdn.example.com/a.jpg?w=64&h=64';
    expect(toEventData({ url })).toEqual({ url });
    expect(toEventData({ a: '<b>' })).toEqual({ a: '<b>' });
  });

  it('leaves eventName cased as the caller wrote it', () => {
    expect(toEventData({ eventName: 'signUp', Plan: 'pro' })).toEqual({ eventName: 'signUp', plan: 'pro' });
  });

  it('truncates a long value so one field cannot cost the whole event', () => {
    expect(toEventData({ a: 'x'.repeat(5000) }).a).toHaveLength(constants.EXTRA_DATA_MAX_VALUE_LENGTH);
  });

  it('degrades to empty data rather than throwing on a non-object', () => {
    expect(toEventData(null as never)).toEqual({});
    expect(toEventData([1] as never)).toEqual({});
    expect(toEventData('x' as never)).toEqual({});
  });

  it('does not gatekeep - it hands the worker the data and lets the worker rule', () => {
    const tooMany = Object.fromEntries(Array.from({ length: 11 }, (_, i) => [`k${i}`, '1']));
    expect(Object.keys(toEventData(tooMany))).toHaveLength(11);
    expect(contract.extraDataSchema.safeParse(toEventData(tooMany)).success).toBe(false);

    const badKey = toEventData({ 'bad key': '1' });
    expect(badKey).toEqual({ 'bad key': '1' });
    expect(contract.extraDataSchema.safeParse(badKey).success).toBe(false);
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
    expect(constants.EXTRA_DATA_KEY_PATTERN.flags).toBe(contract.EXTRA_DATA_KEY_PATTERN.flags);
    expect(constants.EVENT_NAME_KEY).toBe(contract.EVENT_NAME_KEY);
  });

  it('mirrors the visitor id length the worker enforces', () => {
    expect(constants.VISITOR_ID_MAX_LENGTH).toBe(contract.VISITOR_ID_MAX_LENGTH);
  });

  it('produces data the worker schema accepts', () => {
    const marshalled = toEventData({ eventName: 'signup', Plan: 'pro', url: 'https://x.com/?a=1&b=2' });
    expect(contract.extraDataSchema.safeParse(marshalled).success).toBe(true);
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

describe('usableHandoffId', () => {
  it('passes ordinary ids through', () => {
    expect(usableHandoffId('3f2504e0-4f89-41d3-9a0c-0305e82c3301')).toBe('3f2504e0-4f89-41d3-9a0c-0305e82c3301');
    expect(usableHandoffId('a'.repeat(constants.VISITOR_ID_MAX_LENGTH))).toBeTruthy();
  });

  it('drops an id the worker will always reject, so no cookie stores it', () => {
    expect(usableHandoffId('a'.repeat(constants.VISITOR_ID_MAX_LENGTH + 1))).toBeNull();
  });

  it('treats empty and missing as no handoff', () => {
    expect(usableHandoffId('')).toBeNull();
    expect(usableHandoffId(null)).toBeNull();
    expect(usableHandoffId(undefined)).toBeNull();
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
