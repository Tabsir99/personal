// import "server-only";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  RUNTIME: requireEnv("RUNTIME"),
  // ===== Auth =====
  ADMIN_USERNAME: requireEnv("ADMIN_USERNAME"),
  ADMIN_PASSWORD: requireEnv("ADMIN_PASSWORD"),
  JWT_SECRET: requireEnv("JWT_SECRET"),
  COOKIE_NAME: "t",

  // ===== Firebase =====
  FIREBASE_PRIVATE_KEY: requireEnv("FIREBASE_PRIVATE_KEY"),
  FIREBASE_CLIENT_EMAIL: requireEnv("FIREBASE_CLIENT_EMAIL"),

  // ===== Cloudflare R2 =====
  CLOUDFLARE_R2_AK_ID: requireEnv("CLOUDFLARE_R2_AK_ID"),
  CLOUDFLARE_R2_AK: requireEnv("CLOUDFLARE_R2_AK"),
  CLOUDFLARE_R2_ENDPOINT: requireEnv("CLOUDFLARE_R2_ENDPOINT"),

  // ===== LinkedIn OAuth =====
  LINKEDIN_CLINET_ID: requireEnv("LINKEDIN_CLINET_ID"),
  LINKEDIN_CLINET_SECRET: requireEnv("LINKEDIN_CLINET_SECRET"),

  // ===== Server to server token =====
  SERVER_TOKEN: requireEnv("SERVER_TOKEN"),
} as const;

// Boot-time presence check; SDK reads ANTHROPIC_AUTH_TOKEN from process.env itself.
requireEnv("ANTHROPIC_AUTH_TOKEN");
