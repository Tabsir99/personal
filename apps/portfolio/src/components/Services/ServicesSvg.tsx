"use client";
import React from "react";

export default function ServicesSVG() {
  function Animate(
    pipePath: SVGPathElement,
    snake: SVGPathElement,
    duration = 1500,
    delay = 2000
  ) {
    const snakeLength = 100;
    const numSegments = 20;
    const pathLength = pipePath.getTotalLength();
    const precalculatedPoints: [number, number][] = [];
    const snakeSegmentLength = snakeLength / numSegments;
    const totalPoints = Math.ceil(
      (pathLength + snakeLength) / snakeSegmentLength
    );

    for (let i = 0; i <= totalPoints; i++) {
      const distance = Math.min(i * snakeSegmentLength, pathLength);
      const point = pipePath.getPointAtLength(distance);
      precalculatedPoints.push([point.x, point.y]);
    }

    function updateSnake(progress: number) {
      progress = easeInOutCubic(progress);
      const headIndex = Math.floor(progress * totalPoints);
      const snakePoints = [];
      let drawingLine = true;

      for (let i = 0; i < numSegments; i++) {
        const index = (headIndex - i + totalPoints) % totalPoints;

        if (index > headIndex && drawingLine) {
          snake.setAttribute("d", `M ${snakePoints.join(" L ")}`);
          snakePoints.length = 0;
          drawingLine = false;
        }

        snakePoints.push(precalculatedPoints[index]);
      }

      if (snakePoints.length > 0) {
        const currentPath = snake.getAttribute("d") || "";
        const newSection = `M ${snakePoints.join(" L ")}`;
        snake.setAttribute(
          "d",
          currentPath ? `${currentPath} ${newSection}` : newSection
        );
      }
    }

    function easeInOutCubic(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    let lastTime = 0;
    let delayStart: number | null = null;

    let animationFrame: number;
    function animate(currentTime: number) {
      if (!lastTime) lastTime = currentTime;
      const deltaTime = currentTime - lastTime;

      if (deltaTime >= 16) {
        const totalCycleTime = duration + delay;
        const cycleTime = currentTime % totalCycleTime;

        if (cycleTime < duration) {
          // Regular animation
          const progress = cycleTime / duration;
          snake.setAttribute("d", "");
          updateSnake(progress);
          delayStart = null;
        } else {
          // Delay period
          if (!delayStart) delayStart = currentTime;
          if (currentTime - delayStart >= delay) {
            snake.setAttribute("d", "");
          }
        }

        lastTime = currentTime;
      }

      animationFrame = requestAnimationFrame(animate);
    }

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }

  React.useEffect(() => {
    if (window.innerWidth < 1070) {
      return;
    }

    const cleanUpAnimations: (() => void)[] = [];

    const pipePath1 = document.getElementById(
      "pipePath1"
    ) as SVGPathElement | null;
    const pipePath2 = document.getElementById(
      "pipePath2"
    ) as SVGPathElement | null;
    const pipePath3 = document.getElementById(
      "pipePath3"
    ) as SVGPathElement | null;

    const snake1 = document.getElementById("snake1") as SVGPathElement | null;

    const snake2 = document.getElementById("snake2") as SVGPathElement | null;
    const snake3 = document.getElementById("snake3") as SVGPathElement | null;

    if (pipePath1 && pipePath2 && pipePath3 && snake1 && snake2 && snake3) {
      cleanUpAnimations.push(Animate(pipePath1, snake1));
      cleanUpAnimations.push(Animate(pipePath2, snake2));
      cleanUpAnimations.push(Animate(pipePath3, snake3));
    }

    return () => {
      cleanUpAnimations.forEach((fn) => fn());
    };
  }, []);

  return (
    <>
      <svg id="servicesSvg" width={1000} height={200} viewBox="0 0 1000 200">
        <defs>
          <filter id="box-shadow">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="5"
              floodColor="white"
              floodOpacity="1"
            />
          </filter>
        </defs>
        <path
          id="pipePath1"
          d="M420,0 L420,100 L10,100 L10,200 "
          strokeWidth={2}
          stroke="#333"
          fill="transparent"
        ></path>
        <path
          id="pipePath2"
          d="M580,0 L580,100 L990,100 L990,200 "
          strokeWidth={2}
          stroke="#333"
          fill="transparent"
        ></path>
        <path
          id="pipePath3"
          d="M500,0 L500,200 "
          strokeWidth={2}
          stroke="#333"
          fill="transparent"
        ></path>

        <path
          id="snake1"
          d=""
          fill="transparent"
          strokeWidth={2}
          stroke="green"
          filter="url(#box-shadow)"
        />
        <path
          id="snake2"
          d=""
          fill="transparent"
          strokeWidth={2}
          filter="url(#box-shadow)"
          stroke="#3b82f6"
        />
        <path
          id="snake3"
          d=""
          fill="transparent"
          strokeWidth={2}
          filter="url(#box-shadow)"
          stroke="#a855f7"
        />
      </svg>
    </>
  );
}
