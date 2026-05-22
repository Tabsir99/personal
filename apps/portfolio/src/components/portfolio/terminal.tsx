"use client";
import { useState, useEffect, useRef } from "react";

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
  startDelay = 0,
}: {
  title: string;
  lines: TerminalLine[];
  /* Step-0 only. Keep in sync with rise-in `delay-*` so typing doesn't
     advance while the terminal is hidden behind the intro overlay. */
  startDelay?: number;
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

    const initialWait = step === 0 ? startDelay : line.delayBefore || 300;
    after(initialWait, () => {
      if (cancelled) return;
      if (typedRef.current) typedRef.current.textContent = "";
      if (respRef.current) respRef.current.textContent = "";
      setPhase("cmd");

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
  }, [step, lines, startDelay]);

  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden rounded-lg border border-phosphor/10 font-mono
      opacity-0 translate-y-4 animate-rise-in delay-6300
      shadow-md shadow-phosphor/10"
    >
      <div className="flex items-center justify-between px-[14px] py-[10px] border-b border-phosphor/15 bg-black/20">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-accent/80"></span>
          <span className="size-2 rounded-full bg-field-gray/40"></span>
          <span className="size-2 rounded-full bg-phosphor/85"></span>
        </div>
        <div className="text-xxs tracking-[0.22em] uppercase text-muted/75">
          {title}
        </div>
        <div className="text-xxs tracking-[0.22em] text-muted/40">v0.4</div>
      </div>

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
