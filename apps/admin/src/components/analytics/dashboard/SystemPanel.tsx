"use client";

import { useShallow } from "zustand/react/shallow";
import { useAnalyticsStore } from "./analyticsStore";
import { DataPanel, RankedList } from "./DataPanel";

export function SystemPanel() {
  const { system, loading } = useAnalyticsStore(useShallow((s) => ({
    system: s.system,
    loading: s.systemLoading,
  })));

  if (loading) {
    return <div className="h-105 animate-pulse rounded-lg bg-foreground/3" />;
  }

  return (
    <DataPanel
      tabs={[
        { value: "browser", label: "Browser" },
        { value: "os", label: "OS" },
        { value: "device", label: "Device" },
      ]}
    >
      {(tab) => {
        if (!system) return <RankedList items={[]} />;
        const map = { browser: system.browsers, os: system.os, device: system.devices };
        return <RankedList items={(map[tab as keyof typeof map] ?? []).map((s) => ({ name: s.name, value: s.uv }))} />;
      }}
    </DataPanel>
  );
}
