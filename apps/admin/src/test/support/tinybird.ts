import { NextRequest } from "next/server";
import type { AnalyticsEventRow } from "@tabsircg/schemas/analytics";
import { ANALYTICS_TABLE } from "@tabsircg/schemas/analytics";

/** Plumbing for tests against a REAL Tinybird workspace: ingest, wait, drive a
 * route, clean up. TINYBIRD_ENABLED is false without creds, so suites skip. */
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

/** Poll until `expected` rows are visible. Async ingest isn't queryable for a
 * few seconds, so the first polls that would see 0 are skipped. */
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

/** Tinybird allows ONE delete job per workspace and 429s any overlap, so calls
 * are serialized and retried. Waits for the job so nothing lingers on exit. */
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
    | { status: "success"; data: T }
    | { status: "error"; message: string };
  if (body.status !== "success")
    throw new Error(`route error: ${body.message}`);
  return body.data;
}
