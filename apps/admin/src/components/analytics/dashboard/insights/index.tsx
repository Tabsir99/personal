"use client";

import { useState } from "react";
import { Tabs, TabPanel } from "premium-ds/tabs";
import { TextField } from "premium-ds/text-field";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useAnalyticsStore } from "../../../../stores/analyticsStore";
import { useReveal } from "../shared/reveal";
import { GoalsTab } from "./GoalsTab";
import { FunnelTab } from "./FunnelTab";
import { JourneyTab } from "./JourneyTab";

const TABS = [
  { value: "goal", label: "Goal" },
  { value: "funnel", label: "Funnel" },
  { value: "journey", label: "Journey" },
];

type TabId = "goal" | "funnel" | "journey";

export function InsightsCard() {
  const loading = useAnalyticsStore((s) => s.goalsLoading);
  const [tab, setTab] = useState<TabId>("goal");
  const [dir, setDir] = useState<-1 | 0 | 1>(0);
  const [query, setQuery] = useState("");
  const { ref, revealed, enter } = useReveal<HTMLDivElement>();

  if (loading) {
    return <div className="h-105 animate-pulse rounded-lg bg-foreground/3" />;
  }

  return (
    <div
      ref={ref}
      className={`${enter} overflow-hidden rounded-lg border border-foreground/6 bg-card`}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-foreground/6 px-2 pt-2">
        <Tabs
          name="insights"
          label="Insights views"
          items={TABS}
          value={tab}
          onChange={(v, d) => {
            setTab(v as TabId);
            setDir(d);
          }}
        />
        <div className={cn(tab === "goal" ? "" : "invisible", "-mt-2 w-56")}>
          <TextField
            size="sm"
            placeholder="Search goals"
            leadingIcon={<MagnifyingGlassIcon size={1} />}
            clearable
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            htmlProps={{ "aria-label": "Search goals" }}
            type="search"
          />
        </div>
      </div>
      <TabPanel tab={tab} dir={dir} name="insights">
        {tab === "goal" ? (
          revealed && <GoalsTab query={query} />
        ) : tab === "funnel" ? (
          <FunnelTab />
        ) : (
          <JourneyTab />
        )}
      </TabPanel>
    </div>
  );
}
