"use client";

import { useEffect, useState } from "react";
import { Tabs, TabPanel } from "premium-ds/tabs";
import { TextField } from "premium-ds/text-field";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useAnalyticsStore } from "../../../../stores/analyticsStore";
import { useReveal } from "../shared/reveal";
import { GoalsTab } from "./GoalsTab";
import { FunnelTab } from "./funnel";
import { JourneyTab } from "./journey";
import { GoalPicker } from "./journey/GoalPicker";

const TABS = [
  { value: "goal", label: "Goal" },
  { value: "funnel", label: "Funnel" },
  { value: "journey", label: "Journey" },
];

type TabId = "goal" | "funnel" | "journey";

const SEARCH_DEBOUNCE_MS = 350;

export function InsightsCard() {
  const loading = useAnalyticsStore((s) => s.goalsLoading);
  const setJourneySearch = useAnalyticsStore((s) => s.setJourneySearch);

  const [tab, setTab] = useState<TabId>("goal");
  const [dir, setDir] = useState<-1 | 0 | 1>(0);

  const [query, setQuery] = useState("");
  const [journeyQuery, setJourneyQuery] = useState("");

  const [goalEntry, setGoalEntry] = useState(0);
  const { ref, revealed, enter } = useReveal<HTMLDivElement>();

  useEffect(() => {
    const id = setTimeout(
      () => setJourneySearch(journeyQuery),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(id);
  }, [journeyQuery, setJourneySearch]);

  if (loading) {
    return (
      <div className="overflow-hidden rounded-lg border border-foreground/6 bg-card">
        <div className="h-11 border-b border-foreground/6" />
        <div className="h-110 animate-pulse bg-foreground/3" />
      </div>
    );
  }

  const onJourney = tab === "journey";
  const searchValue = onJourney ? journeyQuery : query;
  const setSearchValue = onJourney ? setJourneyQuery : setQuery;
  const searchLabel = onJourney ? "Search customers" : "Search goals";

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
            if (v === "goal" && tab !== "goal") setGoalEntry((n) => n + 1);
            setTab(v as TabId);
            setDir(d);
          }}
        />

        <div className="flex items-center gap-2 justify-end pb-2">
          {onJourney && <GoalPicker />}

          <TextField
            size="sm"
            placeholder={searchLabel}
            leadingIcon={<MagnifyingGlassIcon size={1} />}
            clearable
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            htmlProps={{ "aria-label": searchLabel }}
            type="search"
            className={cn(tab === "funnel" ? "invisible" : "")}
          />
        </div>
      </div>

      <div className="grid h-110">
        {revealed && (
          <div
            role="tabpanel"
            id="insights-panel-goal"
            aria-labelledby="insights-tab-goal"
            aria-hidden={tab !== "goal"}
            tabIndex={tab === "goal" ? 0 : -1}
            className={cn(
              "[grid-area:1/1]",
              tab !== "goal" && "pointer-events-none invisible",
            )}
          >
            <GoalsTab query={query} entryKey={goalEntry} />
          </div>
        )}

        <div className="[grid-area:1/1]">
          <TabPanel tab={tab} dir={dir} name="insights">
            {tab === "funnel" && <FunnelTab />}
            {tab === "journey" && <JourneyTab />}
          </TabPanel>
        </div>
      </div>
    </div>
  );
}
