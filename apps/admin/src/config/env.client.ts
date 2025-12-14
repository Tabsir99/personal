const ADMIN_ORIGIN = process.env.NEXT_PUBLIC_ADMIN_ORIGIN;
const BLOG_ORIGIN = process.env.NEXT_PUBLIC_BLOG_ORIGIN;
const MEDIA_ORIGIN = process.env.NEXT_PUBLIC_MEDIA_ORIGIN;

if (!ADMIN_ORIGIN) {
  throw new Error("❌ Missing NEXT_PUBLIC_ADMIN_ORIGIN");
}
if (!BLOG_ORIGIN) {
  throw new Error("❌ Missing NEXT_PUBLIC_BLOG_ORIGIN");
}
if (!MEDIA_ORIGIN) {
  throw new Error("❌ Missing NEXT_PUBLIC_MEDIA_ORIGIN");
}

export const clientEnv = {
  ADMIN_ORIGIN,
  BLOG_ORIGIN,
  MEDIA_ORIGIN,
};
