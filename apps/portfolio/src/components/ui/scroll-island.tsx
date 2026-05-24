"use client";
import { useEffect } from "react";
import { BACKGROUND_PLANES } from "@/components/portfolio/sections-data";

export function ScrollIsland() {
  useEffect(() => {
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
    document
      .querySelectorAll<HTMLElement>(
        "[data-reveal],[data-reveal-stagger],[data-reveal-words]",
      )
      .forEach((el) => ioReveal.observe(el));

    const pin = document.querySelector<HTMLElement>("[data-pin-steps]");
    const pinSteps = pin ? Number(pin.dataset.pinSteps) : 0;
    const planes: { el: HTMLElement; factor: number }[] = [];
    for (const [id, factor] of Object.entries(BACKGROUND_PLANES)) {
      const el = document.getElementById(id);
      if (el) planes.push({ el, factor });
    }
    let raf = 0;
    let lastStep = -1;

    function tick() {
      const r = pin?.getBoundingClientRect();
      raf = 0;
      const y = scrollY;
      for (const { el, factor } of planes) {
        el.style.transform = `translate3d(0,${y * factor}px,0)`;
      }
      if (pin && r) {
        const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
        const i = Math.min(pinSteps - 1, (p * pinSteps) | 0);
        if (i !== lastStep) {
          lastStep = i;
          pin.style.setProperty("--pin-step", String(i));
        }
        pin.style.setProperty("--pin-sub", (p * pinSteps - i).toFixed(3));
      }
    }

    const onScroll = () => {
      raf ||= requestAnimationFrame(tick);
    };
    addEventListener("scroll", onScroll, { passive: true });
    tick();

    return () => {
      ioReveal.disconnect();
      removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
