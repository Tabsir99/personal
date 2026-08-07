"use client";

import { useShallow } from "zustand/react/shallow";
import { useAnalyticsStore } from "../../../stores/analyticsStore";
import { DataPanel, PANEL_HEIGHT, rankedMetrics } from "./shared/DataPanel";

import { Favicon } from "../../ui/favicon";

export function PagesPanel() {
  const { pages, loading } = useAnalyticsStore(
    useShallow((s) => ({
      pages: s.pages,
      loading: s.pagesLoading,
    })),
  );

  if (loading) {
    return (
      <div
        className={`${PANEL_HEIGHT} animate-pulse rounded-lg bg-foreground/3`}
      />
    );
  }

  return (
    <DataPanel
      tabs={[
        {
          value: "hostname",
          label: "Hostname",
          items: (pages?.hostnames ?? []).map((h) => ({
            name: h.name,
            icon: <Favicon source={h.name} />,
            ...rankedMetrics(h.uv, h.revenue),
          })),
        },
        {
          value: "pages",
          label: "Page",
          items: (pages?.pages ?? []).map((p) => ({
            name: p.name,
            ...rankedMetrics(p.uv, p.revenue),
            raw: { pageviews: p.pageviews },
          })),
        },
        {
          value: "entry",
          label: "Entry page",
          items: (pages?.entryPages ?? []).map((p) => ({
            name: p.name,
            ...rankedMetrics(p.uv, p.revenue),
          })),
        },
        {
          value: "exit",
          label: "Exit link",
          items: (pages?.exitLinks ?? []).map((l) => ({
            name: l.name,
            icon: <Favicon source={l.name} />,
            ...rankedMetrics(l.uv, l.revenue),
            raw: { exits: l.exits },
          })),
        },
      ]}
    />
  );
}
