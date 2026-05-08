import "server-only";
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  ADMIN_ORIGIN: requireEnv("ADMIN_ORIGIN"),
  MEDIA_ORIGIN: requireEnv("MEDIA_ORIGIN"),
  SERVER_TOKEN: requireEnv("SERVER_TOKEN"),

  LOGO_URL: requireEnv("LOGO_URL"),
  FAVICON_URL: requireEnv("FAVICON_URL"),
} as const;
