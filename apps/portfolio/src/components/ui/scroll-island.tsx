"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { BACKGROUND_PLANES } from "@/components/portfolio/sections-data";

export function ScrollIsland() {
  const pathname = usePathname();
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
  }, [pathname]);

  const SCROLL_EASE = 0.08; // gap covered per frame. higher = settles fast / stops when you stop · lower = floaty, keeps gliding after you stop
  const SETTLE_PX = 0.4; // snap to target inside this gap — kills the end-of-travel crawl
  const LINE_STEP_PX = 30; // px per line for wheels reporting in line mode (deltaMode 1)

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let current = scrollY,
      target = current,
      raf = 0;
    const max = () => document.documentElement.scrollHeight - innerHeight;
    const loop = () => {
      current += (target - current) * SCROLL_EASE;
      if (Math.abs(target - current) < SETTLE_PX) current = target;
      scrollTo(0, current);
      raf = current === target ? 0 : requestAnimationFrame(loop);
    };
    const onWheel = (e: WheelEvent) => {
      if (
        e.ctrlKey ||
        (e.target as Element | null)?.closest?.("[data-native-scroll]")
      )
        return;
      e.preventDefault();
      if (!raf) target = scrollY;
      const d = e.deltaMode ? e.deltaY * LINE_STEP_PX : e.deltaY;
      target = Math.max(0, Math.min(max(), target + d));
      raf ||= requestAnimationFrame(loop);
    };
    addEventListener("wheel", onWheel, { passive: false });
    return () => {
      removeEventListener("wheel", onWheel);
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
