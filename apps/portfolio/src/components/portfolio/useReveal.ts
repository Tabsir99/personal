"use client";
import { useState, useEffect, useRef } from "react";

/* IntersectionObserver wrapper — fires once when an element scrolls into view. */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  opts: { threshold?: number; rootMargin?: string } = {},
) {
  const ref = useRef<T>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          io.disconnect();
        }
      },
      {
        threshold: opts.threshold || 0.15,
        rootMargin: opts.rootMargin || "0px 0px -10% 0px",
      },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, vis] as const;
}
