"use client";

import { useShallow } from "zustand/react/shallow";
import {
  Globe,
  Monitor,
  Phone,
  DeviceTablet,
} from "@phosphor-icons/react";
import { useAnalyticsStore } from "./analyticsStore";
import { DataPanel, RankedList } from "./DataPanel";

function getSystemIcon(name: string, tab: "browser" | "os" | "device") {
  const lower = name.toLowerCase();
  if (tab === "browser") {
    if (lower.includes("chrome")) return <img src="/icons/browser/chrome.svg" alt="Chrome" className="size-4 object-contain" />;
    if (lower.includes("safari")) return <img src="/icons/browser/safari.svg" alt="Safari" className="size-4 object-contain" />;
    if (lower.includes("firefox")) return <img src="/icons/browser/firefox.svg" alt="Firefox" className="size-4 object-contain" />;
    if (lower.includes("edge")) return <img src="/icons/browser/edge.svg" alt="Edge" className="size-4 object-contain" />;
    return <Globe className="size-4 text-muted-foreground/60" />;
  }
  if (tab === "os") {
    if (lower.includes("windows")) return <img src="/icons/os/windows.svg" alt="Windows" className="size-4 object-contain" />;
    if (lower.includes("mac") || lower.includes("ios")) return <img src="/icons/os/apple.svg" alt="Apple" className="size-4 object-contain" />;
    if (lower.includes("android")) return <img src="/icons/os/android.svg" alt="Android" className="size-4 object-contain" />;
    if (lower.includes("linux") || lower.includes("ubuntu")) return <img src="/icons/os/linux.svg" alt="Linux" className="size-4 object-contain" />;
    return <Monitor className="size-4 text-muted-foreground/60" />;
  }
  if (tab === "device") {
    if (lower.includes("desktop")) return <Monitor className="size-4 text-foreground/70" />;
    if (lower.includes("mobile") || lower.includes("phone")) return <Phone className="size-4 text-foreground/70" />;
    if (lower.includes("tablet") || lower.includes("ipad")) return <DeviceTablet className="size-4 text-foreground/70" />;
  }
  return null;
}

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
        const rawItems = map[tab as keyof typeof map] ?? [];
        const items = rawItems.map((s) => ({
          name: s.name,
          value: s.uv,
          icon: getSystemIcon(s.name, tab as "browser" | "os" | "device"),
        }));
        return <RankedList items={items} />;
      }}
    </DataPanel>
  );
}
