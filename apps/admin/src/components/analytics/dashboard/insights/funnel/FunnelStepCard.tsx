"use client";

import { ArrowElbowDownRightIcon } from "@phosphor-icons/react";
import type { RiverStep } from "./FunnelRiver";
import { formatCount } from "../../shared/chartFormat";
import { AnalyticsTooltipCard } from "../../shared/AnalyticsTooltip";
import { Favicon } from "@/components/ui/favicon";
import { formatCountryName, CountryFlag } from "@/lib/countryUtils";

function StepRow({ step }: { step: RiverStep }) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5 text-sm">
      <span className="flex min-w-0 items-center gap-1 text-background/80">
        <ArrowElbowDownRightIcon
          size={13}
          className="shrink-0 text-background/35"
        />
        <span className="truncate">{step.name}</span>
      </span>
      <span className="shrink-0 font-semibold text-background tabular-nums">
        {formatCount(step.value)}
      </span>
    </div>
  );
}

interface SourceRow {
  icon?: React.ReactNode;
  name: string;
  pct: number;
}

function SourceList({ title, rows }: { title: string; rows: SourceRow[] }) {
  return (
    <div className="min-w-0">
      <div className="mb-1.5 text-xs font-medium tracking-wide text-background/40 uppercase">
        {title}
      </div>
      <div className="flex flex-col gap-1.5">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            {r.icon}
            <span className="min-w-0 flex-1 truncate text-background/70">
              {r.name}
            </span>
            <span className="shrink-0 text-background/50 tabular-nums">
              {r.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FunnelStepCard({
  steps,
  index,
}: {
  steps: RiverStep[];
  index: number;
}) {
  const step = steps[index];
  const prev = index > 0 ? steps[index - 1] : null;
  const revPerVisitor = step.value > 0 ? step.revenue / step.value : 0;
  const convFromPrev =
    prev && prev.value > 0 ? (step.value / prev.value) * 100 : 0;
  const hasBreakdown =
    step.topReferrers.length > 0 || step.topCountries.length > 0;

  const sections = [
    <div key="step-flow" className="px-3.5 pt-3 pb-2.5">
      {prev && <StepRow step={prev} />}
      {prev && (
        <div className="flex items-center justify-between py-0.5 text-sm">
          <span className="text-background/50">Dropoff</span>
          <span className="font-medium text-destructive tabular-nums">
            -{formatCount(prev.value - step.value)}
          </span>
        </div>
      )}
      <StepRow step={step} />
    </div>,

    prev && (
      <div
        key="conversion"
        className="flex items-start justify-between px-3.5 py-2.5"
      >
        <div className="text-sm leading-tight">
          <div className="text-background/70">Conversion</div>
          <div className="text-xs text-background/40">from start</div>
        </div>
        <div className="text-right text-sm leading-tight tabular-nums">
          <div className="font-semibold text-primary">
            {convFromPrev.toFixed(1)}%
          </div>
          <div className="text-xs text-primary/60">
            {step.conversionRate.toFixed(1)}%
          </div>
        </div>
      </div>
    ),

    {
      label: "Step value",
      value: (
        <span className="tabular-nums">
          <span className="font-semibold text-background">
            ${revPerVisitor.toFixed(2)}
          </span>
          <span className="text-background/45"> /visitor</span>
        </span>
      ),
    },

    hasBreakdown && (
      <div
        key="breakdown"
        className="grid grid-cols-2 gap-x-4 px-3.5 pt-2.5 pb-3"
      >
        {step.topReferrers.length > 0 && (
          <SourceList
            title="Top sources"
            rows={step.topReferrers.map((r) => ({
              icon: (
                <Favicon
                  source={r.referrer}
                  className="size-3.5 shrink-0 rounded-sm object-contain"
                />
              ),
              name: r.referrer,
              pct: r.percentage,
            }))}
          />
        )}
        {step.topCountries.length > 0 && (
          <SourceList
            title="Top countries"
            rows={step.topCountries.map((c) => ({
              icon: <CountryFlag code={c.countryCode} />,
              name: formatCountryName(c.countryCode),
              pct: c.percentage,
            }))}
          />
        )}
      </div>
    ),
  ];

  return <AnalyticsTooltipCard className="w-72" sections={sections} />;
}
