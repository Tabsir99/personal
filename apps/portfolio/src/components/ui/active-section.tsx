"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { SECTIONS } from "@/components/portfolio/sections-data";

type PinTarget = {
  el: HTMLElement;
  steps: number;
  top: number;
  height: number;
};

export function ActiveSectionTracker() {
  const pathname = usePathname();
  useEffect(() => {
    const observeItems = [
      ...SECTIONS.map(({ id }) => document.getElementById(id)),
      ...Array.from(
        document
          .querySelector(".open-notion-doc")
          ?.querySelectorAll(":where(h2,h3,h4)[id]") || [],
      ),
    ];

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
      { rootMargin: "0px 0px -80% 0px" },
    );

    observeItems.forEach((item) => item && io.observe(item));

    const pinTargets: PinTarget[] = [];

    const ro = new ResizeObserver(() => measure(pinTargets));
    ro.observe(document.body);

    let raf = 0;
    let lastScrolled = false;
    let lastY = -1;
    function compute() {
      raf = 0;
      const y = window.scrollY;
      if (y === lastY) return;
      lastY = y;
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
      // raf = requestAnimationFrame(compute);
    }
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);
  return null;
}

function measure(pinTargets: PinTarget[]) {
  const y = window.scrollY;
  const docH = document.documentElement.scrollHeight;
  const root = document.documentElement.style;
  SECTIONS.forEach(({ id }) => {
    const s = document.getElementById(id);
    if (!s) return;

    const top = s.getBoundingClientRect().top + y;
    const h = s.offsetHeight;
    const pct = docH > 0 ? (top / docH) * 100 : 0;
    root.setProperty(`--rail-pos-${s.id}`, `${pct.toFixed(2)}%`);
    root.setProperty(`--section-${s.id}-top`, String(Math.round(top)));
    root.setProperty(`--section-${s.id}-h`, String(h));
  });
  pinTargets.length = 0;
  document.querySelectorAll<HTMLElement>("[data-pin-steps]").forEach((el) => {
    pinTargets.push({
      el,
      steps: Number(el.dataset.pinSteps) || 1,
      top: el.getBoundingClientRect().top + y,
      height: el.offsetHeight,
    });
  });
}
