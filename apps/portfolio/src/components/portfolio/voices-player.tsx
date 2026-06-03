"use client";
import { useRef, useState } from "react";
import { videoSourceType, type VideoSource } from "@tabsircg/schemas/portfolio";
import { cn, loadVideoSources } from "@/lib/utils";
import { RichText } from "@/components/ui/rich-text";

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = String(Math.floor(s / 60)).padStart(2, "0");
  const sec = String(Math.floor(s % 60)).padStart(2, "0");
  return `${m}:${sec}`;
};

export function VoicesPlayer({
  sources,
  label,
  className,
}: {
  sources: VideoSource[];
  label?: string;
  className?: string;
}) {
  const v = useRef<HTMLVideoElement>(null);
  const seek = useRef<HTMLInputElement>(null);
  const time = useRef<HTMLSpanElement>(null);

  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [dur, setDur] = useState(0);

  const toggle = () =>
    v.current?.paused ? v.current.play() : v.current?.pause();

  const start = () => {
    const el = v.current;
    if (el) {
      // Safety net: load deferred sources now if the observer hasn't yet.
      loadVideoSources(el);
      el.currentTime = 0;
      el.play().catch(() => {
        el.muted = true;
        setMuted(true);
        el.play().catch(() => {});
      });
    }
    setStarted(true);
  };

  return (
    <div
      className={cn(
        "group relative w-full h-full bg-black border border-line rounded-sm overflow-hidden",
        className,
      )}
    >
      <video
        ref={v}
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-contain cursor-pointer"
        disablePictureInPicture
        onClick={toggle}
        onLoadedMetadata={(e) => {
          setDur(e.currentTarget.duration);
          if (!started && e.currentTarget.duration > 2)
            e.currentTarget.currentTime = 1.8;
        }}
        onTimeUpdate={(e) => {
          const ct = e.currentTarget.currentTime;
          if (seek.current) {
            seek.current.value = String(ct);
            seek.current.style.setProperty(
              "--p",
              `${(ct / (dur || 1)) * 100}%`,
            );
          }
          if (time.current) time.current.textContent = fmt(ct);
        }}
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
        }}
        onPause={() => setPlaying(false)}
      >
        {/* Deferred src (data-src) so nothing downloads until lazy-loaded; the
            browser picks the first source whose `type` it can play. */}
        {sources.map((s, i) => (
          <source
            key={i}
            data-src={s.url}
            type={videoSourceType(s) || undefined}
          />
        ))}
      </video>

      {!started && (
        <button
          onClick={start}
          aria-label={label ? `Play ${label}` : "Play video"}
          className="group/p absolute inset-0 z-20 grid place-items-center cursor-pointer"
        >
          <div className="absolute inset-0 bg-linear-to-t from-ink/60 to-transparent" />
          <span className="grid size-16 place-items-center rounded-full border border-cream/40 text-cream transition-colors group-hover/p:border-accent group-hover/p:text-accent">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="ml-0.5 size-5"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          {label && (
            <span className="absolute left-6 bottom-5 font-serif italic text-lg text-cream/90">
              <RichText text={label} />
            </span>
          )}
        </button>
      )}

      {started && (
        <div
          className={`absolute inset-x-0 bottom-0 z-10 flex items-center gap-3 px-4 py-3 bg-linear-to-t from-ink/80 to-transparent transition-opacity ${
            playing
              ? "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
              : "opacity-100"
          }`}
        >
          <button
            onClick={toggle}
            aria-label={playing ? "Pause" : "Play"}
            className="shrink-0 text-cream-2 transition-colors hover:text-accent"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
              {playing ? (
                <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
              ) : (
                <path d="M8 5v14l11-7z" />
              )}
            </svg>
          </button>

          <span
            ref={time}
            className="shrink-0 font-mono text-[11px] tabular-nums text-cream-2"
          >
            00:00
          </span>

          <input
            ref={seek}
            type="range"
            min={0}
            max={dur || 0}
            step="any"
            defaultValue={0}
            aria-label="Seek"
            onChange={(e) => {
              if (v.current) v.current.currentTime = +e.target.value;
            }}
            className="flex-1 voices-seek"
          />

          <span className="shrink-0 font-mono text-xxs tabular-nums">
            {fmt(dur)}
          </span>

          <button
            onClick={() => {
              if (!v.current) return;
              v.current.muted = !v.current.muted;
              setMuted(v.current.muted);
            }}
            aria-label={muted ? "Unmute" : "Mute"}
            className="shrink-0 text-cream-2 transition-colors hover:text-accent"
          >
            <svg viewBox="0 0 24 24" className="size-4">
              <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
              {muted ? (
                <path
                  d="M16 9.5l5 5m0-5l-5 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M16 9.5a3.5 3.5 0 010 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
