// env.ts

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  // ===== App Config =====
  ADMIN_ORIGIN: requireEnv("ADMIN_ORIGIN"),
  NEXT_PUBLIC_BLOGSITE_HOSTNAME: requireEnv("NEXT_PUBLIC_BLOGSITE_HOSTNAME"),

  // ===== Auth =====
  ADMIN_USERNAME: requireEnv("ADMIN_USERNAME"),
  ADMIN_PASSWORD: requireEnv("ADMIN_PASSWORD"),
  JWT_SECRET: requireEnv("JWT_SECRET"),
  SERVER_TO_SERVER_TOKEN: requireEnv("SERVER_TO_SERVER_TOKEN"),

  // ===== Firebase =====
  NEXT_PUBLIC_FIREBASE_CONFIG: requireEnv("NEXT_PUBLIC_FIREBASE_CONFIG"),
  FIREBASE_ADMIN_CONFIG: requireEnv("FIREBASE_ADMIN_CONFIG"),

  // ===== Redis =====
  REDIS_KV_REST_API_URL: requireEnv("REDIS_KV_REST_API_URL"),
  REDIS_KV_REST_API_TOKEN: requireEnv("REDIS_KV_REST_API_TOKEN"),

  // ===== Cloudflare R2 =====
  CLOUDFLARE_R2_AK_ID: requireEnv("CLOUDFLARE_R2_AK_ID"),
  CLOUDFLARE_R2_AK: requireEnv("CLOUDFLARE_R2_AK"),
  CLOUDFLARE_R2_ENDPOINT: requireEnv("CLOUDFLARE_R2_ENDPOINT"),

  // ===== LinkedIn OAuth =====
  LINKEDIN_CLINET_ID: requireEnv("LINKEDIN_CLINET_ID"),
  LINKEDIN_CLINET_SECRET: requireEnv("LINKEDIN_CLINET_SECRET"),
} as const;
