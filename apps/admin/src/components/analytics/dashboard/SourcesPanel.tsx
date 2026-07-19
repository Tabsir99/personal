"use client";

import { useShallow } from "zustand/react/shallow";
import { useAnalyticsStore } from "./analyticsStore";
import { DataPanel, RankedList } from "./DataPanel";
import { ChannelDonut } from "./ChannelDonut";

import { Favicon } from "../../ui/favicon";

export function SourcesPanel() {
  const { sources, loading } = useAnalyticsStore(
    useShallow((s) => ({
      sources: s.sources,
      loading: s.sourcesLoading,
    })),
  );

  if (loading) {
    return <div className="h-105 animate-pulse rounded-lg bg-foreground/3" />;
  }

  // Group referrers by channel to place representative source logos on the ring.
  const channelSources: Record<string, string[]> = {};
  for (const r of sources?.referrers ?? []) {
    if (!r.name || !r.channel) continue;
    (channelSources[r.channel] ??= []).push(r.name);
  }

  return (
    <DataPanel
      tabs={[
        { value: "channel", label: "Channel" },
        { value: "referrer", label: "Referrer" },
      ]}
    >
      {(tab) => {
        if (tab === "channel") {
          return (
            <ChannelDonut
              items={(sources?.channels ?? []).map((c) => ({
                name: c.name,
                value: c.uv,
              }))}
              sources={channelSources}
            />
          );
        }
        return (
          <RankedList
            items={(sources?.referrers ?? []).map((r) => ({
              name: r.name ?? r.channel,
              value: r.uv,
              icon: <Favicon source={r.name} />,
            }))}
          />
        );
      }}
    </DataPanel>
  );
}
