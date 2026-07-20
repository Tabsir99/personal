export interface EventMetadata {
  country: string;
  region: string;
  city: string;
  ipAddress: string;
  timestamp: number;
  userAgent: string;
}

export function getEventMetadata(
  request: Request,
  defaultIp: string,
  defaultUserAgent: string,
  payload: any,
  environment?: string
): EventMetadata {
  const cf = request.cf || {};
  let country = (cf.country as string) || "Unknown";
  let region = (cf.region as string) || "Unknown";
  let city = (cf.city as string) || "Unknown";
  let ipAddress = defaultIp;
  let timestamp = Date.now();
  let userAgent = defaultUserAgent;

  if (environment === "dev" && payload?.cfOverride) {
    const override = payload.cfOverride;
    if (override.country) country = override.country;
    if (override.region) region = override.region;
    if (override.city) city = override.city;
    if (override.ip) ipAddress = override.ip;
    if (override.timestamp) timestamp = override.timestamp;
    if (override.userAgent) userAgent = override.userAgent;
  }

  return { country, region, city, ipAddress, timestamp, userAgent };
}
