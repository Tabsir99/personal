import type { CSSProperties } from "react";
import type { JourneyEntry, JourneyEventType } from "@/lib/analyticsTypes";
import { CHART, REVERSAL } from "../../shared/chartTheme";
import { REVERSAL_KINDS, type ReversalKind } from "../../shared/revenue";

export const DOT_TINT: Record<JourneyEventType, string> = {
  referral: "var(--color-muted-foreground)",
  pageview: "color-mix(in oklab, var(--color-primary) 45%, transparent)",
  custom: "var(--color-primary)",
  payment: "var(--color-destructive)",
};

export function reversalKindOf(entry: JourneyEntry): ReversalKind | null {
  if (entry.eventType !== "payment" || entry.data.amount >= 0) return null;
  return REVERSAL_KINDS.find((kind) => kind === entry.data.kind) ?? "refund";
}

export function dotStyle(entry: JourneyEntry): CSSProperties {
  const reversal = reversalKindOf(entry);
  if (!reversal) return { background: DOT_TINT[entry.eventType] };
  return {
    background: REVERSAL[reversal].fill,
    boxShadow: `inset 0 0 0 1.5px ${CHART[reversal]}`,
  };
}
