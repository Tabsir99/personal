"use client";

import { useShallow } from "zustand/react/shallow";
import { useAnalyticsStore } from "./analyticsStore";
import { DataPanel, RankedList } from "./DataPanel";

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
            <RankedList
              items={(sources?.channels ?? []).map((c) => ({
                name: c.name,
                value: c.uv,
              }))}
            />
          );
        }
        return (
          <RankedList
            items={(sources?.referrers ?? []).map((r) => ({
              name: r.name,
              value: r.uv,
              icon: <Favicon source={r.name} />,
            }))}
          />
        );
      }}
    </DataPanel>
  );
}
