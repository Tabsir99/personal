"use client";

import { useEffect } from "react";

export default function ScriptLoader() {
  useEffect(() => {
    const skillContainer = document.querySelector(".skills") as HTMLElement;
    let flipTimer: NodeJS.Timeout;
    const skillContainerFunction = (event: Event) => {
      const target = event.target as HTMLElement;
      const skillCard = target?.closest(".skillCard");
      if (!skillCard) return;

      const flippedCard = skillContainer.querySelector(".skillCard.flip");

      if (flippedCard && flippedCard !== skillCard) {
        clearTimeout(flipTimer);
        flippedCard.classList.remove("flip");
      }

      skillCard.classList.toggle("flip");

      if (skillCard.classList.contains("flip")) {
        flipTimer = setTimeout(() => {
          skillCard.classList.remove("flip");
          clearTimeout(flipTimer);
        }, 6000);
      } else {
        clearTimeout(flipTimer);
      }
    };
    skillContainer.addEventListener("click", skillContainerFunction);

    const vh = (window.innerHeight * 0.01).toFixed(2);
    document.documentElement.style.setProperty("--vh", `${vh}px`);
    const resizeHandlerFunction = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    window.addEventListener("resize", resizeHandlerFunction);

    return () => {
      skillContainer.removeEventListener("click", skillContainerFunction);
      window.removeEventListener("resize", resizeHandlerFunction);
    };
  }, []);

  return null;
}
