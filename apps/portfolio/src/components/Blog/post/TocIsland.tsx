"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function TocIsland() {
  const pathname = usePathname();

  useEffect(() => {
    const tocList = document.getElementById("toc-list");
    if (!tocList) return;

    const navMap: Record<string, HTMLAnchorElement> = Object.fromEntries(
      [...tocList.querySelectorAll<HTMLAnchorElement>("a[data-nav]")].map(
        (a) => [a.dataset.nav, a],
      ),
    );

    let activeId: string | null = null;

    const ioActive = new IntersectionObserver(
      (e) => {
        const win = e
          .filter((x) => x.isIntersecting)
          .sort(
            (a, b) => b.boundingClientRect.top - a.boundingClientRect.top,
          )[0];
        if (!win) return; // nothing in the slice → keep last active

        const id = win.target.id;
        if (id === activeId) return;
        if (activeId) navMap[activeId]?.classList.remove("is-active");
        navMap[id]?.classList.add("is-active");
        activeId = id;
      },
      { rootMargin: "-20% 0px -78% 0px" },
    );

    document
      .querySelectorAll(".open-notion-doc :is(h2,h3,h4)[id]")
      .forEach((el) => ioActive.observe(el));

    return () => ioActive.disconnect();
  }, [pathname]);

  return null;
}
