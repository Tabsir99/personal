"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { H3 } from "@/components/ui/H2";
import { HeartButton } from "./HeartButton";

const MAX = 50;
const DEBOUNCE_MS = 600;

function ensureDeviceId() {
  if (/(?:^|;\s*)felt-id=/.test(document.cookie)) return;
  document.cookie = `felt-id=${crypto.randomUUID()}; path=/; max-age=31536000; samesite=lax`;
}

type Felt = { score: number; mine: number };

export default function FeltMeter({ slug }: { slug: string }) {
  const [felt, setFelt] = useState<Felt | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    ensureDeviceId();
    fetch(`/api/score?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? (r.json() as Promise<Felt>) : null))
      .then((d) => setFelt(d))
      .catch(() => {});
  }, [slug]);

  const loading = felt === null;
  const score = felt?.score ?? 0;
  const mine = felt?.mine ?? 0;
  const maxed = mine >= MAX;

  const tap = () => {
    if (loading || maxed) return;
    const next = { score: score + 1, mine: mine + 1 };
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
    <div className="flex flex-col items-start gap-2">
      <H3 variant="widget">// felt</H3>
      <HeartButton
        fill={mine / MAX}
        size={84}
        onTap={tap}
        ariaLabel={maxed ? "Felt maxed out" : "Tap to add warmth"}
      />
      <div className="flex flex-col gap-1" aria-live="polite">
        <span className="font-serif italic text-sm leading-none text-cream-2">
          felt by{" "}
          <span className="not-italic font-medium tabular-nums text-accent">
            {loading ? "—" : score}
          </span>
        </span>
        <span className="font-mono text-xxs uppercase tracking-widest text-muted-2">
          [<span className="tabular-nums">{loading ? "—" : mine}</span>/{MAX}]
        </span>
      </div>
    </div>
  );
}
