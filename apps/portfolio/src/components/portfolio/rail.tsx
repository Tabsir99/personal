"use client";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    function onScroll() {
      const docH = document.documentElement.scrollHeight;
      // fill + cursor track scroll position, using the SAME divisor as tick positions
      setProgress((window.scrollY / docH) * 100);
      const y = window.scrollY + window.innerHeight * 0.35;
      let cur = 0;
      SECTIONS.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (el && el.offsetTop <= y) cur = i;
      });
      setActive(cur);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="rail" aria-hidden="true">
      <div className="rail-track"></div>
      <div className="rail-endcap top"></div>
      <div className="rail-endcap bot"></div>
      <div className="rail-fill" style={{ height: `${progress}%` }}></div>
      {positions.map((p, i) => (
        <div
          key={i}
          className={`rail-tick ${i === active ? "active" : ""} ${i < active ? "past" : ""}`}
          style={{ top: `${p}%` }}
        >
          <span className="rail-tick-label">{SECTIONS[i].label}</span>
        </div>
      ))}
      <div className="rail-cursor" style={{ top: `${progress}%` }}></div>
    </div>
  );
}
