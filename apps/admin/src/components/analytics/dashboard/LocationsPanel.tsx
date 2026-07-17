"use client";

import { useShallow } from "zustand/react/shallow";
import { useAnalyticsStore } from "./analyticsStore";
import { DataPanel, RankedList } from "./DataPanel";

export function LocationsPanel() {
  const { locations, loading } = useAnalyticsStore(useShallow((s) => ({
    locations: s.locations,
    loading: s.locationsLoading,
  })));

  if (loading) {
    return <div className="h-105 animate-pulse rounded-lg bg-foreground/3" />;
  }

  return (
    <DataPanel
      tabs={[
        { value: "country", label: "Country" },
        { value: "region", label: "Region" },
        { value: "city", label: "City" },
      ]}
    >
      {(tab) => {
        if (!locations) return <RankedList items={[]} />;
        const map = { country: locations.countries, region: locations.regions, city: locations.cities };
        return <RankedList items={(map[tab as keyof typeof map] ?? []).map((l) => ({ name: l.name, value: l.uv }))} />;
      }}
    </DataPanel>
  );
}
