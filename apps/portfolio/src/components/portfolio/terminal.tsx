"use client";
import { useState, useEffect, useRef } from "react";

/* ===== Animated Terminal =====
   Translucent right-column companion to the hero headline.
   Cycles through a short fake shell session: type command, reveal response, idle, next.
*/

export type TerminalLine = {
  command: string;
  response: string;
  delayBefore: number;
};

const PROMPT_PREFIX = (
  <>
    <span className="text-phosphor">tabsir</span>
    <span className="opacity-55">@</span>
    <span className="text-accent">field</span>
    <span className="opacity-55">:~$ </span>
  </>
);

const BLINK_CURSOR = (
  <span className="inline-block align-text-bottom ml-0.5 mb-px w-1.5 h-3.5 bg-phosphor animate-blink"></span>
);

export function Terminal({
  title,
  lines,
}: {
  title: string;
  lines: TerminalLine[];
}) {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"cmd" | "resp" | "idle">("cmd");
  const typedRef = useRef<HTMLSpanElement>(null);
  const respRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const line = lines[step % lines.length];

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const after = (ms: number, fn: () => void) => {
      const t = setTimeout(fn, ms);
      timers.push(t);
      return t;
    };

    after(line.delayBefore || 300, () => {
      if (cancelled) return;
      if (typedRef.current) typedRef.current.textContent = "";
      if (respRef.current) respRef.current.textContent = "";
      setPhase("cmd");

      // Type the command character by character.
      let i = 0;
      const tick = () => {
        if (cancelled) return;
        if (i <= line.command.length) {
          if (typedRef.current)
            typedRef.current.textContent = line.command.slice(0, i);
          i += 1;
          after(38 + Math.random() * 60, tick);
        } else {
          setPhase("resp");
          // Reveal response gradually.
          let j = 0;
          const respTick = () => {
            if (cancelled) return;
            if (j <= line.response.length) {
              if (respRef.current)
                respRef.current.textContent = line.response.slice(0, j);
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
  }, [step, lines]);

  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden rounded-lg border border-phosphor/20 font-mono bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-ink-3)_45%,transparent),color-mix(in_oklab,var(--color-ink)_55%,transparent))] [backdrop-filter:blur(14px)_saturate(140%)] [-webkit-backdrop-filter:blur(14px)_saturate(140%)] shadow-[0_0_60px_color-mix(in_oklab,var(--color-phosphor)_5%,transparent),0_30px_80px_color-mix(in_oklab,black_45%,transparent),inset_0_1px_0_color-mix(in_oklab,white_3%,transparent)] opacity-0 translate-y-4 animate-rise-in delay-[850ms]"
    >
      {/* Chrome */}
      <div className="flex items-center justify-between px-[14px] py-[10px] border-b border-phosphor/15 bg-black/20">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-accent/80"></span>
          <span className="size-2 rounded-full bg-field-gray/40"></span>
          <span className="size-2 rounded-full bg-phosphor/85 animate-pulse"></span>
        </div>
        <div className="text-xxs tracking-[0.22em] uppercase text-muted/75">
          {title}
        </div>
        <div className="text-xxs tracking-[0.22em] text-muted/40">v0.4</div>
      </div>

      {/* Body */}
      <div className="relative min-h-[232px] px-5 pt-4 pb-5 text-xs leading-[1.7]">
        <div className="relative z-1">
          <div className="text-muted/65">
            {PROMPT_PREFIX}
            <span ref={typedRef} className="text-cream"></span>
            {phase === "cmd" && BLINK_CURSOR}
          </div>

          <pre
            ref={respRef}
            className="mt-1.5 whitespace-pre-wrap text-cream/85 font-mono text-xs leading-[1.7] empty:hidden"
          />

          {phase === "idle" && (
            <div className="text-muted/65 mt-1">
              {PROMPT_PREFIX}
              {BLINK_CURSOR}
            </div>
          )}
        </div>

        {/* Decorative scanline */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07] overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute left-0 right-0 h-px bg-[linear-gradient(90deg,transparent,var(--color-phosphor),transparent)] animate-scan"></div>
        </div>
      </div>
    </div>
  );
}
