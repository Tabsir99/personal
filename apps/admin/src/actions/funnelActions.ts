"use server";
import { z } from "zod";
import { db, Collections } from "@/config/firebaseAdmin";
import { wrap, HttpError } from "@/lib/appUtils";
import type { FunnelDefinition } from "@/lib/analyticsTypes";

const stepMatchSchema = z.enum([
  "equals",
  "contains",
  "startsWith",
  "endsWith",
]);
const goalCompletionSchema = z.enum(["completed"]);

const stepSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string().min(1),
    name: z.string().trim().min(1),
    type: z.literal("pageview"),
    url: z.string().trim().min(1),
    urlMatchType: stepMatchSchema,
    goalCompletionType: goalCompletionSchema,
  }),
  z.object({
    id: z.string().min(1),
    name: z.string().trim().min(1),
    type: z.literal("goal"),
    goalName: z.string().trim().min(1),
    goalCompletionType: goalCompletionSchema,
  }),
]);

const funnelSchema = z.object({
  id: z.string(),
  websiteId: z.string(),
  name: z.string(),
  slug: z.string(),
  steps: z.array(stepSchema),
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const createInputSchema = z.object({
  websiteId: z.string().trim().min(1),
  name: z.string().trim().min(1).max(80),
  steps: z.array(stepSchema).min(1).max(8),
});

const updateInputSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  steps: z.array(stepSchema).min(1).max(8).optional(),
  isActive: z.boolean().optional(),
});

export type FunnelCreateInput = z.infer<typeof createInputSchema>;
export type FunnelUpdateInput = z.infer<typeof updateInputSchema>;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const collection = () => db.collection(Collections.FUNNELS);

export async function listFunnels(
  websiteId: string,
): Promise<FunnelDefinition[]> {
  if (!websiteId) return [];
  const snap = await collection().where("websiteId", "==", websiteId).get();
  return snap.docs
    .map((d) => funnelSchema.parse(d.data()) as FunnelDefinition)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getFunnel(id: string): Promise<FunnelDefinition> {
  const snap = await collection().doc(id).get();
  if (!snap.exists) throw new HttpError(404, "Funnel not found");
  return funnelSchema.parse(snap.data()) as FunnelDefinition;
}

export const createFunnel = wrap(
  async (input: FunnelCreateInput): Promise<FunnelDefinition> => {
    const parsed = createInputSchema.parse(input);
    const ref = collection().doc();
    const now = new Date().toISOString();
    const funnel: FunnelDefinition = {
      id: ref.id,
      websiteId: parsed.websiteId,
      name: parsed.name,
      slug: slugify(parsed.name) || ref.id,
      steps: parsed.steps,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    await ref.set(funnel);
    return funnel;
  },
);

export const updateFunnel = wrap(
  async (id: string, input: FunnelUpdateInput): Promise<FunnelDefinition> => {
    const patch = updateInputSchema.parse(input);
    const ref = collection().doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpError(404, "Funnel not found");
    const current = funnelSchema.parse(snap.data()) as FunnelDefinition;
    const next: FunnelDefinition = {
      ...current,
      ...(patch.name
        ? { name: patch.name, slug: slugify(patch.name) || id }
        : {}),
      ...(patch.steps ? { steps: patch.steps } : {}),
      ...(patch.isActive !== undefined ? { isActive: patch.isActive } : {}),
      updatedAt: new Date().toISOString(),
    };
    await ref.set(next);
    return next;
  },
);

export const deleteFunnel = wrap(
  async (id: string): Promise<{ id: string }> => {
    await collection().doc(id).delete();
    return { id };
  },
);
