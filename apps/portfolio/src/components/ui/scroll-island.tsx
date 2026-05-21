"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { SECTIONS } from "@/components/portfolio/sections-data";

export function ScrollIsland() {
  const path = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    const planes = [".atm-far", ".atm-mid", ".atm-near"].map((s) =>
      document.querySelector<HTMLElement>(s),
    );
    const factors = [-0.025, -0.1, -0.2];
    const bar = document.querySelector<HTMLElement>("[data-rail-bar]");
    const dot = document.querySelector<HTMLElement>("[data-rail-dot]");
    const pin = document.querySelector<HTMLElement>("[data-pin-steps]");
    const pinSteps = +(pin?.dataset.pinSteps ?? 4);
    let vh = innerHeight,
      docH = 0,
      pinTop = 0,
      pinH = 0,
      lastY = -1,
      raf = 0,
      cur = "";

    const ioActive = new IntersectionObserver(
      (es) => {
        for (const e of es)
          if (e.isIntersecting && e.target.id !== cur) {
            cur = e.target.id;
            root.dataset.activeSection = cur;
            document
              .querySelectorAll<HTMLElement>("[data-nav]")
              .forEach((n) =>
                n.classList.toggle("is-active", n.dataset.nav === cur),
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

    function measure() {
      vh = innerHeight;
      const total = root.scrollHeight;
      docH = Math.max(0, total - vh);
      SECTIONS.forEach(({ id }) => {
        const s = document.getElementById(id);
        const t = document.querySelector<HTMLElement>(
          `[data-rail-tick][data-nav="${id}"]`,
        );
        if (s && t)
          t.style.top = `${((s.getBoundingClientRect().top + scrollY) / total) * 100}%`;
      });
      if (pin) {
        const r = pin.getBoundingClientRect();
        pinTop = r.top + scrollY;
        pinH = r.height;
      }
    }

    const ro = new ResizeObserver(measure);
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) {
        ioActive.observe(el);
        ro.observe(el);
      }
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
    document.fonts?.ready.then(measure).catch(() => {});
    function tick() {
      raf = 0;
      const y = scrollY;
      if (y === lastY) return;
      lastY = y;
      planes.forEach(
        (el, i) =>
          el && (el.style.transform = `translate3d(0,${y * factors[i]}px,0)`),
      );
      const s = `${docH ? (y / docH) * 100 : 0}%`;
      if (bar) bar.style.height = s;
      if (dot) dot.style.top = s;
      if (pin && pinH > vh) {
        const p = Math.min(1, Math.max(0, (y - pinTop) / (pinH - vh)));
        const i = Math.min(pinSteps - 1, (p * pinSteps) | 0);
        pin.style.setProperty("--pin-step", "" + i);
        pin.style.setProperty("--pin-sub", (p * pinSteps - i).toFixed(3));
      }
    }
    const onScroll = () => {
      raf ||= requestAnimationFrame(tick);
    };
    measure();
    tick();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ioActive.disconnect();
      ioReveal.disconnect();
      ro.disconnect();
      removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [path]);
  return null;
}
