"use client";

import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAnalyticsStore } from "../../../../stores/analyticsStore";
import { formatCount } from "../shared/chartFormat";
import { cn } from "@/lib/utils";
import type { GoalMetric } from "@/lib/analyticsTypes";
import { goalColor } from "./goalColors";
import { GoalsChart } from "./GoalsChart";

interface GoalsTabProps {
  query: string;
  entryKey: number;
  className?: string;
}

export function GoalsTab({ query, entryKey, className }: GoalsTabProps) {
  const { goals, granularity } = useAnalyticsStore(
    useShallow((s) => ({
      goals: s.goals,
      granularity: s.granularity,
    })),
  );
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const active = hovered ?? selected;

  const colors = useMemo<Record<string, string>>(
    () =>
      goals
        ? Object.fromEntries(goals.goals.map((g, i) => [g.name, goalColor(i)]))
        : {},
    [goals],
  );

  const yMax = useMemo(() => {
    if (!goals) return 0;
    let m = 0;
    for (const p of goals.series)
      for (const g of goals.goals) if (p[g.name] > m) m = p[g.name];
    return m;
  }, [goals]);

  if (!goals) {
    return (
      <div className="flex h-96 items-center justify-center text-sm text-muted-foreground/50">
        No goal data
      </div>
    );
  }

  const ranked = goals.goals;
  const max = ranked.length ? ranked[0].uv : 0;
  const activeIndex = active ? ranked.findIndex((g) => g.name === active) : -1;
  const filtered = query
    ? ranked.filter((g) => g.name.toLowerCase().includes(query.toLowerCase()))
    : ranked;

  return (
    <div className={cn("flex h-110 flex-col lg:flex-row", className)}>
      <div className="relative min-w-0 flex-1 overflow-hidden p-1">
        <div data-dim={active ? "" : undefined} className="relative h-full">
          <GoalsChart
            series={goals.series}
            goals={ranked}
            colors={colors}
            granularity={granularity}
            yMax={yMax}
          />
          <div
            key={entryKey}
            aria-hidden
            className="pointer-events-none absolute top-2 right-3 bottom-7.5 left-9 z-10 animate-goal-wipe bg-card"
          />
        </div>
        {active && activeIndex >= 0 && (
          <style>{`[data-dim] .recharts-line{opacity:.13}[data-dim] .gl-${activeIndex}{opacity:1}`}</style>
        )}
      </div>

      <aside className="min-h-0 w-full overflow-y-auto border-t border-foreground/6 p-1.5 lg:w-80 lg:flex-none lg:border-t-0 lg:border-l">
        {filtered.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground/50">
            No goals
          </div>
        ) : (
          filtered.map((g) => (
            <GoalRow
              key={g.name}
              goal={g}
              color={colors[g.name]}
              max={max}
              dimmed={hovered !== null && hovered !== g.name}
              selected={selected === g.name}
              onEnter={() => setHovered(g.name)}
              onLeave={() => setHovered(null)}
              onClick={() => setSelected((s) => (s === g.name ? null : g.name))}
            />
          ))
        )}
      </aside>
    </div>
  );
}

function GoalRow({
  goal,
  color,
  max,
  dimmed,
  selected,
  onEnter,
  onLeave,
  onClick,
}: {
  goal: GoalMetric;
  color: string;
  max: number;
  dimmed: boolean;
  selected: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const pct = max > 0 ? Math.max(6, (goal.uv / max) * 100) : 0;
  return (
    <button
      type="button"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
      className={cn(
        "group relative flex w-full cursor-pointer items-center justify-between gap-2 overflow-hidden rounded-md px-2.5 py-2 text-left transition-opacity",
        dimmed && "opacity-40",
      )}
    >
      <span
        className={cn(
          "absolute inset-y-0.5 left-0.5 rounded-sm transition-opacity",
          selected ? "opacity-40" : "opacity-20 group-hover:opacity-30",
        )}
        style={{ width: `calc(${pct}% - 4px)`, background: color }}
      />
      <span
        className={cn(
          "relative z-10 min-w-0 truncate text-sm",
          selected ? "font-medium text-foreground" : "text-foreground/90",
        )}
      >
        {goal.name}
      </span>
      <span className="relative z-10 shrink-0 font-mono text-sm text-foreground/70 tabular-nums">
        {formatCount(goal.uv)}
      </span>
    </button>
  );
}
