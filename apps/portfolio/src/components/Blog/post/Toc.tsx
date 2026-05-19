"use client";

import * as React from "react";
import type { TocItem } from "@open-notion/serializers";

const ITEM_ANCHOR_BASE =
  "relative flex items-baseline gap-2.5 py-1.5 pr-0 pl-1.5 no-underline [transition:color_200ms_ease,transform_200ms_ease] rounded-[3px] hover:text-cream hover:translate-x-0.5";
const BULLET_BASE =
  "shrink-0 w-1.5 h-1.5 rounded-full -translate-y-px [transition:background-color_200ms_ease,box-shadow_200ms_ease,transform_200ms_ease]";

function flattenTocIds(items: TocItem[]): string[] {
  const out: string[] = [];
  const walk = (xs: TocItem[]) => {
    for (const x of xs) {
      out.push(x.id);
      if (x.children.length) walk(x.children);
    }
  };
  walk(items);
  return out;
}

export default function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = React.useState<string | null>(null);
  const [pct, setPct] = React.useState(0);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const ids = React.useMemo(() => flattenTocIds(items), [items]);
  const total = items.reduce((n, i) => n + 1 + i.children.length, 0);

  React.useEffect(() => {
    if (ids.length === 0) return;
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((e): e is HTMLElement => !!e);
    if (els.length === 0) return;

    const scroller =
      document.getElementById("root") ?? document.scrollingElement;
    if (!scroller) return;

    const ANCHOR = 100;
    const pick = () => {
      let best: { id: string; dist: number } | null = null;
      for (const el of els) {
        const top = el.getBoundingClientRect().top - ANCHOR;
        if (top <= 0 && (best === null || top > -best.dist)) {
          best = { id: el.id, dist: -top };
        }
      }
      setActive(best?.id ?? els[0].id);
    };
    pick();
    const onScroll = () => requestAnimationFrame(pick);
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);

  React.useEffect(() => {
    if (ids.length === 0) return;
    const idx = active ? ids.indexOf(active) : -1;
    setPct(idx < 0 ? 0 : (idx + 1) / ids.length);
  }, [active, ids]);

  React.useEffect(() => {
    const close = () => setDrawerOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, []);

  React.useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  if (items.length === 0) return null;

  const onJump = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const scroller =
      (document.getElementById("root") as HTMLElement | null) ??
      (document.scrollingElement as HTMLElement | null);
    if (!scroller) return;
    const elRect = el.getBoundingClientRect();
    const scRect = scroller.getBoundingClientRect();
    const top = elRect.top - scRect.top + scroller.scrollTop - 84;
    scroller.scrollTo({ top, behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
    setDrawerOpen(false);
  };

  const renderItems = (xs: TocItem[]) =>
    xs.map((it) => {
      const isActive = active === it.id;
      const anchorCls =
        (isActive ? "text-cream font-bold " : "text-muted ") +
        (it.level === 3 ? "text-xs " : "") +
        ITEM_ANCHOR_BASE;
      const bulletCls = isActive
        ? `${BULLET_BASE} bg-accent shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-accent)_22%,transparent)] scale-[1.2]`
        : `${BULLET_BASE} bg-cream/8`;
      return (
        <li key={it.id}>
          <a
            href={`#${it.id}`}
            onClick={(e) => onJump(e, it.id)}
            className={anchorCls}
          >
            <span className={bulletCls} aria-hidden="true" />
            <span className="line-clamp-2">{it.text}</span>
          </a>
          {it.children.length > 0 && (
            <ul className="list-none m-0 p-0 flex flex-col gap-1 mt-1 pl-3.5 max-xl:pl-0">
              {renderItems(it.children)}
            </ul>
          )}
        </li>
      );
    });

  const tocCls =
    "relative text-sm leading-[1.45] pl-[18px] " +
    "max-xl:fixed max-xl:left-0 max-xl:top-0 max-xl:bottom-0 max-xl:w-[min(360px,88vw)] max-xl:z-80 max-xl:bg-ink max-xl:py-7 max-xl:pr-7 max-xl:pl-8 max-xl:transition-transform max-xl:duration-320 max-xl:ease-blog max-xl:overflow-y-auto max-xl:shadow-[24px_0_40px_-20px_rgba(0,0,0,0.6)] " +
    (drawerOpen ? "max-xl:translate-x-0" : "max-xl:-translate-x-full");

  const scrimCls =
    "hidden fixed inset-0 bg-[color-mix(in_srgb,var(--color-ink)_50%,transparent)] backdrop-blur-[2px] z-70 transition-opacity duration-200 ease-out max-xl:block " +
    (drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none");

  return (
    <>
      <button
        type="button"
        className="hidden w-full items-center gap-2.5 px-4 py-3 bg-ink-2 text-cream border border-line rounded-full font-mono text-xs tracking-wide cursor-pointer transition-[background-color] duration-200 hover:bg-ink-3 max-xl:inline-flex"
        aria-expanded={drawerOpen}
        aria-controls="toc-panel"
        onClick={() => setDrawerOpen((v) => !v)}
      >
        <span
          className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-accent)_22%,transparent)] mr-1"
          aria-hidden="true"
        />
        on this page
        <span className="text-muted">({total})</span>
        <span
          className="ml-auto text-sm font-bold text-muted"
          aria-hidden="true"
        >
          {drawerOpen ? "×" : "↓"}
        </span>
      </button>

      <div
        className={scrimCls}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      <nav id="toc-panel" className={tocCls} aria-label="Table of contents">
        <div className="flex items-baseline justify-between text-xs mb-4 text-muted tracking-wider max-xl:pl-[18px]">
          <span className="font-mono">// on this page</span>
          <span
            className="font-mono text-cream font-bold bg-ink-2 px-2 py-0.5 rounded-full border border-cream/8 tabular-nums"
            aria-live="polite"
          >
            {String(Math.round(pct * 100)).padStart(2, "0")}%
          </span>
        </div>
        <div
          className="absolute left-0 top-8 bottom-0 w-0.5 bg-cream/8 rounded-xs max-xl:left-8"
          aria-hidden="true"
        >
          <span
            className="absolute left-0 top-0 w-full bg-accent rounded-xs transition-[height] duration-240 ease-blog shadow-[0_0_8px_color-mix(in_srgb,var(--color-accent)_50%,transparent)]"
            style={{ height: `${pct * 100}%` }}
          />
        </div>
        <ul className="list-none m-0 p-0 flex flex-col gap-1 max-xl:pl-0">
          {renderItems(items)}
        </ul>
      </nav>
    </>
  );
}
