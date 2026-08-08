import { env } from "@/config/env";

const MAX_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 500;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const isRetryable = (status: number) =>
  status === 408 || status === 429 || status >= 500;

const describe = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export async function adminFetch(
  path: string,
  tags: string[],
): Promise<Response> {
  let lastFailure = "no attempt completed";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (attempt > 1) await sleep(BASE_BACKOFF_MS * 2 ** (attempt - 2));

    try {
      const response = await fetch(`${env.ADMIN_ORIGIN}${path}`, {
        headers: { serverToken: env.SERVER_TOKEN },
        cache: "force-cache",
        next: { tags },
      });

      if (!isRetryable(response.status)) return response;
      lastFailure = `HTTP ${response.status}`;
    } catch (error) {
      lastFailure = describe(error);
    }
  }

  throw new Error(
    `${path} unavailable after ${MAX_ATTEMPTS} attempts: ${lastFailure}`,
  );
}
