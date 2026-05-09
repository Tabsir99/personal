"use client";
import React, { useEffect, useRef, useState } from "react";

export const HighlightText = ({ text }: { text: string }) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const span = spanRef.current;
    if (isHovering || !span) return;

    const { width, height } = span.getBoundingClientRect();

    const currentX =
      parseFloat(span.style.getPropertyValue("--mouse-x")) || width / 2;
    const currentY =
      parseFloat(span.style.getPropertyValue("--mouse-y")) || height / 2;

    let startTime = Date.now();
    const transitionDuration = 500;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const blendFactor = Math.min(elapsed / transitionDuration, 1);

      timeRef.current += 0.01;

      const targetX = width / 2 + Math.sin(timeRef.current) * (width / 3);
      const targetY =
        height / 2 + Math.cos(timeRef.current * 1.3) * (height / 2);

      const x = currentX + (targetX - currentX) * blendFactor;
      const y = currentY + (targetY - currentY) * blendFactor;

      span.style.setProperty("--mouse-x", `${x}px`);
      span.style.setProperty("--mouse-y", `${y}px`);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isHovering]);

  const handleMouseMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <span
      ref={spanRef}
      className="spotlight-text inline-block py-4 -my-4"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {text}
    </span>
  );
};
