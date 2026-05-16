"use client";

import { useEffect } from "react";

/* Single global IntersectionObserver for the portfolio + blog.
   Watches every element with `data-reveal`, `data-reveal-stagger`, or
   `data-reveal-words`. On first entry, adds `is-in` and unobserves.
   CSS in base.css / blog.css drives the actual transitions; this file
   only flips the trigger class. One-shot — content stays revealed. */
export function ScrollObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { threshold: 0.4, rootMargin: "0px 0px -10% 0px" },
    );
    document
      .querySelectorAll<HTMLElement>(
        "[data-reveal], [data-reveal-stagger], [data-reveal-words]",
      )
      .forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
