"use server";
import { z } from "zod";
import { db, Collections } from "@/config/firebaseAdmin";
import { wrap } from "@/lib/appUtils";
import { sendRevalidateRequest } from "@/lib/blogUtils";
import { siteConfigSchema, type SiteConfig } from "@tabsircg/schemas/site";
import { pageDataSchema, type PageData } from "@tabsircg/schemas/portfolio";

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
    await sendRevalidateRequest({ tag: "blog-config" });

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
  await sendRevalidateRequest({ tag: "site-config" });
  return merged;
});

const portfolioCatalogSchema = z.object({
  skillCatalog: z.array(z.string()).default([]),
});
export type PortfolioCatalog = z.infer<typeof portfolioCatalogSchema>;

export async function readPortfolioPageData(): Promise<PageData | null> {
  const snap = await PORTFOLIO_DOC_REF.get();
  const raw = snap.data()?.pageData;
  if (!raw) return null;
  return pageDataSchema.parse(raw);
}

export async function writePortfolioPageData(data: PageData): Promise<void> {
  // mergeFields: only the `pageData` field is touched; sibling fields
  // (skillCatalog) are preserved. The `pageData` object itself is replaced
  // wholesale — no deep merge — so removed keys do not linger.
  await PORTFOLIO_DOC_REF.set(
    { pageData: data },
    { mergeFields: ["pageData"] },
  );
}

export async function readPortfolioCatalog(): Promise<PortfolioCatalog> {
  const snap = await PORTFOLIO_DOC_REF.get();
  return portfolioCatalogSchema.parse(snap.data() ?? {});
}

export const addPortfolioSkill = wrap(async (value: string) => {
  const trimmed = valueInputSchema.parse(value);

  const existing = (await readPortfolioCatalog()).skillCatalog;
  const seen = new Set(existing.map((v) => v.toLowerCase()));
  if (!seen.has(trimmed.toLowerCase())) existing.push(trimmed);
  const values = existing.slice().sort((a, b) => a.localeCompare(b));

  await PORTFOLIO_DOC_REF.set({ skillCatalog: values }, { merge: true });

  return { value: trimmed, values };
});
