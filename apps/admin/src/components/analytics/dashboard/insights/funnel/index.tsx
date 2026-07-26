"use client";

import { PlusIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";
import { useAnalyticsStore } from "@/stores/analyticsStore";
import { PERIOD_LABEL } from "@/components/analytics/dashboard/shared/chartFormat";
import { cn } from "@/lib/utils";
import { FunnelRiver, type RiverStep } from "./FunnelRiver";
import { FunnelMenu } from "./FunnelMenu";

export function FunnelTab() {
  const {
    funnels,
    funnelsLoading,
    activeFunnelId,
    funnel,
    funnelLoading,
    period,
    setActiveFunnel,
  } = useAnalyticsStore(
    useShallow((s) => ({
      funnels: s.funnels,
      funnelsLoading: s.funnelsLoading,
      activeFunnelId: s.activeFunnelId,
      funnel: s.funnel,
      funnelLoading: s.funnelLoading,
      period: s.period,
      setActiveFunnel: s.setActiveFunnel,
    })),
  );

  const createFunnel = () => {};

  if (funnels === null || (funnelsLoading && funnels.length === 0)) {
    return (
      <div className="h-full p-3">
        <div className="h-full animate-pulse rounded-lg bg-foreground/3" />
      </div>
    );
  }

  if (funnels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <div>
          <p className="text-sm font-medium text-foreground/80">
            No funnels yet
          </p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground/60">
            Chain goals and pageviews into a conversion flow to see where
            visitors drop off.
          </p>
        </div>
        <button
          type="button"
          onClick={createFunnel}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <PlusIcon size={15} weight="bold" /> Create funnel
        </button>
      </div>
    );
  }

  const steps: RiverStep[] = funnel
    ? funnel.data.map((d, i) => ({
        ...d,
        name: funnel.funnel.steps[i]?.name ?? d.label,
        kind: funnel.funnel.steps[i]?.type ?? "goal",
      }))
    : [];

  const conv = funnel?.metrics.overallConversionRate ?? 0;

  return (
    <div className="relative h-110 overflow-hidden">
      {funnelLoading && !funnel ? (
        <div className="absolute inset-3 animate-pulse rounded-lg bg-foreground/3" />
      ) : steps.length ? (
        <div className={cn("h-full", funnelLoading && "opacity-60")}>
          <FunnelRiver steps={steps} />
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground/50">
          No data for this period
        </div>
      )}

      <div className="pointer-events-none absolute top-13 right-4 text-right">
        <div className="text-sm font-semibold text-foreground">
          {conv >= 99.95 ? "100" : conv.toFixed(1)}% conversion rate
        </div>
        <div className="text-xs text-muted-foreground/70">
          {PERIOD_LABEL[period] ?? period}
        </div>
      </div>

      <div className="absolute top-3 right-3 z-30">
        <FunnelMenu
          funnels={funnels}
          activeId={activeFunnelId}
          onSelect={setActiveFunnel}
          onCreate={createFunnel}
        />
      </div>
    </div>
  );
}
