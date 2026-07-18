"use client";

import { useShallow } from "zustand/react/shallow";
import { useAnalyticsStore } from "./analyticsStore";
import { DataPanel, RankedList } from "./DataPanel";

import { Favicon } from "../../ui/favicon";

export function PagesPanel() {
  const { pages, loading } = useAnalyticsStore(
    useShallow((s) => ({
      pages: s.pages,
      loading: s.pagesLoading,
    })),
  );

  if (loading) {
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
        if (!pages) return <RankedList items={[]} />;
        if (tab === "hostname") {
          return (
            <RankedList
              items={pages.hostnames.map((h) => ({
                name: h.name,
                value: h.uv,
                icon: <Favicon source={h.name} />,
              }))}
            />
          );
        }
        if (tab === "exit") {
          return (
            <RankedList
              items={pages.exitLinks.map((l) => ({
                name: l.name,
                value: l.uv,
                icon: <Favicon source={l.name} />,
              }))}
            />
          );
        }
        const list = tab === "pages" ? pages.pages : pages.entryPages;
        return (
          <RankedList
            items={list.map((p) => ({ name: p.name, value: p.uv }))}
          />
        );
      }}
    </DataPanel>
  );
}
