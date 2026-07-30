"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { Select, type SelectOption } from "premium-ds/select";
import {
  useAnalyticsStore,
  JOURNEY_EVERY_VISITOR,
} from "@/stores/analyticsStore";
import { useGoalList } from "../useGoalList";
import { formatCount } from "../../shared/chartFormat";

const RESERVED_DESCRIPTION: Record<string, string> = {
  payment: "Paying visitors",
  identify: "Identified visitors",
  external_link: "Visitors who followed an outbound link",
};

export function GoalPicker() {
  const { goals, goal, setGoal } = useAnalyticsStore(
    useShallow((s) => ({
      goals: s.goals,
      goal: s.journeyGoal,
      setGoal: s.setJourneyGoal,
    })),
  );

  const goalList = useGoalList();

  const options = useMemo<SelectOption[]>(() => {
    const uvByName = new Map(
      (goals?.goals ?? []).map((g) => [g.name, g.uv] as const),
    );

    return [
      {
        value: JOURNEY_EVERY_VISITOR,
        label: "All visitors",
        description: "Everyone active in this period",
      },
      ...goalList.map(({ name, label }) => {
        const uv = uvByName.get(name);
        const description =
          uv === undefined
            ? RESERVED_DESCRIPTION[name]
            : `${formatCount(uv)} visitors`;

        return { value: name, label, ...(description ? { description } : {}) };
      }),
    ];
  }, [goals, goalList]);

  return (
    <Select
      triggerProps={{
        size: "sm",
        variant: "secondary",
      }}
      searchable
      searchPlaceholder="Filter goals"
      options={options}
      value={goal}
      onChange={setGoal}
      ariaLabel="Journey goal"
      htmlProps={{ className: "w-auto!" }}
    />
  );
}
