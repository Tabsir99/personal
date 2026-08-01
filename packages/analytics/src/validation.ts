import { log } from './logger';
import {
  EVENT_NAME_KEY,
  EXTRA_DATA_KEY_PATTERN,
  EXTRA_DATA_MAX_BYTES,
  EXTRA_DATA_MAX_KEY_LENGTH,
  EXTRA_DATA_MAX_PROPERTIES,
  EXTRA_DATA_MAX_VALUE_LENGTH,
} from './constants';

function toBoundedString(value: unknown): string {
  if (value == null) return '';
  const str = String(value).trim();
  return str.length > EXTRA_DATA_MAX_VALUE_LENGTH ? str.substring(0, EXTRA_DATA_MAX_VALUE_LENGTH) : str;
}

export function sanitizeEventData(data: Record<string, unknown>): Record<string, string> | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    log('error', 'Event data must be a non-null object');
    return null;
  }

  const result: Record<string, string> = {};
  let count = 0;

  for (const [key, value] of Object.entries(data)) {
    if (key === EVENT_NAME_KEY) {
      result[key] = toBoundedString(value);
      continue;
    }
    if (count >= EXTRA_DATA_MAX_PROPERTIES) {
      log('error', `Maximum ${EXTRA_DATA_MAX_PROPERTIES} event properties allowed`);
      return null;
    }
    const normalisedKey = key.toLowerCase();
    if (
      normalisedKey.length === 0 ||
      normalisedKey.length > EXTRA_DATA_MAX_KEY_LENGTH ||
      !EXTRA_DATA_KEY_PATTERN.test(normalisedKey)
    ) {
      log(
        'error',
        `Invalid property name "${key}". Use only lowercase letters, numbers, underscores, and hyphens. Max ${EXTRA_DATA_MAX_KEY_LENGTH} characters.`
      );
      return null;
    }
    result[normalisedKey] = toBoundedString(value);
    count++;
  }

  if (JSON.stringify(result).length > EXTRA_DATA_MAX_BYTES) {
    log('error', `Event properties exceed ${EXTRA_DATA_MAX_BYTES} characters once serialised`);
    return null;
  }

  return result;
}
