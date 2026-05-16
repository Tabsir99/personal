"use client";
import { useState, useEffect } from "react";

/* ===== Animated Terminal =====
   Translucent right-column companion to the hero headline.
   Cycles through a short fake shell session: type command, reveal response, idle, next.
*/

type TerminalLine = {
  command: string;
  response: string;
  delayBefore: number;
};

type TerminalData = {
  title: string;
  lines: TerminalLine[];
};

const defaultTerminalData: TerminalData = {
  title: 'tabsir@field-station',
  lines: [
    {
      command: 'whoami',
      response: 'full-stack engineer · 2y in production · javascript by default',
      delayBefore: 400,
    },
    {
      command: 'cat stack.txt',
      response: 'react · node · typescript · postgres\nnext.js · prisma · docker · aws',
      delayBefore: 500,
    },
    {
      command: 'ls ./recent-work',
      response: '✓ field-survey.app    [shipped]\n✓ contour-cli         [shipped]\n· terminal-os         [in flight]',
      delayBefore: 500,
    },
    {
      command: 'echo $STATUS',
      response: 'available for work — Dhaka, BD',
      delayBefore: 500,
    },
  ],
};

export function Terminal({ terminal = defaultTerminalData }: { terminal?: TerminalData } = {}) {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState('');
  const [responseShown, setResponseShown] = useState('');
  const [phase, setPhase] = useState<'cmd' | 'resp' | 'idle'>('cmd'); // 'cmd' | 'resp' | 'idle'
  const lines = terminal?.lines || [];

  useEffect(() => {
    if (!lines.length) return;
    const line = lines[step % lines.length];

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const after = (ms: number, fn: () => void) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

    after(line.delayBefore || 300, () => {
      if (cancelled) return;
      setTyped('');
      setResponseShown('');
      setPhase('cmd');

      // Type the command character by character.
      let i = 0;
      const tick = () => {
        if (cancelled) return;
        if (i <= line.command.length) {
          setTyped(line.command.slice(0, i));
          i += 1;
          after(38 + Math.random() * 60, tick);
        } else {
          setPhase('resp');
          // Reveal response gradually.
          let j = 0;
          const respTick = () => {
            if (cancelled) return;
            if (j <= line.response.length) {
              setResponseShown(line.response.slice(0, j));
              j += 1;
              after(8 + Math.random() * 14, respTick);
            } else {
              setPhase('idle');
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
    <div className="term-card" aria-hidden="true">
      {/* Chrome */}
      <div className="term-chrome">
        <div className="term-dots">
          <span className="term-dot term-dot--r"></span>
          <span className="term-dot term-dot--y"></span>
          <span className="term-dot term-dot--g"></span>
        </div>
        <div className="term-chrome-title">{terminal?.title || 'tabsir@field-station'}</div>
        <div className="term-chrome-ver">v0.4</div>
      </div>

      {/* Body */}
      <div className="term-pane">
        <div className="term-content">
          <div className="term-line">
            <span className="term-user">tabsir</span>
            <span className="term-dim">@</span>
            <span className="term-host">field</span>
            <span className="term-dim">:~$ </span>
            <span className="term-input">{typed}</span>
            {phase === 'cmd' && <span className="term-cursor"></span>}
          </div>

          {responseShown && (
            <pre className="term-response">{responseShown}</pre>
          )}

          {phase === 'idle' && (
            <div className="term-line term-line--idle">
              <span className="term-user">tabsir</span>
              <span className="term-dim">@</span>
              <span className="term-host">field</span>
              <span className="term-dim">:~$ </span>
              <span className="term-cursor"></span>
            </div>
          )}
        </div>

        {/* Decorative scanline */}
        <div className="term-scan" aria-hidden="true">
          <div className="term-scan-bar"></div>
        </div>
      </div>
    </div>
  );
}
