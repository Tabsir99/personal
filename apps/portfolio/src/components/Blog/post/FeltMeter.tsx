"use client";

import { use, useRef, useState } from "react";
import { H3 } from "@/components/ui/H2";
import { HeartButton } from "./HeartButton";

const MAX = 50;
const DEBOUNCE_MS = 600;

function ensureDeviceId() {
  if (/(?:^|;\s*)felt-id=/.test(document.cookie)) return;
  document.cookie = `felt-id=${crypto.randomUUID()}; path=/; max-age=31536000; samesite=lax`;
}

const mineCache = new Map<string, Promise<number>>();
function loadMine(slug: string): Promise<number> {
  if (typeof window === "undefined") return new Promise<number>(() => {});
  let p = mineCache.get(slug);
  if (!p) {
    ensureDeviceId();
    p = fetch(`/api/score?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? (r.json() as Promise<{ mine: number }>) : null))
      .then((d) => d?.mine ?? 0)
      .catch(() => 0);
    mineCache.set(slug, p);
  }
  return p;
}

export default function FeltMeter({
  slug,
  initialScore = 0,
}: {
  slug: string;
  initialScore?: number;
}) {
  const [felt, setFelt] = useState({
    score: initialScore,
    mine: use(loadMine(slug)),
  });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tap = () => {
    if (felt.mine >= MAX) return;
    const next = { score: felt.score + 1, mine: felt.mine + 1 };
    setFelt(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      fetch("/api/score", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, count: next.mine }),
      });
    }, DEBOUNCE_MS);
  };

  return (
    <div className="flex flex-col items-start gap-3.5 font-sans">
      <H3 variant="widget">// felt</H3>
      <HeartButton
        size={84}
        step={1 / MAX}
        onChange={tap}
        ariaLabel={felt.mine >= MAX ? "Felt maxed out" : "Tap to add warmth"}
      />
      <div className="flex flex-col gap-1" aria-live="polite">
        <span className="font-serif italic text-sm leading-none text-cream-2">
          felt by{" "}
          <span className="not-italic font-medium tabular-nums text-accent">
            {felt.score}
          </span>
        </span>
        <span className="font-mono text-xxs uppercase tracking-widest text-muted-2">
          [<span className="tabular-nums">{felt.mine}</span>/{MAX}]
        </span>
      </div>
    </div>
  );
}
