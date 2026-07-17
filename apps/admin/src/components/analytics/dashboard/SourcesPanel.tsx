"use client";

import { useShallow } from "zustand/react/shallow";
import { useAnalyticsStore } from "./analyticsStore";
import { DataPanel, RankedList } from "./DataPanel";

export function SourcesPanel() {
  const { sources, loading } = useAnalyticsStore(useShallow((s) => ({
    sources: s.sources,
    loading: s.sourcesLoading,
  })));

  if (loading) {
    return <div className="h-105 animate-pulse rounded-lg bg-foreground/3" />;
  }

  const referrers = sources?.referrers ?? [];

  return (
    <DataPanel
      tabs={[
        { value: "channel", label: "Channel" },
        { value: "referrer", label: "Referrer" },
      ]}
    >
      {(tab) => {
        if (tab === "channel") {
          const channelMap = new Map<string, number>();
          for (const r of referrers) {
            channelMap.set(r.channel, (channelMap.get(r.channel) ?? 0) + r.uv);
          }
          const items = [...channelMap.entries()]
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
          return <RankedList items={items} />;
        }
        return <RankedList items={referrers.map((r) => ({ name: r.name, value: r.uv }))} />;
      }}
    </DataPanel>
  );
}
