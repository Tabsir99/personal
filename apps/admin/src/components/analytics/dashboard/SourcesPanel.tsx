"use client";

import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAnalyticsStore } from "./analyticsStore";
import { DataPanel } from "./DataPanel";
import { ChannelDonut } from "./ChannelDonut";
import { formatCount } from "./chartFormat";
import { Favicon } from "../../ui/favicon";
import { Select } from "premium-ds/select";
import {
  CAMPAIGN_DIMENSIONS,
  type CampaignDimension,
} from "@/lib/analyticsTypes";

type CampaignSelection = CampaignDimension | "all";

const dimLabel = (text: string, count: number) => (
  <span className="flex w-full items-center justify-between gap-3 text-xs py-0.5">
    <span className="truncate font-semibold">{text}</span>
    <span className="shrink-0 text-muted-foreground tabular-nums font-mono">
      ({formatCount(count)})
    </span>
  </span>
);

export function SourcesPanel() {
  const { sources, loading } = useAnalyticsStore(
    useShallow((s) => ({
      sources: s.sources,
      loading: s.sourcesLoading,
    })),
  );
  const [dim, setDim] = useState<CampaignSelection>("all");

  if (loading) {
    return <div className="h-105 animate-pulse rounded-lg bg-foreground/3" />;
  }

  // Group referrers by channel to place representative source logos on the ring.
  const channelSources: Record<string, string[]> = {};
  for (const r of sources?.referrers ?? []) {
    if (!r.name || !r.channel) continue;
    (channelSources[r.channel] ??= []).push(r.name);
  }

  const camp = sources?.campaigns;
  const campaignItems = (
    dim === "all" ? (camp?.all ?? []) : (camp?.dims[dim] ?? [])
  ).map((c) => ({
    name: c.name,
    values: { visitors: c.uv, revenue: c.revenue },
  }));

  const dimOptions = [
    { value: "all", label: dimLabel("All", camp?.allTotal ?? 0) },
    ...CAMPAIGN_DIMENSIONS.map((d) => ({
      value: d,
      label: dimLabel(`?${d}`, camp?.totals[d] ?? 0),
    })),
  ];

  return (
    <DataPanel
      tabs={[
        {
          value: "channel",
          label: "Channel",
          content: (revealed) => (
            <ChannelDonut
              items={(sources?.channels ?? []).map((c) => ({
                name: c.name,
                value: c.newVisitors + c.returningVisitors,
              }))}
              sources={channelSources}
              revealed={revealed}
            />
          ),
        },
        {
          value: "referrer",
          label: "Referrer",
          items: (sources?.referrers ?? []).map((r) => ({
            name: r.name ?? r.channel,
            icon: <Favicon source={r.name} />,
            values: {
              visitors: r.newVisitors + r.returningVisitors,
              revenue: r.revenue,
            },
          })),
        },
        {
          value: "campaign",
          label: "Campaign",
          items: campaignItems,
          headerControl: (
            <Select
              ariaLabel="Campaign parameter"
              value={dim}
              onChange={(v) => setDim(v as CampaignSelection)}
              options={dimOptions}
              triggerProps={{ size: "sm" }}
              showCheck={false}
            />
          ),
        },
        {
          value: "keyword",
          label: "Keyword",
          content: (
            <div className="flex h-full min-h-50 flex-col items-center justify-center gap-1 px-6 text-center">
              <span className="text-sm text-foreground/70">
                Search keywords
              </span>
              <span className="text-xs text-muted-foreground/50">
                Requires a Google Search Console connection — coming soon.
              </span>
            </div>
          ),
        },
      ]}
    />
  );
}
