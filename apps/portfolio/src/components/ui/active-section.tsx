"use client";

import { useEffect } from "react";

/* Single scroll-state authority for the portfolio. Writes to <html>:
   - data-active-section={id} + .is-active on matching [data-nav={id}]
     (IntersectionObserver on every <section id>)
   - --scroll-y (raw px, unitless) + --scroll-progress (0-100)
   - data-scrolled (boolean, scrollY > 60)
   - --rail-pos-{id} per section (% of doc height; rail tick positions)
   - --section-{id}-top + --section-{id}-h per section (raw px, unitless;
     for CSS to express section-relative scroll math)
   - data-pin-step={idx} + --pin-sub={0..1} on every [data-pin-steps]
     element (generic step-based pin-scroll signals).

   Per-section + pin-target measurements are kept in sync via a
   ResizeObserver on <body> so content-driven height changes (fonts,
   images, breakpoint reflow) reposition everything correctly. */

type PinTarget = {
  el: HTMLElement;
  steps: number;
  top: number;
  height: number;
};

export function ActiveSectionTracker() {
  useEffect(() => {
    let current = "";
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const id = e.target.id;
          if (id === current) continue;
          current = id;
          document.documentElement.dataset.activeSection = id;
          document.querySelectorAll<HTMLElement>("[data-nav]").forEach((el) => {
            el.classList.toggle("is-active", el.dataset.nav === id);
          });
        }
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    document.querySelectorAll("section[id]").forEach((s) => io.observe(s));

    const pinTargets: PinTarget[] = [];

    function measure() {
      const y = window.scrollY;
      const docH = document.documentElement.scrollHeight;
      const root = document.documentElement.style;
      document.querySelectorAll<HTMLElement>("section[id]").forEach((s) => {
        const top = s.getBoundingClientRect().top + y;
        const h = s.offsetHeight;
        const pct = docH > 0 ? (top / docH) * 100 : 0;
        root.setProperty(`--rail-pos-${s.id}`, `${pct.toFixed(2)}%`);
        root.setProperty(`--section-${s.id}-top`, String(Math.round(top)));
        root.setProperty(`--section-${s.id}-h`, String(h));
      });
      pinTargets.length = 0;
      document
        .querySelectorAll<HTMLElement>("[data-pin-steps]")
        .forEach((el) => {
          pinTargets.push({
            el,
            steps: Number(el.dataset.pinSteps) || 1,
            top: el.getBoundingClientRect().top + y,
            height: el.offsetHeight,
          });
        });
    }
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);

    let raf = 0;
    let lastScrolled = false;
    function compute() {
      raf = 0;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const docH = document.documentElement.scrollHeight - vh;
      const root = document.documentElement.style;
      const progress = docH > 0 ? (y / docH) * 100 : 0;
      root.setProperty("--scroll-y", String(y));
      root.setProperty("--scroll-progress", progress.toFixed(2));
      const isScrolled = y > 60;
      if (isScrolled !== lastScrolled) {
        lastScrolled = isScrolled;
        if (isScrolled) {
          document.documentElement.dataset.scrolled = "";
        } else {
          delete document.documentElement.dataset.scrolled;
        }
      }
      for (const t of pinTargets) {
        const total = t.height - vh;
        if (total <= 0) continue;
        const scrolled = Math.min(Math.max(y - t.top, 0), total);
        const p = scrolled / total;
        const idx = Math.min(t.steps - 1, Math.floor(p * t.steps));
        const sub = p * t.steps - idx;
        const idxStr = String(idx);
        if (t.el.dataset.pinStep !== idxStr) {
          t.el.dataset.pinStep = idxStr;
          t.el.style.setProperty("--pin-step", idxStr);
        }
        t.el.style.setProperty("--pin-sub", sub.toFixed(3));
      }
    }
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(compute);
    }
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
