import { afterAll, describe, expect, it } from "vitest";

import { db, Collections } from "@/config/firebaseAdmin";
import {
  createFunnel,
  updateFunnel,
  deleteFunnel,
  listFunnels,
  getFunnel,
} from "@/actions/funnelActions";
import type { FunnelStep } from "@/lib/analyticsTypes";

const WID = `ftest-crud-${Date.now().toString(36)}`;

const steps: FunnelStep[] = [
  {
    id: "s1",
    name: "Landing",
    type: "pageview",
    url: "/",
    urlMatchType: "equals",
    goalCompletionType: "completed",
  },
  {
    id: "s2",
    name: "Signed up",
    type: "goal",
    goalName: "signup",
    goalCompletionType: "completed",
  },
];

async function purge() {
  const snap = await db
    .collection(Collections.FUNNELS)
    .where("websiteId", "==", WID)
    .get();
  await Promise.all(snap.docs.map((d) => d.ref.delete()));
}

describe("funnel actions CRUD", () => {
  afterAll(purge);

  it("round-trips create, read, update, delete", async () => {
    const created = await createFunnel({
      websiteId: WID,
      name: "Signup Flow",
      steps,
    });
    expect(created.status).toBe("success");
    if (created.status !== "success") return;

    const { id } = created.data;
    expect(created.data.slug).toBe("signup-flow");
    expect(created.data.isActive).toBe(true);
    expect(created.data.steps).toEqual(steps);
    expect(created.data.createdAt).toBe(created.data.updatedAt);

    const listed = await listFunnels(WID);
    expect(listed.map((f) => f.id)).toEqual([id]);
    expect((await getFunnel(id)).name).toBe("Signup Flow");

    const nextSteps: FunnelStep[] = [
      ...steps,
      {
        id: "s3",
        name: "Paid",
        type: "goal",
        goalName: "purchase",
        goalCompletionType: "completed",
      },
    ];
    const updated = await updateFunnel(id, {
      name: "Checkout Flow",
      steps: nextSteps,
    });
    expect(updated.status).toBe("success");
    if (updated.status !== "success") return;

    expect(updated.data.id).toBe(id);
    expect(updated.data.slug).toBe("checkout-flow");
    expect(updated.data.steps).toHaveLength(3);
    expect(updated.data.createdAt).toBe(created.data.createdAt);
    expect(new Date(updated.data.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(created.data.updatedAt).getTime(),
    );

    expect((await getFunnel(id)).name).toBe("Checkout Flow");

    const deleted = await deleteFunnel(id);
    expect(deleted.status).toBe("success");
    expect(await listFunnels(WID)).toEqual([]);
    await expect(getFunnel(id)).rejects.toThrow(/not found/i);
  });

  it("rejects an update against a missing funnel", async () => {
    const res = await updateFunnel("does-not-exist", { name: "Nope" });
    expect(res.status).toBe("error");
  });

  it("rejects step counts outside 1..8", async () => {
    const empty = await createFunnel({
      websiteId: WID,
      name: "Empty",
      steps: [],
    });
    expect(empty.status).toBe("error");

    const tooMany = await createFunnel({
      websiteId: WID,
      name: "Too many",
      steps: Array.from({ length: 9 }, (_, i) => ({
        ...steps[0],
        id: `s${i}`,
      })),
    });
    expect(tooMany.status).toBe("error");
  });

  it("rejects a blank step label", async () => {
    const res = await createFunnel({
      websiteId: WID,
      name: "Blank label",
      steps: [{ ...steps[0], name: "  " }],
    });
    expect(res.status).toBe("error");
  });
});
