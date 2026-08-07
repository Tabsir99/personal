"use server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { wrap } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import { setupStripe } from "@/lib/stripeStore";
import {
  websitesDocRef,
  websiteSchema,
  websiteInputSchema,
  websitePatchSchema,
  readWebsiteConfig,
  syncOriginsToKV,
  deleteWebsiteFromKV,
  type AnalyticsWebsite,
  type WebsiteInput,
  type WebsitePatch,
} from "@/lib/analyticsWebsites";

export type { AnalyticsWebsite } from "@/lib/analyticsWebsites";

export const getAnalyticsWebsites = wrap(async () => {
  await requireAuth();
  return (await readWebsiteConfig()).websites;
});

export const addAnalyticsWebsite = wrap(async (rawInput: WebsiteInput) => {
  await requireAuth();

  const { name, origins, restrictedKey } = websiteInputSchema.parse(rawInput);

  const config = await readWebsiteConfig();

  let id = randomUUID();
  while (config.websites.some((w) => w.id === id)) id = randomUUID();

  const setup = restrictedKey ? await setupStripe(id, restrictedKey) : null;

  const website = websiteSchema.parse({
    id,
    name,
    origins,
    createdAt: Date.now(),
    ...(setup ? { stripe: setup.marker } : {}),
  });

  config.websites.push(website);
  await websitesDocRef.set(
    {
      websites: config.websites,
      ...(setup ? { stripeSecrets: { [id]: setup.secret } } : {}),
    },
    { merge: true },
  );
  await syncOriginsToKV(website.id, website.origins);

  return website;
});

export const updateAnalyticsWebsite = wrap(
  async (rawWebsiteId: string, rawPatch: WebsitePatch) => {
    await requireAuth();

    const websiteId = z.uuid().parse(rawWebsiteId);
    const { name, origins, restrictedKey } = websitePatchSchema.parse(rawPatch);

    const config = await readWebsiteConfig();
    const existing = config.websites.find((w) => w.id === websiteId);
    if (!existing) throw new Error(`Website "${websiteId}" not found`);

    const setup = restrictedKey
      ? await setupStripe(websiteId, restrictedKey)
      : null;

    const updated: AnalyticsWebsite = websiteSchema.parse({
      id: existing.id,
      createdAt: existing.createdAt,
      name: name ?? existing.name,
      origins: origins ?? existing.origins,
      ...((setup?.marker ?? existing.stripe)
        ? { stripe: setup?.marker ?? existing.stripe }
        : {}),
    });

    config.websites[config.websites.indexOf(existing)] = updated;

    await websitesDocRef.set(
      {
        websites: config.websites,
        ...(setup ? { stripeSecrets: { [websiteId]: setup.secret } } : {}),
      },
      { merge: true },
    );
    if (origins) await syncOriginsToKV(websiteId, origins);

    return updated;
  },
);

export const deleteAnalyticsWebsite = wrap(async (rawWebsiteId: string) => {
  await requireAuth();

  const websiteId = z.uuid().parse(rawWebsiteId);
  const config = await readWebsiteConfig();
  if (!config.websites.some((w) => w.id === websiteId)) {
    throw new Error(`Website "${websiteId}" not found`);
  }

  const filtered = config.websites.filter((w) => w.id !== websiteId);
  await websitesDocRef.update({
    websites: filtered,
    [`stripeSecrets.${websiteId}`]: FieldValue.delete(),
  });
  await deleteWebsiteFromKV(websiteId);

  return { deleted: websiteId };
});
