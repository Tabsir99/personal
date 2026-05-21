"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  SECTIONS,
  BACKGROUND_PLANES,
} from "@/components/portfolio/sections-data";

interface AppVisualState {
  vh: number;
  docH: number;
  pinRect: DOMRect | null;
  pinSteps: number;
  cur: string;
  raf: number;
}

export function ScrollIsland() {
  const path = usePathname();
  useEffect(() => {
    const root = document.documentElement;

    const bar = document.getElementById("rail-bar");
    const dot = document.getElementById("rail-dot");
    const pin = document.querySelector<HTMLElement>("[data-pin-steps]");

    const state: AppVisualState = {
      vh: innerHeight,
      docH: 0,
      pinRect: pin?.getBoundingClientRect() ?? null,
      pinSteps: parseInt(pin?.dataset.pinSteps ?? "4"),
      cur: "",
      raf: 0,
    };

    const ioActive = new IntersectionObserver(
      (es) => {
        for (const e of es)
          if (e.isIntersecting && e.target.id !== state.cur) {
            state.cur = e.target.id;
            root.dataset.activeSection = state.cur;
            document
              .querySelectorAll<HTMLElement>("[data-nav]")
              .forEach((n) =>
                n.classList.toggle("is-active", n.dataset.nav === state.cur),
              );
          }
      },
      { rootMargin: "0px 0px -80% 0px" },
    );

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

    const ro = new ResizeObserver(() => measure(state));
    ro.observe(document.body);

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) ioActive.observe(el);
    });

    document
      .querySelector(".open-notion-doc")
      ?.querySelectorAll<HTMLElement>(":where(h2,h3,h4)[id]")
      .forEach((el) => ioActive.observe(el));
    document
      .querySelectorAll<HTMLElement>(
        "[data-reveal],[data-reveal-stagger],[data-reveal-words]",
      )
      .forEach((el) => ioReveal.observe(el));
    document.fonts?.ready.then(() => measure(state)).catch(() => {});

    function tick() {
      state.raf = 0;
      const y = scrollY;

      Object.entries(BACKGROUND_PLANES).forEach(
        ([plane, factor]) =>
          (document.getElementById(plane)!.style.transform =
            `translate3d(0,${y * factor}px,0)`),
      );

      const s = state.docH ? y / state.docH : 0;

      if (bar) bar.style.transform = `scaleY(${s})`;
      if (dot) dot.style.transform = `translateY(${s * 100}%)`;

      if (state.pinRect && state.pinRect.height > state.vh) {
        const { height, top } = state.pinRect;
        const p = Math.min(1, Math.max(0, (y - top) / (height - state.vh)));
        const i = Math.min(state.pinSteps - 1, (p * state.pinSteps) | 0);

        pin?.style.setProperty("--pin-step", "" + i);
        pin?.style.setProperty(
          "--pin-sub",
          (p * state.pinSteps - i).toFixed(3),
        );
      }
    }

    const onScroll = () => (state.raf ||= requestAnimationFrame(tick));

    tick();

    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ioActive.disconnect();
      ioReveal.disconnect();
      ro.disconnect();
      removeEventListener("scroll", onScroll);
      if (state.raf) cancelAnimationFrame(state.raf);
    };
  }, [path]);
  return null;
}

function measure(state: AppVisualState) {
  state.vh = innerHeight;

  const total = document.documentElement.scrollHeight;
  state.docH = Math.max(0, total - state.vh);
  const y = scrollY;

  const updates: Array<{ t: HTMLElement; top: number }> = [];
  SECTIONS.forEach(({ id }) => {
    const s = document.getElementById(id);
    const t = document.querySelector<HTMLElement>(
      `[data-rail-tick][data-nav="${id}"]`,
    );
    if (s && t)
      updates.push({
        t,
        top: ((s.getBoundingClientRect().top + y) / total) * 100,
      });
  });

  for (const { t, top } of updates) t.style.top = `${top}%`;
}
