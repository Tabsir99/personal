"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  SECTIONS,
  BACKGROUND_PLANES,
} from "@/components/portfolio/sections-data";

interface SectionRect {
  id: string;
  top: number;
  height: number;
}

interface AppVisualState {
  vh: number;
  pinTop: number;
  pinHeight: number;
  pinSteps: number;
  sections: SectionRect[];
  cur: string;
  raf: number;
  targetY: number;
  currentY: number;
  smoothing: boolean;
}

// Lerp factor — lower = slower/silkier.
const LERP = 0.025;
// Below this pixel delta we snap the animation closed (higher = shorter trail).
const SNAP = 1;

export function ScrollIsland() {
  const path = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    const bar = document.getElementById("rail-bar");
    const dot = document.getElementById("rail-dot");
    const pin = document.querySelector<HTMLElement>("[data-pin-steps]");

    const state: AppVisualState = {
      vh: innerHeight,
      pinTop: 0,
      pinHeight: 0,
      pinSteps: parseInt(pin?.dataset.pinSteps ?? "4"),
      sections: [],
      cur: "",
      raf: 0,
      targetY: scrollY,
      currentY: scrollY,
      smoothing: false,
    };

    const ioReveal = new IntersectionObserver(
      (es) => {
        for (const e of es)
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            ioReveal.unobserve(e.target);
          }
      },
      { threshold: 0.4, rootMargin: "0px 0px -10% 0px" },
    );

    const ro = new ResizeObserver(() => measure(state, pin));
    ro.observe(document.body);

    document
      .querySelectorAll<HTMLElement>(
        "[data-reveal],[data-reveal-stagger],[data-reveal-words]",
      )
      .forEach((el) => ioReveal.observe(el));

    measure(state, pin);
    document.fonts?.ready.then(() => measure(state, pin)).catch(() => {});

    function tick() {
      state.raf = 0;
      if (state.smoothing) {
        const diff = state.targetY - state.currentY;
        if (Math.abs(diff) < SNAP) {
          state.currentY = state.targetY;
          state.smoothing = false;
          window.scrollTo({ top: state.currentY, behavior: "instant" });
        } else {
          state.currentY += diff * LERP;
          state.raf = requestAnimationFrame(tick);
          window.scrollTo({ top: state.currentY, behavior: "instant" });
        }
      }
      const y = state.smoothing ? state.currentY : scrollY;

      if (path === "/")
        Object.entries(BACKGROUND_PLANES).forEach(
          ([plane, factor]) =>
            (document.getElementById(plane)!.style.transform =
              `translate3d(0,${y * factor}px,0)`),
        );

      // Active section + rail progress, both keyed on viewport top (y). The
      // active section is the one whose [top, top+height) contains y; intra
      // hits 1 exactly when the next section becomes active, so the dot
      // moves smoothly across boundaries.
      const N = state.sections.length;
      let curIdx = -1;
      for (let k = 0; k < N; k++) {
        const next = state.sections[k + 1];
        if (state.sections[k].top <= y && (!next || next.top > y)) {
          curIdx = k;
          break;
        }
      }
      if (curIdx >= 0) {
        const s = state.sections[curIdx];
        if (s.id !== state.cur) {
          state.cur = s.id;
          root.dataset.activeSection = s.id;
          document
            .querySelectorAll<HTMLElement>("[data-nav]")
            .forEach((n) =>
              n.classList.toggle("is-active", n.dataset.nav === s.id),
            );
        }
        if (N > 1) {
          const intra = Math.min(
            1,
            Math.max(0, (y - s.top) / Math.max(1, s.height)),
          );
          const rp = Math.min(1, (curIdx + intra) / (N - 1));
          if (bar) bar.style.transform = `scaleY(${rp})`;
          if (dot) dot.style.transform = `translateY(${rp * 100}%)`;
        }
      }

      // Pin uses absolute doc top so reload-mid-pin doesn't clamp p to 1.
      if (state.pinHeight > state.vh) {
        const p = Math.min(
          1,
          Math.max(0, (y - state.pinTop) / (state.pinHeight - state.vh)),
        );
        const i = Math.min(state.pinSteps - 1, (p * state.pinSteps) | 0);
        pin?.style.setProperty("--pin-step", "" + i);
        pin?.style.setProperty(
          "--pin-sub",
          (p * state.pinSteps - i).toFixed(3),
        );
      }
    }

    const onScroll = () => {
      if (!state.smoothing) {
        state.targetY = scrollY;
        state.currentY = scrollY;
      }
      state.raf ||= requestAnimationFrame(tick);
    };

    tick();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ioReveal.disconnect();
      ro.disconnect();
      removeEventListener("scroll", onScroll);
      if (state.raf) cancelAnimationFrame(state.raf);
    };
  }, [path]);
  return null;
}

function measure(state: AppVisualState, pin: HTMLElement | null) {
  state.vh = innerHeight;
  const y = scrollY;

  if (pin) {
    const r = pin.getBoundingClientRect();
    state.pinTop = r.top + y;
    state.pinHeight = r.height;
  }

  state.sections = [];
  for (const { id } of SECTIONS) {
    const el = document.getElementById(id);
    if (el)
      state.sections.push({
        id,
        top: el.getBoundingClientRect().top + y,
        height: el.offsetHeight,
      });
  }

  // Equal-spaced ticks; ticks without a corresponding section are hidden.
  const N = state.sections.length;
  document.querySelectorAll<HTMLElement>("[data-rail-tick]").forEach((t) => {
    const i = state.sections.findIndex((s) => s.id === (t.dataset.nav ?? ""));
    t.style.display = i >= 0 ? "" : "none";
    if (i >= 0) t.style.top = `${(i / Math.max(1, N - 1)) * 100}%`;
  });
}
