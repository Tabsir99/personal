import { describe, expect, it } from 'vitest';
import { sanitizeCustomData } from './validation';
import { isLocalhost, isValidDateStr, parseValidInt } from './utils';
import { getBaseDomain } from './dom';

describe('sanitizeCustomData', () => {
  it('rejects non-objects rather than degrading to empty data', () => {
    expect(sanitizeCustomData(null as never)).toBeNull();
    expect(sanitizeCustomData([1] as never)).toBeNull();
    expect(sanitizeCustomData('x' as never)).toBeNull();
  });

  it('accepts an empty object', () => {
    expect(sanitizeCustomData({})).toEqual({});
  });

  it('lowercases keys and stringifies values', () => {
    expect(sanitizeCustomData({ Plan: 'pro', count: 3 })).toEqual({ plan: 'pro', count: '3' });
  });

  it('strips injection-ish characters', () => {
    expect(sanitizeCustomData({ a: '<script>x</script>' })).toEqual({ a: 'scriptx/script' });
  });

  it('caps values at 255 characters', () => {
    expect(sanitizeCustomData({ a: 'x'.repeat(400) })?.a).toHaveLength(255);
  });

  it('rejects invalid key names', () => {
    expect(sanitizeCustomData({ 'bad key': '1' })).toBeNull();
    expect(sanitizeCustomData({ ['k'.repeat(33)]: '1' })).toBeNull();
  });

  it('rejects more than ten properties', () => {
    const many = Object.fromEntries(Array.from({ length: 11 }, (_, i) => [`k${i}`, '1']));
    expect(sanitizeCustomData(many)).toBeNull();
  });

  it('exempts eventName from the property budget', () => {
    const ten = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`k${i}`, '1']));
    expect(sanitizeCustomData({ eventName: 'signup', ...ten })).not.toBeNull();
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

describe('isValidDateStr', () => {
  it('accepts an ISO timestamp', () => {
    expect(isValidDateStr(new Date().toISOString())).toBe(true);
  });

  it('rejects junk and empties', () => {
    expect(isValidDateStr('not-a-date')).toBe(false);
    expect(isValidDateStr(null)).toBe(false);
  });
});

describe('getBaseDomain', () => {
  it('reduces a subdomain to its registrable pair', () => {
    expect(getBaseDomain('app.example.com')).toBe('example.com');
    expect(getBaseDomain('www.example.com')).toBe('example.com');
  });

  it('passes single labels through', () => {
    expect(getBaseDomain('localhost')).toBe('localhost');
  });
});
