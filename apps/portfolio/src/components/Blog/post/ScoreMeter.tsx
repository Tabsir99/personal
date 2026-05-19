"use client";

import * as React from "react";

const MAX_SCORE = 50;
const FLUSH_MS = 800;

const DIAL_BASE =
  "group relative appearance-none w-[84px] h-[84px] p-0 border-none rounded-full cursor-pointer isolate [transition:transform_120ms_ease,filter_200ms_ease] enabled:hover:scale-[1.04] enabled:active:scale-[0.96] disabled:cursor-default focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent)_30%,transparent)] before:content-[''] before:absolute before:inset-0 before:rounded-full before:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-cream)_8%,transparent)] before:pointer-events-none";

const CORE_BASE =
  "absolute inset-[6px] rounded-full flex items-center justify-center z-1 [transition:background-color_220ms_ease,color_220ms_ease]";

export default function ScoreMeter({
  slug,
  initialScore = 0,
}: {
  slug: string;
  initialScore?: number;
}) {
  const [tapped, setTapped] = React.useState(0);
  const [score, setScore] = React.useState(initialScore);
  const [bursts, setBursts] = React.useState<{ id: number }[]>([]);
  const [pulseKey, setPulseKey] = React.useState(0);
  const lastFlushed = React.useRef(0);
  const flushTimer = React.useRef<number | null>(null);
  const burstId = React.useRef(0);

  const storageKey = `score:${slug}`;

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const v = JSON.parse(raw) as { tapped?: number; lastFlushed?: number };
      if (typeof v.tapped === "number")
        setTapped(Math.min(MAX_SCORE, v.tapped));
      if (typeof v.lastFlushed === "number")
        lastFlushed.current = v.lastFlushed;
    } catch {}
  }, [storageKey]);

  const persist = React.useCallback(
    (next: number) => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ tapped: next, lastFlushed: lastFlushed.current }),
        );
      } catch {}
    },
    [storageKey],
  );

  const flush = React.useCallback(async () => {
    const delta = tapped - lastFlushed.current;
    if (delta <= 0) return;
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, delta }),
        keepalive: true,
      });
      if (res.ok) {
        const data = (await res.json().catch(() => null)) as {
          score?: number;
        } | null;
        if (data && typeof data.score === "number") setScore(data.score);
        else setScore((s) => s + delta);
        lastFlushed.current = tapped;
        persist(tapped);
      }
    } catch {}
  }, [slug, tapped, persist]);

  React.useEffect(() => {
    if (tapped === lastFlushed.current) return;
    if (flushTimer.current) window.clearTimeout(flushTimer.current);
    flushTimer.current = window.setTimeout(flush, FLUSH_MS);
    return () => {
      if (flushTimer.current) window.clearTimeout(flushTimer.current);
    };
  }, [tapped, flush]);

  React.useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [flush]);

  const tap = () => {
    if (tapped >= MAX_SCORE) return;
    const next = tapped + 1;
    setTapped(next);
    setPulseKey((p) => p + 1);
    persist(next);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.(8);
      } catch {}
    }
    const id = burstId.current++;
    setBursts((b) => [...b, { id }]);
    window.setTimeout(
      () => setBursts((b) => b.filter((x) => x.id !== id)),
      700,
    );
  };

  const pct = tapped / MAX_SCORE;
  const isMaxed = tapped >= MAX_SCORE;

  return (
    <div
      className="flex flex-col items-start gap-3.5 font-sans"
      data-maxed={isMaxed || undefined}
    >
      <div className="font-mono text-xs text-muted tracking-wider">
        // score
      </div>
      <button
        type="button"
        className={
          isMaxed ? `${DIAL_BASE} bg-accent` : `${DIAL_BASE} blog-dial`
        }
        onClick={tap}
        disabled={isMaxed}
        style={{ ["--fill" as string]: `${pct * 360}deg` }}
        aria-label={isMaxed ? "Score maxed out" : "Tap to add to score"}
      >
        <span
          className="absolute inset-0 rounded-full pointer-events-none z-0 animate-score-pulse"
          key={pulseKey}
          aria-hidden="true"
        />
        <span
          className={
            isMaxed
              ? `${CORE_BASE} bg-cream text-accent`
              : `${CORE_BASE} bg-cream text-ink group-hover:bg-ink group-hover:text-cream`
          }
        >
          {isMaxed ? (
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="M5 12.5l4.5 4.5L19 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <span
              className="font-sans font-black text-[38px] leading-none translate-y-[-2px]"
              aria-hidden="true"
            >
              +
            </span>
          )}
        </span>
        <span
          className="absolute left-1/2 -top-1.5 pointer-events-none z-2"
          aria-hidden="true"
        >
          {bursts.map((b) => (
            <span
              key={b.id}
              className="absolute left-0 font-mono text-xs font-bold text-accent -translate-x-1/2 animate-score-burst"
            >
              +1
            </span>
          ))}
        </span>
      </button>
      <div
        className="font-mono inline-flex items-baseline gap-1.5 text-xs text-muted tracking-wider tabular-nums"
        aria-live="polite"
      >
        <span
          className={
            isMaxed
              ? "text-accent font-bold text-sm"
              : "text-cream font-bold text-sm"
          }
        >
          {score.toLocaleString()}
        </span>
        <span>global</span>
      </div>
    </div>
  );
}
