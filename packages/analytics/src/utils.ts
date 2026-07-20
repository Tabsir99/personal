export function isLocalhost(hostname: string): boolean {
  if (!hostname) return false;
  const lower = hostname.toLowerCase();
  if (['localhost', '127.0.0.1', '::1'].includes(lower)) return true;
  if (/^127(\.[0-9]+){0,3}$/.test(lower)) return true;
  if (/^(\[)?::1?\]?$/.test(lower)) return true;
  if (lower.endsWith('.local') || lower.endsWith('.localhost')) return true;
  return false;
}

export function isValidDateStr(str: string | null | undefined): boolean {
  if (!str || typeof str !== 'string') return false;
  const parsed = Date.parse(str);
  return !Number.isNaN(parsed) && parsed > 0;
}

export function parseValidInt(str: string | null | undefined): number | null {
  if (!str) return null;
  const num = parseInt(str, 10);
  if (!Number.isFinite(num) || num < 1) return null;
  return Math.min(num, 1000000);
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
