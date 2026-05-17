"use client";

import { useEffect } from "react";

/* Writes three signals to <html> for Header + Rail to consume:
   - data-active-section={id} + .is-active on matching [data-nav={id}]
     (IntersectionObserver on every <section id>)
   - --scroll-progress (0-100) + data-scrolled (scrollY > 60)
   - --rail-pos-{id} per section, kept in sync via ResizeObserver so
     content-driven height changes (fonts, images, breakpoint reflow)
     reposition the rail ticks. */
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
