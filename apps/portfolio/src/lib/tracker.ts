import type {
  AnalyticsEvent,
  ReferralSource,
} from "@tabsircg/schemas/dashboard";

const ENDPOINT = "/api/event";
const SID_KEY = "__t_sid";
// Shared with the homepage intro (apps/portfolio/src/components/portfolio/intro.tsx):
// presence of any value means the user has been here before. Tracker writes "0"
// for first-time visitors so the intro still plays (parseInt("0") < now - 7d).
const SEEN_KEY = "intro-played";

export function getSessionId(): string {
  let sid = sessionStorage.getItem(SID_KEY);
  if (!sid) {
    sid =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(SID_KEY, sid);
  }
  return sid;
}

export function isReturningVisitor(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) !== null;
  } catch {
    return false;
  }
}

export function markSeen(): void {
  try {
    if (localStorage.getItem(SEEN_KEY) === null) {
      localStorage.setItem(SEEN_KEY, "0");
    }
  } catch {
    /* private mode, ignore */
  }
}

export function classifyReferrer(referrer: string): ReferralSource {
  if (!referrer) return "direct";
  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return "direct";
  }
  if (host === location.hostname) return "direct";
  if (/(^|\.)facebook\.com$|(^|\.)fb\.com$/.test(host)) return "facebook";
  if (/(^|\.)twitter\.com$|(^|\.)x\.com$|(^|\.)t\.co$/.test(host))
    return "twitter";
  if (/(^|\.)linkedin\.com$|(^|\.)lnkd\.in$/.test(host)) return "linkedin";
  if (/(^|\.)reddit\.com$/.test(host)) return "reddit";
  if (/mail\.|outlook\.live\.com$|mail\.google\.com$/.test(host))
    return "email";
  return "organic";
}

export function getLoadTime(): number | undefined {
  const nav = performance.getEntriesByType(
    "navigation",
  )[0] as PerformanceNavigationTiming | undefined;
  if (!nav || !nav.loadEventEnd) return undefined;
  return Math.round(nav.loadEventEnd);
}

export function send(event: AnalyticsEvent): void {
  const data = JSON.stringify(event);
  try {
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function"
    ) {
      const blob = new Blob([data], { type: "application/json" });
      if (navigator.sendBeacon(ENDPOINT, blob)) return;
    }
    fetch(ENDPOINT, {
      method: "POST",
      body: data,
      keepalive: true,
      headers: { "content-type": "application/json" },
    }).catch(() => {});
  } catch {
    /* swallow */
  }
}
