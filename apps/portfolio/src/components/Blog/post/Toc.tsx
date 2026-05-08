"use client";

import * as React from "react";
import type { TocItem } from "@open-notion/serializers";

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

    const scroller = document.getElementById("root") ?? document.scrollingElement;
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
    return () => {
      document.body.style.overflow = prev;
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
    xs.map((it) => (
      <li
        key={it.id}
        className={`toc__item toc__item--l${it.level} ${
          active === it.id ? "is-active" : ""
        }`}
      >
        <a href={`#${it.id}`} onClick={(e) => onJump(e, it.id)}>
          <span className="toc__bullet" aria-hidden="true" />
          <span className="toc__text">{it.text}</span>
        </a>
        {it.children.length > 0 && (
          <ul className="toc__sublist">{renderItems(it.children)}</ul>
        )}
      </li>
    ));

  return (
    <>
      <button
        type="button"
        className="toc__launcher mono"
        aria-expanded={drawerOpen}
        aria-controls="toc-panel"
        onClick={() => setDrawerOpen((v) => !v)}
      >
        <span className="toc__launcher-pip" aria-hidden="true" />
        on this page
        <span className="toc__launcher-count">({total})</span>
        <span className="toc__launcher-arrow" aria-hidden="true">
          {drawerOpen ? "×" : "↓"}
        </span>
      </button>

      <div
        className={`toc__scrim ${drawerOpen ? "is-open" : ""}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      <nav
        id="toc-panel"
        className={`toc ${drawerOpen ? "is-open" : ""}`}
        aria-label="Table of contents"
      >
        <div className="toc__head">
          <span className="toc__head-label mono">// on this page</span>
          <span className="toc__head-pct mono" aria-live="polite">
            {String(Math.round(pct * 100)).padStart(2, "0")}%
          </span>
        </div>
        <div className="toc__rail" aria-hidden="true">
          <span className="toc__rail-fill" style={{ height: `${pct * 100}%` }} />
        </div>
        <ul className="toc__list">{renderItems(items)}</ul>
      </nav>
    </>
  );
}
