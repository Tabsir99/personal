"use client";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* Inline video player for the Voices testimonial.
   Owns the frame (scale-on-scroll via .voices-frame CSS), the video,
   the poster overlay, and the custom controls. Video mounts with
   preload="metadata" so the browser fetches a real frame for the
   thumbnail; we seek 1.8s in to skip a black opening. */

const DURATION_GUESS = 73;

const BASE_CONTROL_BTN =
  "font-mono tracking-[0.16em] uppercase text-cream-2 px-2.5 py-1.5 border border-line rounded-[2px] bg-transparent transition-all duration-250 inline-flex items-center justify-center hover:border-accent hover:text-accent";

function ControlButton({
  onClick,
  ariaLabel,
  className,
  children,
}: {
  onClick: () => void;
  ariaLabel: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      className={cn(BASE_CONTROL_BTN, className)}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

function fmtTime(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function VoicesPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrubRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(DURATION_GUESS);

  function start() {
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {
        v.muted = true;
        setMuted(true);
        v.play().catch(() => {});
      });
    }
    setStarted(true);
  }
  function toggle() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }
  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }
  function seekFromEvent(e: React.MouseEvent<HTMLDivElement>) {
    const v = videoRef.current;
    const el = scrubRef.current;
    if (!v || !el || !duration) return;
    const r = el.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    v.currentTime = p * duration;
    setTime(v.currentTime);
  }
  function seekBy(deltaSec: number) {
    const v = videoRef.current;
    if (!v || !duration) return;
    v.currentTime = Math.min(duration, Math.max(0, v.currentTime + deltaSec));
    setTime(v.currentTime);
  }
  function onScrubKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      seekBy(-5);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      seekBy(5);
    } else if (e.key === "Home") {
      e.preventDefault();
      const v = videoRef.current;
      if (v) {
        v.currentTime = 0;
        setTime(0);
      }
    } else if (e.key === "End") {
      e.preventDefault();
      const v = videoRef.current;
      if (v && duration) {
        v.currentTime = duration;
        setTime(duration);
      }
    }
  }
  function onLoaded(e: React.SyntheticEvent<HTMLVideoElement>) {
    const v = e.currentTarget;
    setDuration(v.duration || DURATION_GUESS);
    if (!started && v.duration > 2) v.currentTime = 1.8;
  }

  const pct = duration > 0 ? (time / duration) * 100 : 0;

  return (
    <>
      <div
        className={cn(
          "voices-frame relative w-full aspect-video bg-black border border-line rounded-[4px] overflow-hidden",
          "origin-[center_60%] transition-[border-color] duration-500 will-change-transform hover:border-accent/45",
        )}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full block object-cover bg-black cursor-pointer"
          src={src}
          playsInline
          preload="metadata"
          onClick={started ? toggle : start}
          onLoadedMetadata={onLoaded}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />

        {!started && (
          <button
            className="group absolute inset-0 border-0 p-0 m-0 bg-transparent cursor-pointer block text-left z-2"
            onClick={start}
            aria-label="Play testimonial"
          >
            <div
              className="absolute inset-0 [background:linear-gradient(180deg,color-mix(in_oklab,black_18%,transparent)_0%,color-mix(in_oklab,black_45%,transparent)_100%),radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--color-ink)_0%,transparent)_35%,color-mix(in_oklab,var(--color-ink)_55%,transparent)_100%)]"
              aria-hidden="true"
            ></div>
            <div className="absolute left-[clamp(20px,2.5vw,40px)] bottom-[clamp(20px,2.5vw,36px)] font-serif italic text-[clamp(18px,1.6vw,24px)] text-cream tracking-[-0.005em] leading-none [text-shadow:0_1px_12px_color-mix(in_oklab,black_50%,transparent)]">
              Eric &middot; Postchart
            </div>
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center w-[clamp(72px,7vw,104px)] h-[clamp(72px,7vw,104px)] rounded-full bg-accent/95 text-ink transition-[scale,background] duration-300 ease-soft [box-shadow:0_0_0_1px_color-mix(in_oklab,var(--color-accent)_50%,transparent),0_16px_32px_-10px_color-mix(in_oklab,black_60%,transparent)] group-hover:scale-[1.06] group-hover:bg-accent"
              aria-hidden="true"
            >
              <span className="text-[clamp(22px,2vw,30px)] leading-none ml-1">▶</span>
            </div>
            <div className="absolute right-[clamp(20px,2.5vw,40px)] bottom-[clamp(22px,2.5vw,38px)] font-mono text-[12px] tracking-[0.16em] text-cream-2 [text-shadow:0_1px_12px_color-mix(in_oklab,black_50%,transparent)]">
              01:13
            </div>
          </button>
        )}
      </div>

      {started && (
        <div className="flex items-center gap-4 px-4 py-3 mt-3.5 border border-line bg-ink-2/60 rounded-[3px] opacity-0 animate-voices-fade max-[1100px]:flex-wrap max-[1100px]:gap-2.5 max-[1100px]:p-2.5">
          <ControlButton
            onClick={toggle}
            ariaLabel={playing ? "Pause" : "Play"}
            className="text-[12px] min-w-9"
          >
            {playing ? "❚❚" : "▶"}
          </ControlButton>
          <div className="inline-flex items-baseline gap-1 font-mono text-[11px] tracking-[0.12em] text-cream min-w-24 whitespace-nowrap">
            <span>{fmtTime(time)}</span>
            <span className="text-line">/</span>
            <span className="text-muted">{fmtTime(duration)}</span>
          </div>
          <div
            ref={scrubRef}
            className="group/scrub relative flex-1 h-[26px] cursor-pointer flex items-center max-[1100px]:-order-1 max-[1100px]:basis-full focus-visible:outline-2 focus-visible:outline-accent"
            onClick={seekFromEvent}
            onKeyDown={onScrubKey}
            role="slider"
            tabIndex={0}
            aria-label="Seek video"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={time}
            aria-valuetext={fmtTime(time)}
          >
            <div className="w-full h-0.5 bg-line rounded-[1px]"></div>
            <div
              className="absolute left-0 top-1/2 h-0.5 bg-accent -translate-y-1/2 pointer-events-none"
              style={{ width: `${pct}%` }}
            ></div>
            <div
              className="absolute top-1/2 w-2.5 h-2.5 rounded-full bg-phosphor -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-150 group-hover/scrub:scale-[1.3]"
              style={{ left: `${pct}%` }}
            ></div>
          </div>
          <ControlButton
            onClick={toggleMute}
            ariaLabel={muted ? "Unmute" : "Mute"}
            className="text-[11px] min-w-16"
          >
            {muted ? "MUTED" : "AUDIO"}
          </ControlButton>
        </div>
      )}
    </>
  );
}
