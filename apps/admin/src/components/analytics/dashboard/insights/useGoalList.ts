"use client";

import { useMemo } from "react";
import { useAnalyticsStore } from "@/stores/analyticsStore";
import { RESERVED_GOALS } from "@/lib/analyticsTypes";

export interface GoalListEntry {
  name: string;
  label: string;
}

const NO_CATALOG: string[] = [];

export function useGoalList(): GoalListEntry[] {
  const catalog = useAnalyticsStore((s) => s.goals?.catalog ?? NO_CATALOG);

  return useMemo(() => {
    const seen = new Set<string>();
    const list: GoalListEntry[] = [];

    for (const { name, label } of RESERVED_GOALS) {
      seen.add(name);
      list.push({ name, label });
    }
    for (const name of catalog) {
      if (seen.has(name)) continue;
      seen.add(name);
      list.push({ name, label: name });
    }

    return list;
  }, [catalog]);
}
