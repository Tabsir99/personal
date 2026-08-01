type CacheEntry = { allowedOrigins: string[]; expiresAt: number };

const validWebsitesCache = new Map<string, CacheEntry>();

const KNOWN_TTL_MS = 60_000;
const UNKNOWN_TTL_MS = 10_000;
const MAX_CACHE_ENTRIES = 1000;

function readCache(cacheKey: string, now: number): string[] | undefined {
  const entry = validWebsitesCache.get(cacheKey);
  if (!entry) return undefined;
  if (entry.expiresAt <= now) {
    validWebsitesCache.delete(cacheKey);
    return undefined;
  }
  return entry.allowedOrigins;
}

function writeCache(cacheKey: string, allowedOrigins: string[], now: number) {
  if (validWebsitesCache.size >= MAX_CACHE_ENTRIES) {
    const oldest = validWebsitesCache.keys().next();
    if (!oldest.done) validWebsitesCache.delete(oldest.value);
  }
  const ttl = allowedOrigins.length > 0 ? KNOWN_TTL_MS : UNKNOWN_TTL_MS;
  validWebsitesCache.set(cacheKey, { allowedOrigins, expiresAt: now + ttl });
}

export function resetOriginCache() {
  validWebsitesCache.clear();
}

export async function validateAccess(
  request: Request,
  websiteId: string,
  kvNamespace: KVNamespace,
) {
  const origin = request.headers.get("Origin") || "";
  const cacheKey = `website_${websiteId}`;
  const now = Date.now();

  let allowedOrigins = readCache(cacheKey, now);

  if (allowedOrigins === undefined) {
    // KV holds a JSON array like ["https://myportfolio.com", "http://localhost:3000"],
    // falling back to a bare string for hand-written records.
    const kvRecord = await kvNamespace.get(cacheKey);
    allowedOrigins = [];

    if (kvRecord) {
      try {
        const parsed = JSON.parse(kvRecord);
        allowedOrigins = Array.isArray(parsed) ? parsed : [kvRecord];
      } catch (e) {
        allowedOrigins = [kvRecord];
      }
    }

    writeCache(cacheKey, allowedOrigins, now);
  }

  const isAuthorized =
    allowedOrigins.includes(origin) || allowedOrigins.includes("*");

  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": origin || "*",
  };

  return {
    isAuthorized,
    corsHeaders,
    rawUserAgent: (request.headers.get("User-Agent") || "").slice(0, 500),
    ipAddress: request.headers.get("CF-Connecting-IP") || "unknown",
  };
}
