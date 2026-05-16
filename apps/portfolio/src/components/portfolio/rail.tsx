"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { SECTIONS } from "./sections-data";

/* ===== Persistent left rail ===== */
export function Rail() {
  const [positions, setPositions] = useState<number[]>([]);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0); // scrollY / docH — aligned with tick positions

  useEffect(() => {
    function measure() {
      const docH = document.documentElement.scrollHeight;
      const pos = SECTIONS.map((s) => {
        const el = document.getElementById(s.id);
        if (!el) return 0;
        return (el.offsetTop / docH) * 100;
      });
      setPositions(pos);
    }
    measure();
    window.addEventListener("resize", measure);
    const t = setTimeout(measure, 600);
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(t);
    };
  }, []);

  // Progress fill + breath-dot position. Tier C target — moves to CSS
  // scroll-timeline later.
  useEffect(() => {
    function onScroll() {
      const docH = document.documentElement.scrollHeight;
      setProgress((window.scrollY / docH) * 100);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section comes from the shared ActiveSectionTracker which writes
  // `data-active-section` to <html>. MutationObserver here is much lighter
  // than the previous per-scroll-tick SECTIONS.forEach loop.
  useEffect(() => {
    function update() {
      const id = document.documentElement.dataset.activeSection;
      if (!id) return;
      const idx = SECTIONS.findIndex((s) => s.id === id);
      if (idx >= 0) setActive(idx);
    }
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-active-section"],
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "fixed top-24 bottom-14 left-(--rail-x) w-px z-50 pointer-events-none",
        "opacity-0 animate-rail-in",
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-line"></div>
      <div className="absolute left-[-3px] top-[-3px] w-[7px] h-[7px] border border-muted-2 rounded-full bg-ink"></div>
      <div className="absolute left-[-3px] bottom-[-3px] w-[7px] h-[7px] border border-muted-2 rounded-full bg-ink"></div>
      <div
        className={cn(
          "absolute top-0 left-0 w-px h-0 bg-accent",
          "shadow-[0_0_8px_color-mix(in_oklab,var(--color-accent)_35%,transparent)]",
          "transition-[height] duration-60 ease-linear",
        )}
        style={{ height: `${progress}%` }}
      ></div>
      {positions.map((p, i) => (
        <div
          key={i}
          className={cn(
            "absolute left-[-4px] w-[9px] h-px transition-colors duration-400 ease-[ease]",
            "[&_.rail-tick-label]:transition-colors [&_.rail-tick-label]:duration-300 [&_.rail-tick-label]:ease-[ease]",
            i === active && "bg-muted-2 [&_.rail-tick-label]:text-cream",
            i < active && "bg-accent [&_.rail-tick-label]:text-muted",
            i > active && "bg-muted-2 [&_.rail-tick-label]:text-muted-2",
          )}
          style={{ top: `${p}%` }}
        >
          <span
            className={cn(
              "rail-tick-label",
              "absolute left-[22px] font-mono text-[9px] tracking-[0.15em] uppercase",
              "-translate-y-1/2 whitespace-nowrap",
            )}
          >
            {SECTIONS[i].label}
          </span>
        </div>
      ))}
      <div
        className={cn(
          "absolute left-[-3px] w-[7px] h-[7px] bg-accent rounded-full",
          "shadow-[0_0_14px_color-mix(in_oklab,var(--color-accent)_70%,transparent)]",
          "-translate-y-1/2 transition-[top] duration-60 ease-linear animate-rail-breath",
          "after:content-[''] after:absolute after:left-[12px] after:top-1/2",
          "after:w-[22px] after:h-px after:bg-accent after:-translate-y-1/2 after:opacity-50",
        )}
        style={{ top: `${progress}%` }}
      ></div>
    </div>
  );
}
