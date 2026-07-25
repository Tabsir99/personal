"use client";

import { useShallow } from "zustand/react/shallow";
import { Select, type SelectOption } from "premium-ds/select";
import {
  useAnalyticsStore,
  JOURNEY_EVERY_VISITOR,
} from "@/stores/analyticsStore";
import { formatCount } from "../../shared/chartFormat";

const PAYMENT_GOAL = "payment";

export function GoalPicker() {
  const { goals, goal, setGoal } = useAnalyticsStore(
    useShallow((s) => ({
      goals: s.goals,
      goal: s.journeyGoal,
      setGoal: s.setJourneyGoal,
    })),
  );

  const options: SelectOption[] = [
    { value: PAYMENT_GOAL, label: "Payment", description: "Paying visitors" },
    {
      value: JOURNEY_EVERY_VISITOR,
      label: "All visitors",
      description: "Everyone active in this period",
    },
    ...(goals?.goals ?? []).map((g) => ({
      value: g.name,
      label: g.name,
      description: `${formatCount(g.uv)} visitors`,
    })),
  ];

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
