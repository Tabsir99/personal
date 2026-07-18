"use client";

import { useState } from "react";
import { Tabs, TabPanel } from "premium-ds/tabs";

interface DataPanelProps {
  tabs: { value: string; label: string }[];
  children: (activeTab: string, dir: -1 | 0 | 1) => React.ReactNode;
}

export function DataPanel({ tabs, children }: DataPanelProps) {
  const [tab, setTab] = useState(tabs[0].value);
  const [dir, setDir] = useState<-1 | 0 | 1>(0);

  return (
    <div className="h-105 overflow-hidden rounded-lg border border-foreground/6 bg-card">
      <div className="border-b border-foreground/6 px-4 pt-3 pb-0">
        <Tabs
          label="Data view"
          items={tabs.map((t) => ({ value: t.value, label: t.label }))}
          value={tab}
          onChange={(v, d) => {
            setTab(v);
            setDir(d);
          }}
        />
      </div>
      <TabPanel
        tab={tab}
        dir={dir}
        className="h-[calc(100%-44px)] overflow-y-auto"
      >
        {children(tab, dir)}
      </TabPanel>
    </div>
  );
}

interface RankedListProps {
  items: { name: string; value: number; icon?: React.ReactNode }[];
  valueLabel?: string;
  maxItems?: number;
}

export function RankedList({
  items,
  valueLabel = "Visitors",
  maxItems = 10,
}: RankedListProps) {
  const visible = items.slice(0, maxItems);
  const max = visible[0]?.value ?? 1;

  if (visible.length === 0) {
    return (
      <div className="flex h-full min-h-50 items-center justify-center text-[12px] text-muted-foreground/50">
        No data for this period
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between border-b border-foreground/4 px-4 py-2">
        <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
          Name
        </span>
        <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
          {valueLabel}
        </span>
      </div>
      <div className="flex flex-col gap-1 p-1">
        {visible.map((item) => (
          <div
            key={item.name}
            className="group relative flex items-center gap-3 rounded-md px-3 py-2.5"
          >
            <div
              className="absolute inset-y-0 left-0 rounded-md bg-primary/8 transition-all duration-300"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
            <div className="relative flex min-w-0 flex-1 items-center gap-2">
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span className="truncate text-[13px] text-foreground">
                {item.name || "(unknown)"}
              </span>
            </div>
            <span className="relative font-mono text-[12px] font-medium text-foreground/80 tabular-nums">
              {item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
