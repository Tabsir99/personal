"use client";
import { useEffect, useRef } from "react";
import { loadVideoSources } from "@/lib/utils";

/* Reads the DOM once into caches, then drives data-* / CSS vars on the section;
   siblings react via CSS. Never re-renders. */
export function WorkStateIsland() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const section = ref.current?.closest<HTMLElement>("[data-work-section]");
    if (!section) return;
    const stage = section.querySelector<HTMLElement>(".work-stage");
    const projects = [
      ...section.querySelectorAll<HTMLElement>("[data-work-proj-idx]"),
    ];
    // Each preview video tagged with its project + still index; muted/looped once.
    const videos = [...section.querySelectorAll("video")].map((el) => {
      el.muted = el.loop = true;
      return {
        el,
        proj: Number(
          el.closest<HTMLElement>("[data-work-proj-idx]")?.dataset.workProjIdx,
        ),
        still: Number(
          el.closest<HTMLElement>(".work-still-media")?.dataset.workStillIdx,
        ),
      };
    });

    let active = 0;
    let still = 0;
    let inView = false;
    let transit: ReturnType<typeof setTimeout> | null = null;

    // Play only the in-view active still; pause everything else.
    const sync = () => {
      for (const v of videos)
        if (inView && v.proj === active && v.still === still) {
          loadVideoSources(v.el);
          v.el.play().catch(() => {});
        } else v.el.pause();
    };

    const setActive = (i: number) => {
      if (i === active) return;
      active = i;
      still = 0;
      section.dataset.workActive = String(i);
      section.dataset.workStill = "0";
      section.style.setProperty("--work-active", String(i));
      section.style.setProperty("--work-still", "0");
      section.dataset.workTransit = "1";
      projects.forEach((el, j) => (el.inert = j !== i));
      if (transit) clearTimeout(transit);
      transit = setTimeout(() => (section.dataset.workTransit = "0"), 620);
      sync();
    };

    const setStill = (j: number) => {
      if (j === still) return;
      still = j;
      section.dataset.workStill = String(j);
      section.style.setProperty("--work-still", String(j));
      sync();
    };

    const onPoint = (e: Event) => {
      const t = e.target as HTMLElement;
      if (e.type === "click" && t.closest("[data-work-fullscreen]")) {
        if (document.fullscreenElement) document.exitFullscreen();
        else if (stage) stage.requestFullscreen().catch(() => {});
        return;
      }
      const el = t.closest<HTMLElement>(
        "[data-work-row-idx],[data-work-thumb-idx]",
      );
      if (el?.dataset.workRowIdx != null)
        setActive(Number(el.dataset.workRowIdx));
      else if (el?.dataset.workThumbIdx != null)
        setStill(Number(el.dataset.workThumbIdx));
    };

    const onKey = (e: KeyboardEvent) => {
      const row = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-work-row-idx]",
      );
      if (row && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        setActive(Number(row.dataset.workRowIdx));
      }
    };

    projects.forEach((el, j) => (el.inert = j !== 0));

    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        sync();
      },
      { threshold: 0.1 },
    );
    io.observe(stage ?? section);

    const evs = ["mouseover", "focusin", "click"] as const;
    evs.forEach((ev) => section.addEventListener(ev, onPoint));
    section.addEventListener("keydown", onKey);
    return () => {
      io.disconnect();
      evs.forEach((ev) => section.removeEventListener(ev, onPoint));
      section.removeEventListener("keydown", onKey);
      if (transit) clearTimeout(transit);
    };
  }, []);

  return <div ref={ref} hidden aria-hidden="true" />;
}
