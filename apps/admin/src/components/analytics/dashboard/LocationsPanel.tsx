"use client";

import { useShallow } from "zustand/react/shallow";
import { useAnalyticsStore } from "../../../stores/analyticsStore";
import { DataPanel } from "./shared/DataPanel";

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

function getCountryFlag(code: string | undefined) {
  if (!code) return null;
  const lower = code.toLowerCase();
  return (
    <img
      src={`https://flagcdn.com/20x15/${lower}.png`}
      alt={code}
      className="h-3 w-4 rounded-sm object-cover ring-1 ring-foreground/10"
    />
  );
}

function formatCountryName(code: string) {
  return countryNames.of(code.toUpperCase()) ?? code;
}

export function LocationsPanel() {
  const { locations, loading } = useAnalyticsStore(
    useShallow((s) => ({
      locations: s.locations,
      loading: s.locationsLoading,
    })),
  );

  if (loading) {
    return <div className="h-105 animate-pulse rounded-lg bg-foreground/3" />;
  }

  return (
    <DataPanel
      tabs={[
        {
          value: "country",
          label: "Country",
          items: (locations?.countries ?? []).map((l) => ({
            name: formatCountryName(l.name),
            icon: getCountryFlag(l.country),
            values: { visitors: l.uv, revenue: l.revenue },
          })),
        },
        {
          value: "region",
          label: "Region",
          items: (locations?.regions ?? []).map((l) => ({
            name: l.name,
            icon: getCountryFlag(l.country),
            values: { visitors: l.uv, revenue: l.revenue },
          })),
        },
        {
          value: "city",
          label: "City",
          items: (locations?.cities ?? []).map((l) => ({
            name: l.name,
            icon: getCountryFlag(l.country),
            values: { visitors: l.uv, revenue: l.revenue },
          })),
        },
      ]}
    />
  );
}
