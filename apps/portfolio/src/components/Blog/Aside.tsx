"use client";

import * as React from "react";
import type {
  CurrentlyBuilding,
  NowReadingItem,
} from "@tabsircg/schemas/site";

export default function Aside({
  nowReading,
  currentlyBuilding,
}: {
  nowReading: NowReadingItem[];
  currentlyBuilding: CurrentlyBuilding;
}) {
  const hasReading = nowReading.length > 0;
  const hasBuilding =
    !!currentlyBuilding.code || !!currentlyBuilding.body;
  if (!hasReading && !hasBuilding) return null;

  return <AsideBody nowReading={nowReading} currentlyBuilding={currentlyBuilding} hasReading={hasReading} hasBuilding={hasBuilding} />;
}

function AsideBody({
  nowReading,
  currentlyBuilding,
  hasReading,
  hasBuilding,
}: {
  nowReading: NowReadingItem[];
  currentlyBuilding: CurrentlyBuilding;
  hasReading: boolean;
  hasBuilding: boolean;
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

  const onDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = { sx: e.clientX, sy: e.clientY, ox: drag.x, oy: drag.y };
  };

  return (
    <aside className="aside">
      {hasReading && (
        <div
          className="sticker"
          style={{
            transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.rot}deg)`,
          }}
          onMouseDown={onDown}
        >
          <div className="sticker__tape sticker__tape--l" />
          <div className="sticker__tape sticker__tape--r" />
          <div className="sticker__title mono">// now reading</div>
          <ul className="sticker__list">
            {nowReading.map((b, i) => (
              <li key={i}>
                <span className="sticker__check" />
                <div>
                  <div className="sticker__book">{b.title}</div>
                  {b.author && (
                    <div className="sticker__author mono">{b.author}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="sticker__foot mono">drag me &lt;3</div>
        </div>
      )}

      {hasBuilding && (
        <div className="card-mini">
          <div className="card-mini__title">currently building</div>
          <div className="card-mini__body">
            {currentlyBuilding.code && (
              <>
                <code className="mono">{currentlyBuilding.code}</code>{" "}
              </>
            )}
            {currentlyBuilding.body}
          </div>
          {currentlyBuilding.linkHref && (
            <a
              className="card-mini__link mono"
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
