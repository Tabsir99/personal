"use client";

import { useShallow } from "zustand/react/shallow";
import { useAnalyticsStore } from "./analyticsStore";
import { DataPanel, RankedList } from "./DataPanel";

export function PagesPanel() {
  const { pages, exitLinks, pagesLoading, exitLinksLoading } = useAnalyticsStore(useShallow((s) => ({
    pages: s.pages,
    exitLinks: s.exitLinks,
    pagesLoading: s.pagesLoading,
    exitLinksLoading: s.exitLinksLoading,
  })));

  if (pagesLoading || exitLinksLoading) {
    return <div className="h-105 animate-pulse rounded-lg bg-foreground/3" />;
  }

  return (
    <DataPanel
      tabs={[
        { value: "hostname", label: "Hostname" },
        { value: "pages", label: "Page" },
        { value: "entry", label: "Entry page" },
        { value: "exit", label: "Exit link" },
      ]}
    >
      {(tab) => {
        if (tab === "hostname") {
          const hostMap = new Map<string, number>();
          for (const link of exitLinks ?? []) {
            try {
              const host = new URL(link.name).hostname;
              hostMap.set(host, (hostMap.get(host) ?? 0) + link.uv);
            } catch {
              hostMap.set(link.name, (hostMap.get(link.name) ?? 0) + link.uv);
            }
          }
          const items = [...hostMap.entries()]
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
          return <RankedList items={items} />;
        }
        if (tab === "exit") {
          return <RankedList items={(exitLinks ?? []).map((l) => ({ name: l.name, value: l.uv }))} />;
        }
        if (!pages) return <RankedList items={[]} />;
        const list = tab === "pages" ? pages.pages : pages.entryPages;
        return <RankedList items={list.map((p) => ({ name: p.name, value: p.uv }))} />;
      }}
    </DataPanel>
  );
}
