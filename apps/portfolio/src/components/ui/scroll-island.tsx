"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { BACKGROUND_PLANES } from "@/components/portfolio/sections-data";

// Sections are discovered from the DOM. Covers: page sections (`<section id>`),
// the contact footer (`<footer id="contact">`), and blog post headings rendered
// by DocRenderer under `.open-notion-doc`.
const SECTION_SELECTOR =
  "section[id], footer[id], .open-notion-doc :is(h2, h3, h4)[id]";

// Match `scroll-padding-top: 20%` in globals.css so clicked anchors land on a
// section that's immediately active.
const ACTIVE_THRESHOLD = 0.2;

interface Section {
  id: string;
  top: number;
}

interface State {
  vh: number;
  pinTop: number;
  pinHeight: number;
  pinSteps: number;
  sections: Section[];
  cur: string;
  lastStep: number;
  raf: number;
}

export function ScrollIsland() {
  const path = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    const pin = document.querySelector<HTMLElement>("[data-pin-steps]");
    const navNodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-nav]"),
    );
    const planes: { el: HTMLElement; factor: number }[] = [];

    for (const [id, factor] of Object.entries(BACKGROUND_PLANES)) {
      const el = document.getElementById(id);
      if (el) planes.push({ el, factor });
    }

    const state: State = {
      vh: innerHeight,
      pinTop: 0,
      pinHeight: 0,
      pinSteps: Number(pin?.dataset.pinSteps ?? "4"),
      sections: [],
      cur: "",
      lastStep: -1,
      raf: 0,
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

    let measureRaf = 0;
    const ro = new ResizeObserver(() => {
      measureRaf ||= requestAnimationFrame(() => {
        measureRaf = 0;
        measure();
      });
    });
    ro.observe(document.body);

    document
      .querySelectorAll<HTMLElement>(
        "[data-reveal],[data-reveal-stagger],[data-reveal-words]",
      )
      .forEach((el) => ioReveal.observe(el));

    document.fonts?.ready.then(() => measure()).catch(() => {});

    function measure() {
      state.vh = innerHeight;
      const y = scrollY;

      if (pin) {
        const r = pin.getBoundingClientRect();
        state.pinTop = r.top + y;
        state.pinHeight = r.height;
      }

      state.sections = [];
      for (const el of document.querySelectorAll<HTMLElement>(
        SECTION_SELECTOR,
      )) {
        state.sections.push({
          id: el.id,
          top: el.getBoundingClientRect().top + y,
        });
      }
      state.sections.sort((a, b) => a.top - b.top);
    }

    function tick() {
      state.raf = 0;
      const y = scrollY;

      for (const { el, factor } of planes) {
        el.style.transform = `translate3d(0,${y * factor}px,0)`;
      }

      const padTop = state.vh * ACTIVE_THRESHOLD;
      const s = state.sections.findLast((sec) => sec.top - padTop <= y);
      if (s && s.id !== state.cur) {
        state.cur = s.id;
        root.dataset.activeSection = s.id;
        for (const n of navNodes) {
          n.classList.toggle("is-active", n.dataset.nav === s.id);
        }
      }

      if (pin && state.pinHeight > state.vh) {
        const p = Math.min(
          1,
          Math.max(0, (y - state.pinTop) / (state.pinHeight - state.vh)),
        );
        const i = Math.min(state.pinSteps - 1, (p * state.pinSteps) | 0);
        if (i !== state.lastStep) {
          state.lastStep = i;
          pin.style.setProperty("--pin-step", String(i));
        }
        pin.style.setProperty("--pin-sub", (p * state.pinSteps - i).toFixed(3));
      }
    }

    const onScroll = () => {
      state.raf ||= requestAnimationFrame(tick);
    };

    tick();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ioReveal.disconnect();
      ro.disconnect();
      removeEventListener("scroll", onScroll);
      if (state.raf) cancelAnimationFrame(state.raf);
      if (measureRaf) cancelAnimationFrame(measureRaf);
    };
  }, [path]);
  return null;
}
