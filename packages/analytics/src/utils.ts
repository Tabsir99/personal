import { VISITOR_ID_MAX_LENGTH, UUID_PATTERN } from './constants';

export function isLocalhost(hostname: string): boolean {
  if (!hostname) return false;
  const lower = hostname.toLowerCase();
  if (['localhost', '127.0.0.1', '::1'].includes(lower)) return true;
  if (/^127(\.[0-9]+){0,3}$/.test(lower)) return true;
  if (/^(\[)?::1?\]?$/.test(lower)) return true;
  if (lower.endsWith('.local') || lower.endsWith('.localhost')) return true;
  return false;
}

function withinLength(value: string | null | undefined): value is string {
  return Boolean(value) && (value as string).length <= VISITOR_ID_MAX_LENGTH;
}

export function usableVisitorId(value: string | null | undefined): string | null {
  if (!withinLength(value)) return null;
  return UUID_PATTERN.test(value) ? value : null;
}

/** getSessionId builds 's' + uuid.slice(1), so the 's' is swapped back out
 * before testing. Never accept this shape as a visitor id — that column is a
 * real UUID. */
export function usableSessionId(value: string | null | undefined): string | null {
  if (!withinLength(value)) return null;
  if (value.charAt(0) !== 's') return null;
  return UUID_PATTERN.test(`0${value.slice(1)}`) ? value : null;
}

const MAX_SESSION_NUMBER = 65535;

export function parseValidInt(str: string | null | undefined): number | null {
  if (!str) return null;
  const num = parseInt(str, 10);
  if (!Number.isFinite(num) || num < 1) return null;
  return Math.min(num, MAX_SESSION_NUMBER);
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-');
}
