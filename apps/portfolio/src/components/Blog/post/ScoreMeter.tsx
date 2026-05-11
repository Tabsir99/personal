"use client";

import * as React from "react";

const MAX_SCORE = 50;
const FLUSH_MS = 800;

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
      if (typeof v.tapped === "number") setTapped(Math.min(MAX_SCORE, v.tapped));
      if (typeof v.lastFlushed === "number") lastFlushed.current = v.lastFlushed;
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
        const data = (await res.json().catch(() => null)) as
          | { score?: number }
          | null;
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
    window.setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 700);
  };

  const pct = tapped / MAX_SCORE;
  const isMaxed = tapped >= MAX_SCORE;

  return (
    <div className="score" data-maxed={isMaxed || undefined}>
      <div className="score__head mono">// score</div>
      <button
        type="button"
        className="score__dial"
        onClick={tap}
        disabled={isMaxed}
        style={{ ["--fill" as string]: `${pct * 360}deg` }}
        aria-label={isMaxed ? "Score maxed out" : "Tap to add to score"}
      >
        <span className="score__dial-pulse" key={pulseKey} aria-hidden="true" />
        <span className="score__dial-core">
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
            <span className="score__dial-plus" aria-hidden="true">+</span>
          )}
        </span>
        <span className="score__bursts" aria-hidden="true">
          {bursts.map((b) => (
            <span key={b.id} className="score__burst">+1</span>
          ))}
        </span>
      </button>
      <div className="score__meta mono" aria-live="polite">
        <span className="score__global">{score.toLocaleString()}</span>
        <span className="score__global-label">global</span>
      </div>
    </div>
  );
}
