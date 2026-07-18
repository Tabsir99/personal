"use client";

import { useShallow } from "zustand/react/shallow";
import { useAnalyticsStore } from "./analyticsStore";
import { DataPanel, RankedList } from "./DataPanel";

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

function getCountryFlag(code: string | undefined) {
  if (!code) return null;
  const lower = code.toLowerCase();
  return (
    <img
      src={`https://flagcdn.com/20x15/${lower}.png`}
      alt={code}
      className="h-3 w-4 rounded-sm object-cover shadow-[0_0_1px_rgba(0,0,0,0.15)]"
    />
  );
}

function formatCountryName(code: string) {
  return countryNames.of(code.toUpperCase()) ?? code;
}

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
        const rawItems = map[tab as keyof typeof map] ?? [];
        const items = rawItems.map((l) => ({
          name: tab === "country" ? formatCountryName(l.name) : l.name,
          value: l.uv,
          icon: getCountryFlag(l.country),
        }));
        return <RankedList items={items} />;
      }}
    </DataPanel>
  );
}
