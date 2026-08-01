import { NextRequest } from "next/server";
import type { AnalyticsEventRow } from "@tabsircg/schemas/analytics";
import { ANALYTICS_TABLE } from "@tabsircg/schemas/analytics";

/**
 * Shared plumbing for analytics integration tests that run against a REAL
 * Tinybird workspace: ingest seeded rows, wait for async ingestion to become
 * queryable, drive a route handler, and delete the rows afterward.
 *
 * Reads TINYBIRD_HOST / TINYBIRD_TOKEN from the environment (loaded by
 * vitest/setup.ts). `TINYBIRD_ENABLED` is false when either is missing, so a
 * suite can self-skip instead of failing.
 */
const HOST = process.env.TINYBIRD_HOST;
const TOKEN = process.env.TINYBIRD_TOKEN;

export const TINYBIRD_ENABLED = Boolean(HOST && TOKEN);

function quoted(websiteIds: string[]): string {
  return websiteIds.map((w) => `'${w}'`).join(", ");
}

/** Ingest rows in batches over the NDJSON events endpoint; throws on quarantine. */
export async function ingestRows(
  rows: AnalyticsEventRow[],
  batchSize = 1000,
): Promise<void> {
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const res = await fetch(`${HOST}/v0/events?name=${ANALYTICS_TABLE}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/x-ndjson",
      },
      body: batch.map((r) => JSON.stringify(r)).join("\n"),
    });
    const body = (await res.json()) as { quarantined_rows?: number };
    if (!res.ok) throw new Error(`ingest failed (${res.status})`);
    if (body.quarantined_rows)
      throw new Error(`ingest quarantined ${body.quarantined_rows} rows`);
  }
}

/**
 * Poll until at least `expected` rows are visible for the given website ids.
 * Async ingest isn't queryable for a few seconds, so we skip the polls that
 * would always see 0 rows.
 */
export async function waitForRows(
  websiteIds: string[],
  expected: number,
  timeoutMs = 90_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  await new Promise((r) => setTimeout(r, 5000));
  for (;;) {
    const res = await fetch(`${HOST}/v0/sql`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "text/plain; charset=utf-8",
      },
      body: `SELECT count() AS c FROM ${ANALYTICS_TABLE} WHERE website_id IN (${quoted(
        websiteIds,
      )}) FORMAT JSON`,
    });
    const c = Number(
      ((await res.json()) as { data: { c: number }[] }).data[0]?.c ?? 0,
    );
    if (c >= expected) return;
    if (Date.now() > deadline)
      throw new Error(
        `only ${c}/${expected} rows visible after ${timeoutMs}ms`,
      );
    await new Promise((r) => setTimeout(r, 2000));
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function waitForJob(
  jobUrl: string,
  timeoutMs = 60_000,
): Promise<"done" | "error" | "timeout"> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const job = (await (
      await fetch(jobUrl, { headers: { Authorization: `Bearer ${TOKEN}` } })
    ).json()) as { status?: string };
    if (job.status === "done") return "done";
    if (job.status === "error") return "error";
    if (Date.now() > deadline) return "timeout";
    await sleep(1000);
  }
}

const DELETE_ATTEMPTS = 10;
const DELETE_BACKOFF_MS = 2000;
const DELETE_BACKOFF_CAP_MS = 15_000;

let deleteQueue: Promise<unknown> = Promise.resolve();

function serializeDelete<T>(task: () => Promise<T>): Promise<T> {
  const run = deleteQueue.then(task, task);
  deleteQueue = run.catch(() => undefined);
  return run;
}

async function requestDelete(websiteIds: string[]): Promise<Response> {
  return fetch(`${HOST}/v0/datasources/${ANALYTICS_TABLE}/delete`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `delete_condition=${encodeURIComponent(
      `website_id IN (${quoted(websiteIds)})`,
    )}`,
  });
}

/**
 * Delete a run's rows and WAIT for the async delete job to finish, so nothing
 * lingers after the process exits.
 *
 * Tinybird permits exactly ONE delete job per workspace at a time and answers
 * 429 for any overlap. Calls are serialized in-process and retried with
 * backoff so a parallel worker holding the slot can't silently strand rows.
 * A cleanup that ultimately fails warns loudly rather than failing the suite.
 */
export async function cleanupRows(websiteIds: string[]): Promise<void> {
  return serializeDelete(async () => {
    let reason = "unknown";
    for (let attempt = 0; attempt < DELETE_ATTEMPTS; attempt++) {
      try {
        const res = await requestDelete(websiteIds);

        if (res.status === 429) {
          reason = "delete slot busy (429)";
          await sleep(
            Math.min(DELETE_BACKOFF_MS * 2 ** attempt, DELETE_BACKOFF_CAP_MS),
          );
          continue;
        }

        const job = (await res.json()) as {
          job_url?: string;
          error?: string;
        };

        if (!res.ok || !job.job_url) {
          reason = job.error ?? `HTTP ${res.status}`;
          await sleep(DELETE_BACKOFF_MS);
          continue;
        }

        const status = await waitForJob(job.job_url);
        if (status === "done") return;

        reason = `delete job ${status}`;
        await sleep(DELETE_BACKOFF_MS);
      } catch (error) {
        reason = error instanceof Error ? error.message : String(error);
        await sleep(DELETE_BACKOFF_MS);
      }
    }

    console.warn(
      `[tinybird] cleanup FAILED for ${quoted(websiteIds)} after ${DELETE_ATTEMPTS} attempts (${reason}). Rows are still in the workspace.`,
    );
  });
}

type Handler = (req: NextRequest, ctx: unknown) => Promise<Response>;

/** Drive a route handler with query params and unwrap the ApiResponse envelope. */
export async function callRoute<T>(
  handler: Handler,
  qs: Record<string, string>,
): Promise<T> {
  const url = `http://localhost/api/analytics?${new URLSearchParams(qs)}`;
  const res = await handler(new NextRequest(url), {});
  const body = (await res.json()) as
    { status: "success"; data: T } | { status: "error"; message: string };
  if (body.status !== "success")
    throw new Error(`route error: ${body.message}`);
  return body.data;
}
