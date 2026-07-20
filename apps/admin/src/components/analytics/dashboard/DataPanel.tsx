"use client";

import { useRef, useState } from "react";
import { Tabs, TabPanel } from "premium-ds/tabs";
import { UIMotion } from "premium-ds/motion-tokens";
import { motion } from "motion/react";
import { METRIC_IDS, MetricId, MetricToggle, METRICS } from "./MetricToggle";
import { useReveal } from "./reveal";

export interface RankedItem {
  name: string;
  icon?: React.ReactNode;
  values: Record<MetricId, number>;
}

export type PanelTab =
  | { value: string; label: string; items: RankedItem[] }
  | {
      value: string;
      label: string;
      content: React.ReactNode | ((revealed: boolean) => React.ReactNode);
    };

type MorphWidths = Array<Record<MetricId, number>>;

export function DataPanel({ tabs }: { tabs: PanelTab[] }) {
  const [tab, setTab] = useState(tabs[0].value);
  const [dir, setDir] = useState<-1 | 0 | 1>(0);
  const [sortKey, setSortKey] = useState<MetricId>("visitors");
  const morphRef = useRef<MorphWidths>([]);
  const { ref, revealed, enter } = useReveal<HTMLDivElement>();

  const activeIdx = tabs.findIndex((t) => t.value === tab);
  const activeTab = tabs[activeIdx] ?? tabs[0];

  const isList = (t: PanelTab | undefined) => "items" in t;
  const childMorphs = isList(activeTab) && isList(tabs[activeIdx - dir]);

  return (
    <div
      ref={ref}
      className={`${enter} flex h-120 flex-col gap-2 overflow-hidden rounded-lg border border-foreground/6 bg-card`}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-foreground/6 px-2 pt-2">
        <Tabs
          label="Data view"
          items={tabs.map((t) => ({ value: t.value, label: t.label }))}
          value={tab}
          onChange={(v, d) => {
            setTab(v);
            setDir(d);
          }}
          className="min-w-0 flex-1"
        />
        <div className={"items" in activeTab ? "" : "invisible"}>
          <MetricToggle active={sortKey} setActive={setSortKey} />
        </div>
      </div>
      <TabPanel
        tab={tab}
        dir={childMorphs ? 0 : dir}
        className="min-h-0 flex-1 overflow-y-auto"
        {...(childMorphs ? { animation: null } : {})}
      >
        {"items" in activeTab ? (
          <RankedList
            items={activeTab.items}
            sortKey={sortKey}
            morphRef={morphRef}
            revealed={revealed}
          />
        ) : typeof activeTab.content === "function" ? (
          activeTab.content(revealed)
        ) : (
          activeTab.content
        )}
      </TabPanel>
    </div>
  );
}

function RankedList({
  items,
  sortKey,
  morphRef,
  revealed,
}: {
  items: RankedItem[];
  sortKey: MetricId;
  morphRef: React.RefObject<MorphWidths>;
  revealed: boolean;
}) {
  // Snapshot the outgoing tab's bar widths (published before TabPanel remounts
  // this list) so the incoming bars animate from them — the tab-change morph.
  // eslint-disable-next-line react-hooks/refs
  const [morphFrom] = useState(() =>
    morphRef.current.length ? morphRef.current : null,
  );
  const [rendered, setRendered] = useState(false);

  const visible = items.sort((a, b) => b.values[sortKey] - a.values[sortKey]);

  const maxByMetric = {} as Record<MetricId, number>;
  for (const id of METRIC_IDS) {
    maxByMetric[id] = Math.max(1, ...visible.map((it) => it.values[id]));
  }
  const scale = 0.92 / METRIC_IDS.length;
  const widths: MorphWidths = visible.map((it) => {
    const w = {} as Record<MetricId, number>;
    for (const id of METRIC_IDS)
      w[id] = (it.values[id] / maxByMetric[id]) * scale;
    return w;
  });
  morphRef.current = widths;

  const pct = (f: number) =>
    `${Math.max(0, Math.min(1, Number.isFinite(f) ? f : 0)) * 100}%`;

  if (visible.length === 0) {
    return (
      <div className="flex h-full min-h-50 items-center justify-center text-xs text-muted-foreground/50">
        No data for this period
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {visible.map((item, i) => (
        <motion.div
          key={item.name}
          layout
          transition={UIMotion.t.layout}
          className="group relative flex h-8 items-center gap-3 rounded-md px-2"
        >
          <div className="pointer-events-none absolute inset-0 flex items-stretch gap-0.5">
            {METRIC_IDS.map((id) => {
              const from = morphFrom?.[i]?.[id];
              const lead = id === sortKey;
              return (
                <motion.div
                  key={id}
                  aria-hidden
                  initial={{ width: pct(from) }}
                  animate={{ width: pct(revealed ? widths[i][id] : 0) }}
                  onAnimationEnd={() => setRendered(true)}
                  transition={{
                    ...UIMotion.t.layout,
                    duration: rendered ? 0 : UIMotion.t.layout.duration,
                  }}
                  style={{ order: lead ? 0 : 1, background: METRICS[id].color }}
                  className={`h-full shrink-0 ${lead ? "rounded-none" : "rounded-r-sm"}`}
                />
              );
            })}
          </div>
          <div className="relative flex min-w-0 flex-1 items-center gap-2">
            {item.icon && <span className="shrink-0">{item.icon}</span>}
            <span className="truncate text-sm text-foreground">
              {item.name}
            </span>
          </div>
          <span className="relative font-mono text-xs font-medium text-foreground/80 tabular-nums">
            {METRICS[sortKey].format(item.values[sortKey])}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
