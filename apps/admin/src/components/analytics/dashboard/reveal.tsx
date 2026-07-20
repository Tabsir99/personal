"use client";

import { useCallback, useState } from "react";

const STEP = 180;
const batch: { el: Element; go: () => void }[] = [];
let scheduled = false;

function schedule() {
  if (scheduled) return;
  scheduled = true;
  setTimeout(() => {
    scheduled = false;
    batch.sort(
      (a, b) =>
        a.el.getBoundingClientRect().top - b.el.getBoundingClientRect().top,
    );
    batch.forEach(({ go }, i) => setTimeout(go, i * STEP));
    batch.length = 0;
  }, 0);
}

export function useReveal<T extends Element>() {
  const [revealed, setRevealed] = useState(false);

  const ref = useCallback((el: T | null) => {
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        batch.push({ el, go: () => setRevealed(true) });
        schedule();
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const enter = `transition duration-500 ease-out motion-reduce:transition-none ${
    revealed ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
  }`;

  return { ref, revealed, enter };
}
