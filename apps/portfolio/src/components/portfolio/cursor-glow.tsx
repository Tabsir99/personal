"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/* Page-wide cursor-following accent glow.
   Fixed across the viewport; tracks the cursor anywhere on the page,
   not just within a single section. Sits at z-0 with Atmosphere (which
   it visually overlays) and below <main> (z-1) so it stays behind all
   content. Idles at the upper-center when the cursor leaves the page. */
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

    function onMove(e: MouseEvent) {
      tx = e.clientX / window.innerWidth;
      ty = e.clientY / window.innerHeight;
      inside = true;
    }

    function tick() {
      // Magnetic follow — smaller factor = more lag behind the cursor.
      // 0.04 ≈ ~25 frames to close half the gap (vs ~9 frames at 0.08).
      cx += (tx - cx) * 0.05;
      cy += (ty - cy) * 0.05;
      const el = glowRef.current;
      if (el) {
        el.style.setProperty("--gx", `${cx * 100}%`);
        el.style.setProperty("--gy", `${cy * 100}%`);
        el.style.opacity = inside ? "1" : "0.5";
      }
      raf = requestAnimationFrame(tick);
    }
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      className={cn(
        "fixed inset-0 z-0 pointer-events-none opacity-50 transition-opacity duration-400 ease-[ease]",
        "bg-[radial-gradient(520px_circle_at_var(--gx,50%)_var(--gy,40%),color-mix(in_oklab,var(--color-accent)_14%,transparent),color-mix(in_oklab,var(--color-accent)_4%,transparent)_40%,transparent_70%)]",
      )}
    />
  );
}
