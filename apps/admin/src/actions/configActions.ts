"use server";
import { z } from "zod";
import { db, Collections } from "@/config/firebaseAdmin";
import { wrap } from "@/lib/appUtils";
import { siteConfigSchema, type SiteConfig } from "@tabsircg/schemas/site";
import type { PageData } from "@tabsircg/schemas/portfolio";

const CONFIG_DOC = "blog";
const CONFIG_DOC_REF = db.collection(Collections.CONFIG).doc(CONFIG_DOC);

const SITE_DOC = "site";
const SITE_DOC_REF = db.collection(Collections.CONFIG).doc(SITE_DOC);

const PORTFOLIO_DOC = "portfolio";
const PORTFOLIO_DOC_REF = db.collection(Collections.CONFIG).doc(PORTFOLIO_DOC);

export type ConfigField = "tags" | "kinds" | "schemaTypes";

const configDocSchema = z.object({
  tags: z.array(z.string()).default([]),
  kinds: z.array(z.string()).default([]),
  schemaTypes: z.array(z.string()).default([]),
});
export type BlogConfig = z.infer<typeof configDocSchema>;

const valueInputSchema = z.string().trim().min(1, "Value cannot be empty");

const normalize = (field: ConfigField, value: string) =>
  field === "tags" ? value.toLowerCase() : value;

export async function readConfigFields() {
  const snap = await CONFIG_DOC_REF.get();
  return configDocSchema.parse(snap.data() ?? {});
}

export const addConfigValue = wrap(
  async (field: ConfigField, value: string) => {
    const trimmed = valueInputSchema.parse(value);
    const normalized = normalize(field, trimmed);

    const existing = (await readConfigFields())[field];
    const seen = new Set(existing.map((v) => v.toLowerCase()));
    if (!seen.has(normalized.toLowerCase())) existing.push(normalized);
    const values = existing.slice().sort((a, b) => a.localeCompare(b));

    await CONFIG_DOC_REF.set({ [field]: values }, { merge: true });

    return { value: normalized, values };
  },
);

export async function readSiteConfig(): Promise<SiteConfig> {
  const snap = await SITE_DOC_REF.get();
  return siteConfigSchema.parse(snap.data() ?? {});
}

export const updateSiteConfig = wrap(async (patch: Partial<SiteConfig>) => {
  const merged = siteConfigSchema.parse({
    ...(await readSiteConfig()),
    ...patch,
  });
  await SITE_DOC_REF.set(merged);
  return merged;
});

// --- Portfolio (page data + skill catalog) -----------------------------------

const portfolioCatalogSchema = z.object({
  skillCatalog: z.array(z.string()).default([]),
  clientTypeCatalog: z.array(z.string()).default([]),
});
export type PortfolioCatalog = z.infer<typeof portfolioCatalogSchema>;

type PortfolioCatalogField = "skillCatalog" | "clientTypeCatalog";

async function addPortfolioCatalogValue(
  field: PortfolioCatalogField,
  value: string,
) {
  const trimmed = valueInputSchema.parse(value);

  const existing = (await readPortfolioCatalog())[field];
  const seen = new Set(existing.map((v) => v.toLowerCase()));
  if (!seen.has(trimmed.toLowerCase())) existing.push(trimmed);
  const values = existing.slice().sort((a, b) => a.localeCompare(b));

  await PORTFOLIO_DOC_REF.set({ [field]: values }, { merge: true });

  return { value: trimmed, values };
}

export async function readPortfolioPageData(): Promise<PageData | null> {
  const snap = await PORTFOLIO_DOC_REF.get();
  const data = snap.data();
  return (data?.pageData as PageData | undefined) ?? null;
}

export async function writePortfolioPageData(data: PageData): Promise<void> {
  await PORTFOLIO_DOC_REF.set({ pageData: data }, { merge: true });
}

export async function readPortfolioCatalog(): Promise<PortfolioCatalog> {
  const snap = await PORTFOLIO_DOC_REF.get();
  return portfolioCatalogSchema.parse(snap.data() ?? {});
}

export const addPortfolioSkill = wrap((value: string) =>
  addPortfolioCatalogValue("skillCatalog", value),
);

export const addPortfolioClientType = wrap((value: string) =>
  addPortfolioCatalogValue("clientTypeCatalog", value),
);
