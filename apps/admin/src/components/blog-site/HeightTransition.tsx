"use client";

import * as React from "react";

export default function HeightTransition({
  show,
  duration = 220,
  className = "",
  innerClassName = "",
  children,
}: {
  show: boolean;
  duration?: number;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`grid ease-out ${className}`}
      style={{
        gridTemplateRows: show ? "1fr" : "0fr",
        opacity: show ? 1 : 0,
        transitionProperty: "grid-template-rows, opacity",
        transitionDuration: `${duration}ms`,
      }}
      aria-hidden={!show || undefined}
    >
      <div className={`overflow-hidden ${innerClassName}`}>{children}</div>
    </div>
  );
}
