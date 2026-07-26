"use server";
import { FieldValue } from "firebase-admin/firestore";
import { wrap } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import { setupStripe } from "@/lib/stripeStore";
import {
  websitesDocRef,
  websiteSchema,
  readWebsiteConfig,
  slugify,
  syncOriginsToKV,
  deleteWebsiteFromKV,
} from "@/lib/analyticsWebsites";

export type { AnalyticsWebsite } from "@/lib/analyticsWebsites";

export const getAnalyticsWebsites = wrap(async () => {
  await requireAuth();
  return (await readWebsiteConfig()).websites;
});

export const addAnalyticsWebsite = wrap(
  async (input: {
    name: string;
    origins: string[];
    restrictedKey?: string;
  }) => {
    await requireAuth();

    const baseId = slugify(input.name);
    if (!baseId) throw new Error("Name must produce a valid ID");

    const config = await readWebsiteConfig();

    let id = baseId;
    let suffix = 1;
    while (config.websites.some((w) => w.id === id)) {
      id = `${baseId}-${suffix++}`;
    }

    const setup = input.restrictedKey
      ? await setupStripe(id, input.restrictedKey)
      : null;

    const website = websiteSchema.parse({
      id,
      name: input.name,
      origins: input.origins,
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
  },
);

export const updateAnalyticsWebsite = wrap(
  async (
    websiteId: string,
    patch: { name?: string; origins?: string[]; restrictedKey?: string },
  ) => {
    await requireAuth();

    const config = await readWebsiteConfig();
    const idx = config.websites.findIndex((w) => w.id === websiteId);
    if (idx === -1) throw new Error(`Website "${websiteId}" not found`);

    const { restrictedKey, ...websitePatch } = patch;

    const setup = restrictedKey
      ? await setupStripe(websiteId, restrictedKey)
      : null;

    const updated = {
      ...config.websites[idx],
      ...websitePatch,
      ...(setup ? { stripe: setup.marker } : {}),
    };
    websiteSchema.parse(updated);
    config.websites[idx] = updated;

    await websitesDocRef.set(
      {
        websites: config.websites,
        ...(setup ? { stripeSecrets: { [websiteId]: setup.secret } } : {}),
      },
      { merge: true },
    );
    if (websitePatch.origins) {
      await syncOriginsToKV(websiteId, websitePatch.origins);
    }

    return updated;
  },
);

export const deleteAnalyticsWebsite = wrap(async (websiteId: string) => {
  await requireAuth();

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
