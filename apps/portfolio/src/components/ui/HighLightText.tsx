"use client";
import React from "react";

export const HighlightText = ({ text }: { text: string }) => {
  const handleMouseMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <span className="spotlight-text inline-block py-4 -my-4" onMouseMove={handleMouseMove}>
      {text}
    </span>
  );
};
