import { log } from './logger';

export function sanitizeCustomData(data: Record<string, unknown>): Record<string, string> | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    log('error', 'customData must be a non-null object');
    return null;
  }
  const result: Record<string, string> = {};
  let count: number = 0;

  function sanitizeString(val: unknown): string {
    if (val == null) return '';
    let str = String(val);
    if (str.length > 255) str = str.substring(0, 255);
    return str
      .replace(/[<>'"&]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      .trim();
  }

  for (const [key, value] of Object.entries(data)) {
    if (key === 'eventName') {
      result[key] = sanitizeString(value);
      continue;
    }
    if (count >= 10) {
      log('error', 'Maximum 10 custom parameters allowed');
      return null;
    }
    if (typeof key !== 'string' || key.length === 0 || key.length > 32 || !/^[a-z0-9_-]+$/.test(key.toLowerCase())) {
      log(
        'error',
        `Invalid property name "${key}". Use only lowercase letters, numbers, underscores, and hyphens. Max 32 characters.`
      );
      return null;
    }
    result[key.toLowerCase()] = sanitizeString(value);
    count++;
  }
  return result;
}
