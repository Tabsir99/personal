"use server";
import { z } from "zod";
import { db, Collections } from "@/config/firebaseAdmin";
import { wrap } from "@/lib/appUtils";

const CONFIG_DOC = "blog";
const CONFIG_DOC_REF = db.collection(Collections.CONFIG).doc(CONFIG_DOC);

export const CONFIG_FIELDS = ["tags", "kinds", "schemaTypes"] as const;
export type ConfigField = (typeof CONFIG_FIELDS)[number];

const configDocSchema = z.object({
  tags: z.array(z.string()).default([]),
  kinds: z.array(z.string()).default([]),
  schemaTypes: z.array(z.string()).default([]),
});

const valueInputSchema = z.string().trim().min(1, "Value cannot be empty");

const normalize = (field: ConfigField, value: string) =>
  field === "tags" ? value.toLowerCase() : value;

export async function readConfigField(field: ConfigField): Promise<string[]> {
  const snap = await CONFIG_DOC_REF.get();
  return configDocSchema.parse(snap.data() ?? {})[field];
}

export const addConfigValue = wrap(
  async (field: ConfigField, value: string) => {
    const trimmed = valueInputSchema.parse(value);
    const normalized = normalize(field, trimmed);

    const existing = await readConfigField(field);
    const seen = new Set(existing.map((v) => v.toLowerCase()));
    if (!seen.has(normalized.toLowerCase())) existing.push(normalized);
    const values = existing.slice().sort((a, b) => a.localeCompare(b));

    await CONFIG_DOC_REF.set({ [field]: values }, { merge: true });

    return { value: normalized, values };
  },
);
