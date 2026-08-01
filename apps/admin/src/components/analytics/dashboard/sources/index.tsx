"use client";

import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAnalyticsStore } from "@/stores/analyticsStore";
import { DataPanel, PANEL_HEIGHT } from "../shared/DataPanel";
import { ChannelDonut } from "./ChannelDonut";
import { formatCount } from "../shared/chartFormat";
import { Favicon } from "@/components/ui/favicon";
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
  const [channel, setChannel] = useState("all");

  if (loading) {
    return (
      <div
        className={`${PANEL_HEIGHT} animate-pulse rounded-lg bg-foreground/3`}
      />
    );
  }

  const channels = sources?.channels ?? [];
  const uvOf = (c: { newVisitors: number; returningVisitors: number }) =>
    c.newVisitors + c.returningVisitors;
  // A channel can vanish when the range changes; don't leave the trigger empty.
  const picked = channels.some((c) => c.name === channel) ? channel : "all";

  const channelOptions = [
    {
      value: "all",
      label: dimLabel(
        "All",
        channels.reduce((s, c) => s + uvOf(c), 0),
      ),
    },
    ...channels.map((c) => ({
      value: c.name,
      label: dimLabel(c.name, uvOf(c)),
    })),
  ];

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
          sortable: true,
          headerControl: (
            <Select
              ariaLabel="Channel breakdown"
              value={picked}
              onChange={setChannel}
              options={channelOptions}
              triggerProps={{ size: "sm" }}
              showCheck={false}
            />
          ),
          content: (revealed, metric) => (
            <ChannelDonut
              channels={channels}
              referrers={sources?.referrers ?? []}
              channel={picked}
              metric={metric}
              revealed={revealed}
              onSelectChannel={setChannel}
            />
          ),
        },
        {
          value: "referrer",
          label: "Referrer",
          items: (sources?.referrers ?? []).map((r) => ({
            name: r.name || r.channel,
            icon: <Favicon source={r.name} />,
            values: {
              visitors: r.newVisitors + r.returningVisitors,
              revenue: r.revenue,
            },
            raw: {
              newVisitors: r.newVisitors,
              returningVisitors: r.returningVisitors,
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
