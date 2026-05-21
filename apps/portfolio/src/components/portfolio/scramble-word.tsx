"use client";
import { memo, useEffect, useRef } from "react";

interface ScrambleWordProps {
  words: string[];
  /** ms to hold each resolved word before scrambling to the next */
  hold?: number;
  /** total scramble duration in ms (roughly) */
  duration?: number;
  /** 0-1 — chance per frame a slot picks a new random char. Higher = more visible chaos */
  shuffleRate?: number;
  /** 0-1 — how spread out the slot start times are. 0 = all start together, 1 = fully staggered */
  stagger?: number;
  /** characters used while scrambling */
  chars?: string;
  className?: string;
}

type Slot = {
  from: string;
  to: string;
  start: number;
  end: number;
  char: string;
};

const DEFAULT_CHARS = "!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const ScrambleWord = memo(
  ({
    words,
    hold = 2500,
    duration = 1500,
    shuffleRate = 0.6,
    stagger = 0.3,
    chars = DEFAULT_CHARS,
    className = "",
  }: ScrambleWordProps) => {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
      if (!words?.length || !ref.current) return;
      const el = ref.current;

      const totalFrames = Math.max(8, Math.round(duration / 16.67));
      const startSpread = Math.max(1, Math.round(totalFrames * stagger));
      const charLife = Math.max(4, totalFrames - startSpread);

      let i = 0;
      let frame = 0;
      let queue: Slot[] = [];
      let rafId = 0;
      let timeoutId: ReturnType<typeof setTimeout>;

      const rand = () => chars[(Math.random() * chars.length) | 0];

      const update = () => {
        let out = "";
        let done = 0;
        for (let n = 0; n < queue.length; n++) {
          const q = queue[n];
          if (frame >= q.end) {
            done++;
            out += q.to;
          } else if (frame >= q.start) {
            if (!q.char || Math.random() < shuffleRate) q.char = rand();
            out += q.char;
          } else {
            out += q.from;
          }
        }
        el.textContent = out;
        if (done === queue.length) {
          timeoutId = setTimeout(next, hold);
        } else {
          frame++;
          rafId = requestAnimationFrame(update);
        }
      };

      const setText = (from: string, to: string) => {
        const len = Math.max(from.length, to.length);
        queue = [];
        for (let n = 0; n < len; n++) {
          const start = (Math.random() * startSpread) | 0;
          const end = start + ((Math.random() * charLife) | 0) + 4;
          queue.push({
            from: from[n] || "",
            to: to[n] || "",
            start,
            end,
            char: "",
          });
        }
        frame = 0;
        cancelAnimationFrame(rafId);
        update();
      };

      const next = () => {
        const from = words[i];
        i = (i + 1) % words.length;
        setText(from, words[i]);
      };

      el.textContent = words[0];
      timeoutId = setTimeout(next, words.length > 1 ? hold : 1e9);

      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(timeoutId);
      };
    }, [words, hold, duration, shuffleRate, stagger, chars]);

    return (
      <span ref={ref} className={className}>
        {words[0]}
      </span>
    );
  },
  (p, n) => {
    return (
      p.words.length === n.words.length &&
      p.hold === n.hold &&
      p.duration === n.duration &&
      p.shuffleRate === n.shuffleRate &&
      p.stagger === n.stagger &&
      p.chars === n.chars
    );
  },
);
