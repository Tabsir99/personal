"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

/* ===== Animated Terminal =====
   Translucent right-column companion to the hero headline.
   Cycles through a short fake shell session: type command, reveal response, idle, next.
*/

const TITLE = "tabsir@field-station";
const LINES: { command: string; response: string; delayBefore: number }[] = [
  {
    command: "whoami",
    response: "full-stack engineer · 2y in production · javascript by default",
    delayBefore: 400,
  },
  {
    command: "cat stack.txt",
    response:
      "react · node · typescript · postgres\nnext.js · prisma · docker · aws",
    delayBefore: 500,
  },
  {
    command: "ls ./recent-work",
    response:
      "✓ field-survey.app    [shipped]\n✓ contour-cli         [shipped]\n· terminal-os         [in flight]",
    delayBefore: 500,
  },
  {
    command: "echo $STATUS",
    response: "available for work — Dhaka, BD",
    delayBefore: 500,
  },
];

export function Terminal() {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState("");
  const [responseShown, setResponseShown] = useState("");
  const [phase, setPhase] = useState<"cmd" | "resp" | "idle">("cmd");

  useEffect(() => {
    const line = LINES[step % LINES.length];

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const after = (ms: number, fn: () => void) => {
      const t = setTimeout(fn, ms);
      timers.push(t);
      return t;
    };

    after(line.delayBefore || 300, () => {
      if (cancelled) return;
      setTyped("");
      setResponseShown("");
      setPhase("cmd");

      // Type the command character by character.
      let i = 0;
      const tick = () => {
        if (cancelled) return;
        if (i <= line.command.length) {
          setTyped(line.command.slice(0, i));
          i += 1;
          after(38 + Math.random() * 60, tick);
        } else {
          setPhase("resp");
          // Reveal response gradually.
          let j = 0;
          const respTick = () => {
            if (cancelled) return;
            if (j <= line.response.length) {
              setResponseShown(line.response.slice(0, j));
              j += 1;
              after(8 + Math.random() * 14, respTick);
            } else {
              setPhase("idle");
              after(1700, () => {
                if (cancelled) return;
                setStep((s) => s + 1);
              });
            }
          };
          respTick();
        }
      };
      tick();
    });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [step]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-phosphor/20 font-mono",
        "bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-ink-3)_45%,transparent),color-mix(in_oklab,var(--color-ink)_55%,transparent))]",
        "[backdrop-filter:blur(14px)_saturate(140%)] [-webkit-backdrop-filter:blur(14px)_saturate(140%)]",
        "shadow-[0_0_60px_color-mix(in_oklab,var(--color-phosphor)_5%,transparent),0_30px_80px_color-mix(in_oklab,black_45%,transparent),inset_0_1px_0_color-mix(in_oklab,white_3%,transparent)]",
        "opacity-0 translate-y-4 animate-term-fade-up",
      )}
      aria-hidden="true"
    >
      {/* Chrome */}
      <div className="flex items-center justify-between px-[14px] py-[10px] border-b border-phosphor/15 bg-black/20">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent/80"></span>
          {/* Warm field-gray (#a8a18b) — no token, matches the temp prototype's literal */}
          <span className="w-2 h-2 rounded-full bg-[rgba(168,161,139,0.40)]"></span>
          <span className="w-2 h-2 rounded-full bg-phosphor/85 animate-term-pulse-dot"></span>
        </div>
        <div className="text-[10px] tracking-[0.22em] uppercase text-muted/75">
          {TITLE}
        </div>
        <div className="text-[10px] tracking-[0.22em] text-muted/40">v0.4</div>
      </div>

      {/* Body */}
      <div className="relative min-h-[232px] px-5 pt-4 pb-5 text-[12.5px] leading-[1.7]">
        <div className="relative z-1">
          <div className="text-muted/65">
            <span className="text-phosphor">tabsir</span>
            <span className="opacity-55">@</span>
            <span className="text-accent">field</span>
            <span className="opacity-55">:~$ </span>
            <span className="text-cream">{typed}</span>
            {phase === "cmd" && (
              <span className="inline-block align-text-bottom ml-0.5 mb-px w-1.5 h-3.5 bg-phosphor animate-term-cursor-blink"></span>
            )}
          </div>

          {responseShown && (
            <pre className="mt-1.5 whitespace-pre-wrap text-cream/85 font-mono text-[12.5px] leading-[1.7]">
              {responseShown}
            </pre>
          )}

          {phase === "idle" && (
            <div className="text-muted/65 mt-1">
              <span className="text-phosphor">tabsir</span>
              <span className="opacity-55">@</span>
              <span className="text-accent">field</span>
              <span className="opacity-55">:~$ </span>
              <span className="inline-block align-text-bottom ml-0.5 mb-px w-1.5 h-3.5 bg-phosphor animate-term-cursor-blink"></span>
            </div>
          )}
        </div>

        {/* Decorative scanline */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07] overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute left-0 right-0 h-px bg-[linear-gradient(90deg,transparent,var(--color-phosphor),transparent)] animate-term-scan"></div>
        </div>
      </div>
    </div>
  );
}
