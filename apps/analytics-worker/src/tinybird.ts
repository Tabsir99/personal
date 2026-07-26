import { ANALYTICS_TABLE } from "@tabsircg/analytics-contract";

export async function sendToTinybirdWithRetry(
  tbHost: string,
  token: string,
  payload: string,
  maxRetries = 3,
): Promise<void> {
  const url = `${tbHost}/v0/events?name=${ANALYTICS_TABLE}`;
  let attempt = 0;
  let delay = 1000; // Start with 1s delay

  while (attempt <= maxRetries) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: payload,
      });

      if (res.ok) return;

      const errText = await res.text();
      console.error(
        `[Attempt ${attempt + 1}/${maxRetries + 1}] Tinybird ingest failed with status ${res.status}: ${errText}`,
      );

      // Retry only on 429 (Rate Limit) or 5xx (Server Error)
      const shouldRetry = res.status === 429 || res.status >= 500;
      if (!shouldRetry || attempt === maxRetries) {
        throw new Error(
          `Tinybird ingest failed with status ${res.status}: ${errText}`,
        );
      }
    } catch (err: any) {
      console.error(
        `[Attempt ${attempt + 1}/${maxRetries + 1}] Error during Tinybird ingest: ${err.message}`,
      );
      if (attempt === maxRetries) {
        throw err;
      }
    }

    // Wait in-memory with exponential backoff without using active CPU time
    await new Promise((resolve) => setTimeout(resolve, delay));
    delay *= 2;
    attempt++;
  }
}
