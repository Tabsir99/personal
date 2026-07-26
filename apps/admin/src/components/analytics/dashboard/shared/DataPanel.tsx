"use client";

import { useMemo, useState } from "react";
import { Tabs, TabPanel } from "premium-ds/tabs";
import { UIMotion } from "premium-ds/motion-tokens";
import { motion } from "motion/react";
import { METRIC_IDS, MetricId, MetricToggle, METRICS } from "./MetricToggle";
import { useReveal } from "./reveal";
import { FloatingTooltipPortal } from "./AnalyticsTooltip";
import { buildRankedItemTooltip } from "./tooltipBuilders";

export interface RankedItem {
  name: string;
  icon?: React.ReactNode;
  values: Record<MetricId, number>;
  raw?: Record<string, unknown>;
}

export type PanelTab = {
  value: string;
  label: string;
  headerControl?: React.ReactNode;
  sortable?: boolean;
} & (
  | { items: RankedItem[] }
  | {
      content:
        | React.ReactNode
        | ((revealed: boolean, sortKey: MetricId) => React.ReactNode);
    }
);

export const PANEL_HEIGHT = "h-120";

const SCALE = 0.92 / METRIC_IDS.length;

export function DataPanel({ tabs }: { tabs: PanelTab[] }) {
  const [tab, setTab] = useState(tabs[0].value);
  const [sortKey, setSortKey] = useState<MetricId>("visitors");
  const { ref, revealed, enter } = useReveal<HTMLDivElement>();
  const activeTab = tabs.find((t) => t.value === tab) ?? tabs[0];

  return (
    <div
      ref={ref}
      className={`${enter} ${PANEL_HEIGHT} flex flex-col gap-2 overflow-hidden rounded-lg border border-foreground/6 bg-card`}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-foreground/6 px-2 pt-2">
        <Tabs
          label="Data view"
          items={tabs.map((t) => ({ value: t.value, label: t.label }))}
          value={tab}
          onChange={setTab}
        />
        <div className="-mt-2 flex items-center">
          {activeTab.headerControl}
          <div
            className={
              "items" in activeTab || activeTab.sortable
                ? undefined
                : "invisible"
            }
          >
            <MetricToggle active={sortKey} setActive={setSortKey} />
          </div>
        </div>
      </div>
      <TabPanel
        tab={tab}
        className="min-h-0 flex-1 overflow-y-auto"
        animation={null}
      >
        {"items" in activeTab ? (
          <RankedList
            items={activeTab.items}
            sortKey={sortKey}
            revealed={revealed}
          />
        ) : typeof activeTab.content === "function" ? (
          activeTab.content(revealed, sortKey)
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
  revealed,
}: {
  items: RankedItem[];
  sortKey: MetricId;
  revealed: boolean;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const visible = useMemo(
    () => [...items].sort((a, b) => b.values[sortKey] - a.values[sortKey]),
    [items, sortKey],
  );

  const max = useMemo(() => {
    const m = {} as Record<MetricId, number>;
    for (const id of METRIC_IDS)
      m[id] = Math.max(1, ...visible.map((it) => it.values[id]));
    return m;
  }, [visible]);

  if (visible.length === 0) {
    return (
      <div className="flex h-full min-h-50 items-center justify-center text-xs text-muted-foreground/50">
        No data for this period
      </div>
    );
  }

  const total = visible.reduce((s, it) => s + it.values.visitors, 0) || 1;
  const active = visible.find((it) => it.name === hovered);

  return (
    <div className="flex flex-col [&:hover>*:not(:hover)]:opacity-40">
      {visible.map((item, i) => (
        <div
          key={i}
          onMouseEnter={() => setHovered(item.name)}
          onMouseLeave={() => setHovered(null)}
          className="group relative flex h-9 cursor-pointer items-center justify-between gap-3 rounded-md px-4 transition-opacity duration-200"
        >
          <div className="pointer-events-none absolute inset-x-0 inset-y-0.5 flex items-stretch gap-0.5">
            {METRIC_IDS.map((id) => (
              <motion.div
                key={id}
                aria-hidden
                initial={{ width: 0 }}
                animate={{
                  width: revealed
                    ? `${(item.values[id] / max[id]) * SCALE * 100}%`
                    : 0,
                }}
                transition={UIMotion.t.layout}
                style={{
                  order: id === sortKey ? 0 : 1,
                  background: METRICS[id].color,
                }}
                className={`h-full shrink-0 ${id === sortKey ? "rounded-none" : "rounded-r-sm"}`}
              />
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={UIMotion.t.exit}
            className="relative flex origin-left items-center gap-2"
          >
            {item.icon && <span className="shrink-0">{item.icon}</span>}
            <span className="truncate text-xs font-medium text-foreground">
              {item.name}
            </span>
          </motion.div>
          <motion.span
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative font-mono text-xs font-medium text-foreground/80 tabular-nums"
          >
            {METRICS[sortKey].format(item.values[sortKey])}
          </motion.span>
        </div>
      ))}
      <FloatingTooltipPortal
        sections={active ? buildRankedItemTooltip(active, total) : null}
      />
    </div>
  );
}
