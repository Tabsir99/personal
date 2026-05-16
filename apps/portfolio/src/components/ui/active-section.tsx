"use client";

import { useEffect } from "react";

/* Single global IntersectionObserver that watches every <section id="…">
   and broadcasts which one is "active" (closest to the upper-middle of
   the viewport). Two side-effects:

   1. Writes `data-active-section={id}` to <html>. Consumers (e.g. Rail)
      can subscribe via MutationObserver to react in JS.
   2. Toggles an `.is-active` class on every element with a matching
      `data-nav={id}` attribute. Consumers (e.g. Header nav links) can
      style via plain Tailwind/CSS selectors on `.is-active`.

   Replaces the per-component scroll listeners in header.tsx and rail.tsx
   that previously each iterated `SECTIONS.forEach(...)` on every scroll
   tick. */
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
          document
            .querySelectorAll<HTMLElement>("[data-nav]")
            .forEach((el) => {
              el.classList.toggle("is-active", el.dataset.nav === id);
            });
        }
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    document.querySelectorAll("section[id]").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);
  return null;
}
