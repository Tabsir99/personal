"use client";

import * as React from "react";

export default function ReadingProgress({
  targetSelector = ".post__body",
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
        className="rprog"
        role="progressbar"
        aria-valuenow={display}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="rprog__fill" style={{ transform: `scaleX(${pct})` }} />
      </div>
      {showBadge && (
        <div className="rprog__badge mono" aria-hidden="true">
          <span className="rprog__badge-dot" />
          {String(display).padStart(2, "0")}%
        </div>
      )}
    </>
  );
}
