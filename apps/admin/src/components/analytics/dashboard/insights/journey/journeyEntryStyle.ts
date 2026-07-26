import type { JourneyEventType } from "@/lib/analyticsTypes";

export const DOT_TINT: Record<JourneyEventType, string> = {
  referral: "var(--color-muted-foreground)",
  pageview: "color-mix(in oklab, var(--color-primary) 45%, transparent)",
  custom: "var(--color-primary)",
  payment: "var(--color-destructive)",
};
