"use client";

import { Button } from "premium-ds/button";
import { UIMotion } from "premium-ds/motion-tokens";
import { AnimatePresence, motion } from "motion/react";
import { ArrowsDownUp } from "@phosphor-icons/react";

export const METRICS = {
  visitors: {
    label: "Visitors",
    format: (n: number) => n.toLocaleString(),
    bar: "bg-primary/10",
  },
  revenue: {
    label: "Revenue",
    format: (n: number) => `$${n.toLocaleString()}`,
    bar: "bg-success/20",
  },
} as const satisfies Record<
  string,
  { label: string; format: (n: number) => string; bar: string }
>;

export const METRIC_IDS = Object.keys(METRICS) as MetricId[];
export type MetricId = keyof typeof METRICS;

// Sort control for a ranked list: shows the active metric's label and cycles to
// the next on click. The label rolls up as it changes.
export function MetricToggle({
  active,
  setActive,
}: {
  active: MetricId;
  setActive: (active: MetricId) => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() =>
        setActive(
          METRIC_IDS[(METRIC_IDS.indexOf(active) + 1) % METRIC_IDS.length],
        )
      }
      iconRight={<ArrowsDownUp className="size-4" weight="bold" />}
      className="-mt-2"
    >
      <span className="relative block h-4 overflow-hidden ">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={active}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={UIMotion.t.enter}
            className="block text-xs tracking-wider"
          >
            {METRICS[active].label}
          </motion.span>
        </AnimatePresence>
      </span>
    </Button>
  );
}
