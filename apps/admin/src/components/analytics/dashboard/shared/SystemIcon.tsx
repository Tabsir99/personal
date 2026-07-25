"use client";

import { useState } from "react";
import { Globe, Monitor } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type SystemIconKind = "browser" | "os" | "device";

function iconSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/^(mobile|tablet) /, "")
    .replace(/ (webview|headless)$/, "")
    .replace(/ /g, "-");
}

export function SystemIcon({
  kind,
  name,
  className,
}: {
  kind: SystemIconKind;
  name: string;
  className?: string;
}) {
  const [erroredSrc, setErroredSrc] = useState("");

  const slug = kind === "device" ? name.toLowerCase() : iconSlug(name);
  const src = `/icons/${kind}/${slug}.svg`;

  if (erroredSrc === src) {
    const Fallback = kind === "browser" ? Globe : Monitor;
    return (
      <Fallback
        className={cn("size-4 text-muted-foreground/60", className)}
        aria-label={name}
      />
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={cn("size-5 object-contain", className)}
      onError={() => setErroredSrc(src)}
    />
  );
}
