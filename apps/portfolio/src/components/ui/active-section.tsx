"use client";

import { useEffect } from "react";

/* Single global scroll-state writer for the portfolio.

   1. Active section — IntersectionObserver watches every <section id="…">
      and writes `data-active-section={id}` to <html> + toggles `.is-active`
      on every `[data-nav={id}]` element. Header / Rail consume this.

   2. Scroll progress — one RAF-throttled scroll listener writes a numeric
      `--scroll-progress` (0-100) custom property on <html>, and toggles
      a `data-scrolled` boolean attribute when scrollY > 60. Header reads
      `data-scrolled` via CSS; Rail reads `--scroll-progress` from inline
      style on its fill bar + breath dot.

   3. Rail tick positions — ResizeObserver on <body> writes a
      `--rail-pos-{id}` percentage to <html> for every section. Fires on
      viewport resize AND on content-driven height changes (fonts settling,
      images loading, mobile breakpoint reflow). Rail's ticks reference
      these via inline style, so Rail itself stays server-rendered.

   Replaces the per-component scroll listeners + measurement effects that
   header.tsx and rail.tsx used to each maintain. */
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

    function measureRailPositions() {
      const docH = document.documentElement.scrollHeight;
      document.querySelectorAll<HTMLElement>("section[id]").forEach((s) => {
        const pct = docH > 0 ? (s.offsetTop / docH) * 100 : 0;
        document.documentElement.style.setProperty(
          `--rail-pos-${s.id}`,
          `${pct.toFixed(2)}%`,
        );
      });
    }
    const ro = new ResizeObserver(measureRailPositions);
    ro.observe(document.body);

    let raf = 0;
    let lastScrolled = false;
    function compute() {
      raf = 0;
      const y = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docH > 0 ? (y / docH) * 100 : 0;
      document.documentElement.style.setProperty(
        "--scroll-progress",
        progress.toFixed(2),
      );
      const isScrolled = y > 60;
      if (isScrolled !== lastScrolled) {
        lastScrolled = isScrolled;
        if (isScrolled) {
          document.documentElement.dataset.scrolled = "";
        } else {
          delete document.documentElement.dataset.scrolled;
        }
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
