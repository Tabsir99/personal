import type { RevenueSplit } from "@/lib/analyticsQuery";

export const REVERSAL_KINDS = ["refund", "dispute"] as const;
export type ReversalKind = (typeof REVERSAL_KINDS)[number];

export const REVERSAL_LABEL: Record<ReversalKind, string> = {
  refund: "refunded",
  dispute: "disputed",
};

export const REVERSAL_TITLE: Record<ReversalKind, string> = {
  refund: "Refunded",
  dispute: "Disputed",
};

export const NO_REVENUE: RevenueSplit = { charge: 0, refund: 0, dispute: 0 };

export interface RevenueParts {
  gross: number;
  net: number;
  kept: number;
  refunded: number;
  disputed: number;
  reversed: number;
  total: number;
}

export function netRevenue(split: RevenueSplit): number {
  return split.charge + split.refund + split.dispute;
}

export function hasReversals(split: RevenueSplit): boolean {
  return split.refund !== 0 || split.dispute !== 0;
}

export function revenueParts(split: RevenueSplit): RevenueParts {
  const refunded = Math.max(0, -split.refund);
  const disputed = Math.max(0, -split.dispute);
  const net = netRevenue(split);
  const kept = Math.max(0, net);
  const reversed = refunded + disputed;

  return {
    gross: split.charge,
    net,
    kept,
    refunded,
    disputed,
    reversed,
    total: kept + reversed,
  };
}

export function reversalAmount(
  parts: RevenueParts,
  kind: ReversalKind,
): number {
  return kind === "refund" ? parts.refunded : parts.disputed;
}

export function activeReversals(parts: RevenueParts): ReversalKind[] {
  return REVERSAL_KINDS.filter((kind) => reversalAmount(parts, kind) > 0);
}
