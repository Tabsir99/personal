// import "server-only";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  ADMIN_USERNAME: requireEnv("ADMIN_USERNAME"),
  ADMIN_PASSWORD: requireEnv("ADMIN_PASSWORD"),
  JWT_SECRET: requireEnv("JWT_SECRET"),
  COOKIE_NAME: "t",

  FIREBASE_CREDENTIAL: JSON.parse(requireEnv("FIREBASE_CREDENTIAL")),

  CLOUDFLARE_R2_AK_ID: requireEnv("CLOUDFLARE_R2_AK_ID"),
  CLOUDFLARE_R2_AK: requireEnv("CLOUDFLARE_R2_AK"),
  CLOUDFLARE_R2_ENDPOINT: requireEnv("CLOUDFLARE_R2_ENDPOINT"),

  SERVER_TOKEN: requireEnv("SERVER_TOKEN"),
  ADMIN_ORIGIN: requireEnv("NEXT_PUBLIC_ADMIN_ORIGIN"),

  CF_ACCOUNT_ID: requireEnv("CF_ACCOUNT_ID"),
  CF_API_TOKEN: requireEnv("CF_API_TOKEN"),
  CF_KV_NAMESPACE_ID: requireEnv("CF_KV_NAMESPACE_ID"),

  TINYBIRD_HOST: requireEnv("TINYBIRD_HOST"),
  TINYBIRD_TOKEN: requireEnv("TINYBIRD_TOKEN"),
} as const;

// Boot-time presence check; SDK reads ANTHROPIC_AUTH_TOKEN from process.env itself.
requireEnv("ANTHROPIC_AUTH_TOKEN");
