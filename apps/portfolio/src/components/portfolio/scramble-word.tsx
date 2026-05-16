"use client";
import { useState, useEffect, useRef } from "react";

/* ===== Scramble Word =====
   Text-scramble effect that cycles through a list of words.
   Each character settles into the next target glyph in turn — feels like
   a glitch / re-resolve animation. Used to call attention to the hero hook word. */
export function ScrambleWord({
  words,
  hold = 2200,
  charDelay = 38,
}: {
  words: string[];
  hold?: number;
  charDelay?: number;
}) {
  const [idx, setIdx] = useState(0);
  const [display, setDisplay] = useState(words[0] || "");
  const lastSettledRef = useRef(words[0] || "");

  useEffect(() => {
    if (!words || words.length < 2) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const chars = "!<>-_/[]{}=+*^?#$%&@";
    const from = lastSettledRef.current;
    const to = words[idx];
    const len = Math.max(from.length, to.length);
    const queue: { from: string; to: string; start: number; end: number }[] =
      [];
    for (let i = 0; i < len; i++) {
      const start = Math.floor(Math.random() * 10);
      const end = start + 10 + Math.floor(Math.random() * 14);
      queue.push({ from: from[i] || " ", to: to[i] || " ", start, end });
    }

    let frame = 0;
    const tick = () => {
      if (cancelled) return;
      let out = "";
      let complete = 0;
      for (const item of queue) {
        if (frame >= item.end) {
          complete++;
          out += item.to;
        } else if (frame >= item.start) {
          out += chars[Math.floor(Math.random() * chars.length)];
        } else {
          out += item.from;
        }
      }
      setDisplay(out);
      if (complete === queue.length) {
        lastSettledRef.current = to;
        timers.push(
          setTimeout(() => {
            if (!cancelled) setIdx((p) => (p + 1) % words.length);
          }, hold),
        );
      } else {
        frame++;
        timers.push(setTimeout(tick, charDelay));
      }
    };
    // Small initial hold so the first word reads before scrambling
    timers.push(setTimeout(tick, idx === 0 ? hold : 0));

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [idx]);

  return (
    <span className="scramble-word" aria-live="polite">
      {display}
    </span>
  );
}
