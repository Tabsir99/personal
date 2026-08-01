import { EVENT_NAME_KEY, EXTRA_DATA_MAX_VALUE_LENGTH } from './constants';

function toBoundedString(value: unknown): string {
  if (value == null) return '';
  const str = String(value).trim();
  return str.length > EXTRA_DATA_MAX_VALUE_LENGTH ? str.substring(0, EXTRA_DATA_MAX_VALUE_LENGTH) : str;
}

export function toEventData(data: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};
  if (!data || typeof data !== 'object' || Array.isArray(data)) return result;

  for (const [key, value] of Object.entries(data)) {
    result[key === EVENT_NAME_KEY ? key : key.toLowerCase()] = toBoundedString(value);
  }
  return result;
}
