type CacheValue = { allowedOrigins: string[]; timestamp: number };
const validWebsitesCache = new Map<string, CacheValue>();
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

export async function validateAccess(
  request: Request,
  websiteId: string,
  kvNamespace: KVNamespace,
) {
  const origin = request.headers.get("Origin") || "";
  const cacheKey = `website_${websiteId}`;
  const now = Date.now();
  const cached = validWebsitesCache.get(cacheKey);

  let allowedOrigins: string[] = [];

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    allowedOrigins = cached.allowedOrigins;
  } else {
    // Cache miss or expired, fetch from KV
    const kvRecord = await kvNamespace.get(cacheKey);

    if (kvRecord) {
      try {
        // We expect a JSON array like: ["https://myportfolio.com", "http://localhost:3000"]
        const parsed = JSON.parse(kvRecord);
        if (Array.isArray(parsed)) {
          allowedOrigins = parsed;
        } else {
          allowedOrigins = [kvRecord];
        }
      } catch (e) {
        // Fallback if it's just a raw string domain
        allowedOrigins = [kvRecord];
      }
    }

    // Update cache if we found allowed origins, avoiding caching negative lookups indefinitely during configuration
    if (allowedOrigins.length > 0) {
      if (validWebsitesCache.size > 1000) validWebsitesCache.clear();
      validWebsitesCache.set(cacheKey, { allowedOrigins, timestamp: now });
    }
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
