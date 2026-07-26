import type { JourneyVisitor } from "@/lib/analyticsTypes";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const ordinalRules = new Intl.PluralRules("en", { type: "ordinal" });

const ORDINAL_SUFFIX: Record<Intl.LDMLPluralRule, string> = {
  zero: "th",
  one: "st",
  two: "nd",
  few: "rd",
  many: "th",
  other: "th",
};

function ordinal(n: number): string {
  return `${n}${ORDINAL_SUFFIX[ordinalRules.select(n)]}`;
}

export function humanizeDuration(ms: number): string {
  const abs = Math.abs(ms);
  if (abs < 45 * SECOND) return "a few seconds";
  if (abs < 90 * SECOND) return "a minute";
  if (abs < 45 * MINUTE) return `${Math.round(abs / MINUTE)} minutes`;
  if (abs < 90 * MINUTE) return "an hour";
  if (abs < 22 * HOUR) return `${Math.round(abs / HOUR)} hours`;
  if (abs < 36 * HOUR) return "a day";
  if (abs < 26 * DAY) return `${Math.round(abs / DAY)} days`;
  if (abs < 46 * DAY) return "a month";
  if (abs < 320 * DAY) return `${Math.round(abs / (30 * DAY))} months`;
  if (abs < 548 * DAY) return "a year";
  return `${Math.round(abs / (365 * DAY))} years`;
}

export function formatClock(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function startOfDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

function daysApart(timestamp: number, now: number): number {
  return Math.round(
    (startOfDay(new Date(now)) - startOfDay(new Date(timestamp))) / DAY,
  );
}

export function formatCalendarMoment(
  timestamp: number,
  now = Date.now(),
): string {
  const date = new Date(timestamp);
  const offset = daysApart(timestamp, now);
  const clock = formatClock(timestamp);

  if (offset === 0) return `Today at ${clock}`;
  if (offset === 1) return `Yesterday at ${clock}`;

  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year =
    date.getFullYear() === new Date(now).getFullYear()
      ? ""
      : ` ${date.getFullYear()}`;
  return `${month} ${ordinal(date.getDate())}${year} at ${clock}`;
}

export function formatDayHeading(timestamp: number): string {
  const date = new Date(timestamp);
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const month = date.toLocaleDateString("en-US", { month: "short" });
  return `${weekday}, ${month} ${ordinal(date.getDate())} ${date.getFullYear()}`;
}

export function formatMoney(amount: number): string {
  return amount % 1 === 0
    ? `$${amount.toLocaleString("en-US")}`
    : `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function visitorLabel(visitor: JourneyVisitor): string {
  return (
    visitor.customerName ||
    visitor.customerEmail ||
    `Visitor ${visitor.visitorId.slice(-6)}`
  );
}

export function isAnonymous(visitor: JourneyVisitor): boolean {
  return !visitor.customerName && !visitor.customerEmail;
}

export function sourceLabel(visitor: JourneyVisitor): string {
  const { referrer } = visitor.sourceAttribution;
  if (!referrer) return visitor.channel || "Direct / None";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer;
  }
}

export function sourceDomain(visitor: JourneyVisitor): string | null {
  const { referrer } = visitor.sourceAttribution;
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname;
  } catch {
    return null;
  }
}
