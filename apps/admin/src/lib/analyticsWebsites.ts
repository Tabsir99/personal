import "server-only";
import { z } from "zod";
import { db, Collections } from "@/config/firebaseAdmin";
import { env } from "@/config/env.server";

export const websitesDocRef = db
  .collection(Collections.CONFIG)
  .doc("analytics");

const stripeMarkerSchema = z.object({
  configured: z.boolean(),
  restrictedKeyLast4: z.string().optional(),
});

export const websiteSchema = z.object({
  id: z
    .string()
    .min(1)
    .max(96)
    .regex(/^[\w-]+$/, "Only alphanumeric, dashes, and underscores"),
  name: z.string().min(1).max(100),
  origins: z
    .array(z.string().url().or(z.string().regex(/^\*$/)))
    .min(1, "At least one origin required"),
  createdAt: z.number(),
  stripe: stripeMarkerSchema.optional(),
});

export type AnalyticsWebsite = z.infer<typeof websiteSchema>;

export async function readWebsiteConfig(): Promise<{
  websites: AnalyticsWebsite[];
}> {
  const snap = await websitesDocRef.get();
  return { websites: snap.data()?.websites ?? [] };
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/-{2,}/g, "-");
}

export async function syncOriginsToKV(websiteId: string, origins: string[]) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/storage/kv/namespaces/${env.CF_KV_NAMESPACE_ID}/values/website_${websiteId}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${env.CF_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(origins),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`CF KV sync failed (${res.status}): ${text}`);
  }
}

export async function deleteWebsiteFromKV(websiteId: string) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/storage/kv/namespaces/${env.CF_KV_NAMESPACE_ID}/values/website_${websiteId}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${env.CF_API_TOKEN}` },
  });
  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`CF KV delete failed (${res.status}): ${text}`);
  }
}
