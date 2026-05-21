"use client";

import * as React from "react";
import type { CurrentlyBuilding, NowReadingItem } from "@tabsircg/schemas/site";
import { H3 } from "@/components/ui/H2";

const TAPE =
  "absolute w-20 h-6 -top-2.5 bg-[oklch(85%_0.08_90/0.5)] backdrop-blur-[2px] border border-[oklch(80%_0.05_90/0.5)]";

export default function Aside({
  nowReading,
  currentlyBuilding,
}: {
  nowReading: NowReadingItem[];
  currentlyBuilding?: CurrentlyBuilding;
}) {
  const [drag, setDrag] = React.useState({ x: 0, y: 0, rot: -7 });
  const dragging = React.useRef<{
    sx: number;
    sy: number;
    ox: number;
    oy: number;
  } | null>(null);

  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - dragging.current.sx;
      const dy = e.clientY - dragging.current.sy;
      setDrag({
        x: dragging.current.ox + dx,
        y: dragging.current.oy + dy,
        rot: -7 + dx * 0.05,
      });
    };
    const onUp = () => {
      dragging.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const hasReading = nowReading.length > 0;
  const hasBuilding = !!currentlyBuilding?.code || !!currentlyBuilding?.body;

  if (!hasReading && !hasBuilding) return null;

  const onDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = { sx: e.clientX, sy: e.clientY, ox: drag.x, oy: drag.y };
  };

  return (
    <aside className="sticky top-[120px] min-w-80 flex flex-col gap-8 max-lg:static max-lg:flex-row max-lg:flex-wrap">
      {hasReading && (
        <div
          className="relative bg-[oklch(94%_0.04_90)] text-ink pt-7 px-6 pb-5 rounded-md shadow-[0_12px_30px_-12px_rgba(0,0,0,0.7)] select-none cursor-grab transition-shadow duration-200 border border-ink/6 active:cursor-grabbing active:shadow-[0_24px_40px_-10px_rgba(0,0,0,0.8)] max-lg:flex-1 max-lg:basis-[280px]"
          style={{
            transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.rot}deg)`,
          }}
          onMouseDown={onDown}
        >
          <div className={`${TAPE} left-4 rotate-[-4deg]`} />
          <div className={`${TAPE} right-4 rotate-3`} />
          <H3 variant="widget" className="mb-3.5">// now reading</H3>
          <ul className="list-none p-0 m-0 flex flex-col gap-3.5">
            {nowReading.map((b, i) => (
              <li key={i} className="flex gap-2.5 items-start">
                <span
                  className={
                    i === 0
                      ? "shrink-0 size-4 border-[1.5px] rounded-sm mt-0.5 relative bg-accent border-accent after:content-[''] after:absolute after:left-1 after:top-px after:w-1 after:h-[9px] after:border-r-2 after:border-r-cream after:border-b-2 after:border-b-cream after:rotate-45"
                      : "shrink-0 size-4 border-[1.5px] border-ink rounded-sm mt-0.5 relative"
                  }
                />
                <div>
                  <div className="font-serif italic text-base leading-tight">
                    {b.title}
                  </div>
                  {b.author && (
                    <div className="font-mono text-xs text-muted mt-0.5">
                      {b.author}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="font-mono text-xxs text-muted mt-[18px] text-right">
            drag me &lt;3
          </div>
        </div>
      )}

      {hasBuilding && (
        <div className="bg-ink-2 border border-line py-[22px] px-5 rounded-[10px] max-lg:flex-1 max-lg:basis-[280px]">
          <H3
            variant="widget"
            className="lowercase mb-3 before:content-['//_'] before:text-accent"
          >
            currently building
          </H3>
          <div className="text-sm leading-normal text-cream-2">
            {currentlyBuilding.code && (
              <>
                <code className="font-mono bg-ink-3 px-1.5 py-px rounded-sm text-sm text-accent">
                  {currentlyBuilding.code}
                </code>{" "}
              </>
            )}
            {currentlyBuilding.body}
          </div>
          {currentlyBuilding.linkHref && (
            <a
              className="font-mono inline-block mt-3 text-xs text-cream border-b border-cream pb-px [transition:color_220ms,border-color_220ms] hover:text-accent hover:border-accent"
              href={currentlyBuilding.linkHref}
            >
              {currentlyBuilding.linkLabel || currentlyBuilding.linkHref}
            </a>
          )}
        </div>
      )}
    </aside>
  );
}
