"use server";
import { z } from "zod";
import { db, Collections } from "@/config/firebaseAdmin";
import { env } from "@/config/env.server";
import { wrap } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";

const COLLECTION = Collections.CONFIG;
const DOC_ID = "analytics";

const websiteSchema = z.object({
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
});

export type AnalyticsWebsite = z.infer<typeof websiteSchema>;

interface AnalyticsConfig {
  websites: AnalyticsWebsite[];
}

const docRef = db.collection(COLLECTION).doc(DOC_ID);

async function readConfig(): Promise<AnalyticsConfig> {
  const snap = await docRef.get();
  const data = snap.data();
  return { websites: data?.websites ?? [] };
}

async function syncToKV(websiteId: string, origins: string[]) {
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

async function deleteFromKV(websiteId: string) {
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

export const getAnalyticsWebsites = wrap(async () => {
  await requireAuth();
  return (await readConfig()).websites;
});

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/-{2,}/g, "-");
}

export const addAnalyticsWebsite = wrap(
  async (input: { name: string; origins: string[] }) => {
    await requireAuth();

    const baseId = slugify(input.name);
    if (!baseId) throw new Error("Name must produce a valid ID");

    const config = await readConfig();

    let id = baseId;
    let suffix = 1;
    while (config.websites.some((w) => w.id === id)) {
      id = `${baseId}-${suffix++}`;
    }

    const website = websiteSchema.parse({
      id,
      name: input.name,
      origins: input.origins,
      createdAt: Date.now(),
    });

    config.websites.push(website);
    await docRef.set({ websites: config.websites }, { merge: true });
    await syncToKV(website.id, website.origins);

    return website;
  },
);

export const updateAnalyticsWebsite = wrap(
  async (websiteId: string, patch: { name?: string; origins?: string[] }) => {
    await requireAuth();

    const config = await readConfig();
    const idx = config.websites.findIndex((w) => w.id === websiteId);
    if (idx === -1) throw new Error(`Website "${websiteId}" not found`);

    const updated = { ...config.websites[idx], ...patch };
    websiteSchema.parse(updated);
    config.websites[idx] = updated;

    await docRef.set({ websites: config.websites }, { merge: true });
    if (patch.origins) {
      await syncToKV(websiteId, patch.origins);
    }

    return updated;
  },
);

export const deleteAnalyticsWebsite = wrap(async (websiteId: string) => {
  await requireAuth();

  const config = await readConfig();
  const filtered = config.websites.filter((w) => w.id !== websiteId);
  if (filtered.length === config.websites.length) {
    throw new Error(`Website "${websiteId}" not found`);
  }

  await docRef.set({ websites: filtered }, { merge: true });
  await deleteFromKV(websiteId);

  return { deleted: websiteId };
});
