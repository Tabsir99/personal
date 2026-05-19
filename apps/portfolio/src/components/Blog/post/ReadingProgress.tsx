"use client";

import * as React from "react";

export default function ReadingProgress({
  targetSelector = "[data-post-body]",
  showBadge = true,
}: {
  targetSelector?: string;
  showBadge?: boolean;
}) {
  const [pct, setPct] = React.useState(0);

  React.useEffect(() => {
    const target = document.querySelector(targetSelector) as HTMLElement | null;
    if (!target) return;
    const scroller =
      (document.getElementById("root") as HTMLElement | null) ??
      (document.scrollingElement as HTMLElement | null);
    if (!scroller) return;

    let raf = 0;
    const compute = () => {
      const rect = target.getBoundingClientRect();
      const scRect = scroller.getBoundingClientRect();
      const vh = scroller.clientHeight;
      const total = target.offsetHeight - vh;
      if (total <= 0) {
        setPct(rect.bottom > scRect.top && rect.top < scRect.bottom ? 1 : 0);
        return;
      }
      const scrolled = scRect.top - rect.top;
      const p = Math.max(0, Math.min(1, scrolled / total));
      setPct(p);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };
    compute();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [targetSelector]);

  const display = Math.round(pct * 100);

  return (
    <>
      <div
        className="fixed left-0 right-0 top-0 h-[3px] z-60 bg-transparent pointer-events-none"
        role="progressbar"
        aria-valuenow={display}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-linear-to-r from-accent to-cream-2 origin-left transition-transform duration-80 ease-linear shadow-[0_0_12px_color-mix(in_srgb,var(--color-accent)_60%,transparent)]"
          style={{ transform: `scaleX(${pct})` }}
        />
      </div>
      {showBadge && (
        <div
          className="font-mono fixed right-6 bottom-6 z-50 inline-flex items-center gap-2 px-3 py-2 bg-cream text-ink rounded-full text-xs tracking-wider shadow-[0_8px_20px_-8px_color-mix(in_srgb,var(--color-ink)_40%,transparent)] pointer-events-none tabular-nums max-sm:right-3 max-sm:bottom-3 max-sm:px-2.5 max-sm:py-1.5"
          aria-hidden="true"
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-accent)_30%,transparent)]" />
          {String(display).padStart(2, "0")}%
        </div>
      )}
    </>
  );
}
