import {
  EXTRA_DATA_MAX_BYTES,
  EXTRA_DATA_MAX_VALUE_LENGTH,
} from "@tabsircg/schemas/analytics";

const UINT16_MAX = 65535;
const EVENT_NAME_LIMIT = 255;

export function toUint16(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(UINT16_MAX, Math.max(0, Math.round(value)));
}

export function toEventName(extraData: unknown, type: string): string {
  const named =
    extraData && typeof extraData === "object"
      ? (extraData as Record<string, unknown>).eventName
      : undefined;
  const name = typeof named === "string" && named ? named : type;
  return name.slice(0, EVENT_NAME_LIMIT);
}

export function encodeExtraData(extraData: unknown): string {
  if (!extraData || typeof extraData !== "object" || Array.isArray(extraData)) {
    return "{}";
  }

  const capped: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(extraData)) {
    capped[key] =
      typeof value === "string"
        ? value.slice(0, EXTRA_DATA_MAX_VALUE_LENGTH)
        : value;
  }

  const full = JSON.stringify(capped);
  if (full.length <= EXTRA_DATA_MAX_BYTES) return full;

  const kept: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(capped)) {
    if (
      JSON.stringify({ ...kept, [key]: value }).length > EXTRA_DATA_MAX_BYTES
    ) {
      break;
    }
    kept[key] = value;
  }
  return JSON.stringify(kept);
}

export interface EventMetadata {
  country: string | undefined;
  region: string | undefined;
  city: string | undefined;
  ipAddress: string;
  timestamp: number;
  userAgent: string;
}

export function getEventMetadata(
  request: Request,
  defaultIp: string,
  defaultUserAgent: string,
): EventMetadata {
  const cf = request.cf ?? {};
  return {
    country: (cf.country as string) || undefined,
    region: (cf.region as string) || undefined,
    city: (cf.city as string) || undefined,
    ipAddress: defaultIp,
    timestamp: Date.now(),
    userAgent: defaultUserAgent,
  };
}
