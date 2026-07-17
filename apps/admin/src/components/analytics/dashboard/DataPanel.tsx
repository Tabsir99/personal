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
    <div className="rounded-lg border border-foreground/6 bg-card overflow-hidden">
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
      <TabPanel tab={tab} dir={dir}>
        <div className="p-0">{children(tab, dir)}</div>
      </TabPanel>
    </div>
  );
}

interface RankedListProps {
  items: { name: string; value: number; icon?: React.ReactNode }[];
  valueLabel?: string;
  maxItems?: number;
}

export function RankedList({ items, valueLabel = "Visitors", maxItems = 10 }: RankedListProps) {
  const visible = items.slice(0, maxItems);
  const max = visible[0]?.value ?? 1;

  if (visible.length === 0) {
    return (
      <div className="flex items-center justify-center py-10 text-[12px] text-muted-foreground/50">
        No data for this period
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-2 border-b border-foreground/4">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Name
        </span>
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          {valueLabel}
        </span>
      </div>
      <div className="divide-y divide-foreground/4">
        {visible.map((item) => (
          <div key={item.name} className="group relative flex items-center gap-3 px-4 py-2.5">
            <div
              className="absolute inset-y-0 left-0 bg-primary/[0.04] transition-all duration-300"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
            <div className="relative flex items-center gap-2 min-w-0 flex-1">
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span className="truncate text-[13px] text-foreground">{item.name || "(unknown)"}</span>
            </div>
            <span className="relative font-mono text-[12px] tabular-nums text-foreground/80 font-medium">
              {item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
