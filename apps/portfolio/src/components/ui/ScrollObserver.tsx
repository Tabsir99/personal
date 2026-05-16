"use client";

import { useEffect } from "react";

export const ScrollAnimationObserver = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // @ts-expect-error - target is HTMLElement
          if (entry.isIntersecting && !entry.target.dataset.animated) {
            const target = entry.target as HTMLElement;

            if (target.dataset.countup) {
              target.dataset.animated = "true";

              const end = parseInt(target.dataset.countup);
              const suffix = target.dataset.suffix || "";
              const duration = 2000;
              const steps = 60;
              const increment = end / steps;
              const stepTime = duration / steps;

              let current = 0;
              const timer = setInterval(() => {
                current += increment;
                if (current >= end) {
                  target.textContent = end + suffix;
                  clearInterval(timer);
                } else {
                  target.textContent = Math.floor(current) + suffix;
                }
              }, stepTime);
            }

            if (target.dataset.fadein) {
              target.dataset.animated = "true";
              target.classList.add("animate-fade-in-up");
            }

            if (target.dataset.progress) {
              target.dataset.animated = "true";
              target.style.width = `${target.dataset.progress}%`;
            }

            observer.unobserve(target);
          }
        });
      },
      { threshold: 0.8 },
    );

    const animatedElements = document.querySelectorAll(
      "[data-countup], [data-fadein], [data-progress]",
    );
    animatedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
};
