"use client";

import { useShallow } from "zustand/react/shallow";
import { useAnalyticsStore } from "../../../stores/analyticsStore";
import { DataPanel } from "./shared/DataPanel";
import { formatCountryName, CountryFlag } from "@/lib/countryUtils";

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
            icon: <CountryFlag code={l.country} />,
            values: { visitors: l.uv, revenue: l.revenue },
          })),
        },
        {
          value: "region",
          label: "Region",
          items: (locations?.regions ?? []).map((l) => ({
            name: l.name,
            icon: <CountryFlag code={l.country} />,
            values: { visitors: l.uv, revenue: l.revenue },
          })),
        },
        {
          value: "city",
          label: "City",
          items: (locations?.cities ?? []).map((l) => ({
            name: l.name,
            icon: <CountryFlag code={l.country} />,
            values: { visitors: l.uv, revenue: l.revenue },
          })),
        },
      ]}
    />
  );
}
