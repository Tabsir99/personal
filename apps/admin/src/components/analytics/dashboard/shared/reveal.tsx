"use client";

import { useCallback, useState } from "react";

const STEP = 200;

const batch: {
  top: number;
  left: number;
  go: () => void;
}[] = [];

let scheduled = false;

function schedule() {
  if (scheduled) return;

  scheduled = true;

  setTimeout(() => {
    scheduled = false;

    batch.sort((a, b) => {
      if (a.top - b.top) return a.top - b.top;
      return a.left - b.left;
    });

    batch.forEach(({ go }, i) => {
      setTimeout(go, i * STEP);
    });

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

        const { top, left } = entry.boundingClientRect;

        batch.push({
          top,
          left,
          go: () => setRevealed(true),
        });

        schedule();
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.25,
      },
    );

    io.observe(el);

    return () => io.disconnect();
  }, []);

  const enter = `transition duration-300 ease-out motion-reduce:transition-none ${
    revealed ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
  }`;

  return { ref, revealed, enter };
}
