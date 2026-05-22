"use client";

import { useEffect, useRef } from "react";

/* z-0 — above Atmosphere, below <main>'s z-1. */
export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!glowRef.current) return;
    let raf = 0;
    let tx = 0.5,
      ty = 0.4;
    let cx = 0.5,
      cy = 0.4;
    let inside = false;

    /* Lerp asymptotes — without this idle check rAF would run forever,
       repainting the fullscreen radial-gradient every frame. */
    const IDLE_EPSILON = 0.005;

    function schedule() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function onMove(e: MouseEvent) {
      tx = e.clientX / window.innerWidth;
      ty = e.clientY / window.innerHeight;
      inside = true;
      schedule();
    }

    function tick() {
      raf = 0;
      const dx = tx - cx;
      const dy = ty - cy;
      cx += dx * 0.05;
      cy += dy * 0.05;
      const el = glowRef.current;
      if (el) {
        el.style.setProperty("--gx", `${cx * 100}%`);
        el.style.setProperty("--gy", `${cy * 100}%`);
        el.style.opacity = inside ? "1" : "0.5";
      }
      if (Math.abs(dx) > IDLE_EPSILON || Math.abs(dy) > IDLE_EPSILON) {
        raf = requestAnimationFrame(tick);
      }
    }
    window.addEventListener("mousemove", onMove);
    schedule();
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none opacity-50 transition-opacity duration-400 bg-[radial-gradient(520px_circle_at_var(--gx,50%)_var(--gy,40%),color-mix(in_oklab,var(--color-accent)_14%,transparent),color-mix(in_oklab,var(--color-accent)_4%,transparent)_40%,transparent_70%)]"
    />
  );
}
