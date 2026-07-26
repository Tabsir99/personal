"use client";

import { useShallow } from "zustand/react/shallow";
import { useAnalyticsStore } from "../../../stores/analyticsStore";
import { DataPanel, PANEL_HEIGHT } from "./shared/DataPanel";
import { SystemIcon } from "./shared/SystemIcon";

export function SystemPanel() {
  const { system, loading } = useAnalyticsStore(
    useShallow((s) => ({
      system: s.system,
      loading: s.systemLoading,
    })),
  );

  if (loading) {
    return (
      <div
        className={`${PANEL_HEIGHT} animate-pulse rounded-lg bg-foreground/3`}
      />
    );
  }

  return (
    <DataPanel
      tabs={[
        {
          value: "browser",
          label: "Browser",
          items: (system?.browsers ?? []).map((s) => ({
            name: s.name,
            icon: <SystemIcon kind="browser" name={s.name} />,
            values: { visitors: s.uv, revenue: s.revenue },
          })),
        },
        {
          value: "os",
          label: "OS",
          items: (system?.os ?? []).map((s) => ({
            name: s.name,
            icon: <SystemIcon kind="os" name={s.name} />,
            values: { visitors: s.uv, revenue: s.revenue },
          })),
        },
        {
          value: "device",
          label: "Device",
          items: (system?.devices ?? []).map((s) => ({
            name: s.name,
            icon: <SystemIcon kind="device" name={s.name} />,
            values: { visitors: s.uv, revenue: s.revenue },
          })),
        },
      ]}
    />
  );
}
