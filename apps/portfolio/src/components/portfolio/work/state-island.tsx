"use client";
import { useEffect, useRef } from "react";

/* Writes data-* + --work-active / --work-still on the section.
   Never re-renders — siblings react via CSS selectors. */
export function WorkStateIsland() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const section = ref.current?.closest(
      "[data-work-section]",
    ) as HTMLElement | null;
    if (!section) return;
    const projects = section.querySelectorAll<HTMLElement>(
      "[data-work-proj-idx]",
    );
    let active = 0;
    let still = 0;
    let transitTimer: ReturnType<typeof setTimeout> | null = null;

    function setActive(i: number) {
      if (i === active) return;
      active = i;
      still = 0;
      section!.dataset.workActive = String(i);
      section!.dataset.workStill = "0";
      section!.style.setProperty("--work-active", String(i));
      section!.style.setProperty("--work-still", "0");
      section!.dataset.workTransit = "1";
      projects.forEach((el, j) => {
        el.inert = j !== i;
      });
      if (transitTimer) clearTimeout(transitTimer);
      transitTimer = setTimeout(() => {
        section!.dataset.workTransit = "0";
      }, 620);
    }

    function setStill(j: number) {
      if (j === still) return;
      still = j;
      section!.dataset.workStill = String(j);
      section!.style.setProperty("--work-still", String(j));
    }

    function onPoint(e: Event) {
      const t = e.target as HTMLElement;
      const row = t.closest<HTMLElement>("[data-work-row-idx]");
      if (row)
        setActive(Number(row.getAttribute("data-work-row-idx")));
      const thumb = t.closest<HTMLElement>("[data-work-thumb-idx]");
      if (thumb)
        setStill(Number(thumb.getAttribute("data-work-thumb-idx")));
    }
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Enter" && e.key !== " ") return;
      const t = e.target as HTMLElement;
      const row = t.closest<HTMLElement>("[data-work-row-idx]");
      if (row) {
        e.preventDefault();
        setActive(Number(row.getAttribute("data-work-row-idx")));
      }
    }

    projects.forEach((el, j) => {
      el.inert = j !== 0;
    });
    section.addEventListener("mouseover", onPoint);
    section.addEventListener("focusin", onPoint);
    section.addEventListener("click", onPoint);
    section.addEventListener("keydown", onKey);
    return () => {
      section.removeEventListener("mouseover", onPoint);
      section.removeEventListener("focusin", onPoint);
      section.removeEventListener("click", onPoint);
      section.removeEventListener("keydown", onKey);
      if (transitTimer) clearTimeout(transitTimer);
    };
  }, []);
  return <div ref={ref} hidden aria-hidden="true" />;
}
