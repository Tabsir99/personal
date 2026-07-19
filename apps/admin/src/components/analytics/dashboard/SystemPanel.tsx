"use client";

import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Globe, Monitor } from "@phosphor-icons/react";
import { useAnalyticsStore } from "./analyticsStore";
import { DataPanel } from "./DataPanel";

type Kind = "browser" | "os" | "device";

// ua-parser-js emits display names ("Mobile Safari", "Samsung Internet",
// "Chrome OS", "macOS", "IE"). The icon files under /public/icons are named
// after this slug, so the filename *is* the mapping — no lookup table. Anything
// without a matching file (or a browser UA can't identify) falls back below.
function iconSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/^(mobile|tablet) /, "") // Mobile Safari -> safari
    .replace(/ (webview|headless)$/, "") // Chrome WebView -> chrome
    .replace(/ /g, "-"); // Samsung Internet -> samsung-internet
}

function SystemIcon({ kind, name }: { kind: Kind; name: string }) {
  const [erroredSrc, setErroredSrc] = useState("");

  const slug = kind === "device" ? name.toLowerCase() : iconSlug(name);
  const src = `/icons/${kind}/${slug}.svg`;

  if (erroredSrc === src) {
    const Fallback = kind === "browser" ? Globe : Monitor;
    return <Fallback className="size-4 text-muted-foreground/60" />;
  }

  return (
    <img
      src={src}
      alt={name}
      className="size-5 object-contain"
      onError={() => setErroredSrc(src)}
    />
  );
}

export function SystemPanel() {
  const { system, loading } = useAnalyticsStore(
    useShallow((s) => ({
      system: s.system,
      loading: s.systemLoading,
    })),
  );

  if (loading) {
    return <div className="h-105 animate-pulse rounded-lg bg-foreground/3" />;
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
