"use client";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/* =====================================================================
   Voices — Video testimonial section
   --------------------------------------------------------------------
   Plays inline. No modal, no overlay, no scan lines, no pulsing rings.

   The frame scales up from 0.86 → 1.0 as the section moves into the
   viewport, then locks at 1.0 once it's well-positioned. Click the
   poster to start the video in place; custom controls (play/pause,
   timecode, scrubber, audio) sit beneath the frame.
   --------------------------------------------------------------------- */

const VIDEO_URL =
  "https://media.tabsircg.com/portfolio/testimonials/client-testimonial-ERIC-Postchart.mov";
const DURATION_GUESS = 73; // 1:13 — replaced by real duration on loadedmetadata

function fmtTime(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function Voices() {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrubRef = useRef<HTMLDivElement>(null);

  const [started, setStarted] = useState(false); // user clicked play
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(DURATION_GUESS);
  const [loaded, setLoaded] = useState(false);
  void loaded;

  /* Scroll-into-view scale: the frame grows from 0.72 to 1.0 as the
     section moves through the viewport. The animation tracks the
     section's TOP edge — starts when it touches the bottom of the
     viewport, completes when it reaches ~20% from the top, and locks
     at 1.0 from there on. */
  useEffect(() => {
    let rafId = 0;
    function update() {
      rafId = 0;
      const section = sectionRef.current;
      const frame = frameRef.current;
      if (!section || !frame) return;

      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;

      // Animation window: section top crosses from vh (bottom edge)
      // down to vh * 0.2 (well into view).
      const startTop = vh;
      const endTop = vh * 0.2;
      let p;
      if (rect.top >= startTop) p = 0;
      else if (rect.top <= endTop) p = 1;
      else p = (startTop - rect.top) / (startTop - endTop);

      // easeOutCubic — feels organic, gets to 1.0 fast at the end
      const eased = 1 - Math.pow(1 - p, 3);
      const scale = 0.72 + eased * 0.28;
      frame.style.transform = `scale(${scale.toFixed(4)})`;
    }
    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  function start() {
    const v = videoRef.current;
    if (v) {
      try {
        v.currentTime = 0;
      } catch (e) {}
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

  // Once metadata is loaded, seek a couple seconds in so the visible
  // still isn't the (usually black) opening frame.
  function onLoaded(e: React.SyntheticEvent<HTMLVideoElement>) {
    const v = e.currentTarget;
    setDuration(v.duration || DURATION_GUESS);
    setLoaded(true);
    if (!started && v.duration > 2) {
      try {
        v.currentTime = 1.8;
      } catch (err) {}
    }
  }

  const pct = duration > 0 ? (time / duration) * 100 : 0;

  return (
    <section
      id="voices"
      className="relative pt-[180px] pb-[160px] max-[1100px]:pt-[130px] max-[1100px]:pb-[120px]"
      data-screen-label="06 Voices"
      ref={sectionRef}
    >
      <span
        className={cn(
          "pointer-events-none absolute right-8 z-[5] max-w-[160px] text-right font-serif italic text-[13px] tracking-[0.005em] leading-[1.35] text-accent opacity-60 max-[1100px]:hidden before:content-[''] before:block before:w-3.5 before:h-px before:bg-accent before:opacity-45 before:mb-2 before:ml-auto",
          "top-[260px]",
        )}
      >
        one minute,
        <br />
        one client.
      </span>

      <div className="container">
        <header className="grid grid-cols-[0.9fr_1fr] items-end gap-20 mb-16 max-[1100px]:grid-cols-1 max-[1100px]:gap-7">
          <h2
            className={cn(
              "font-serif font-normal leading-[0.96] tracking-[-0.02em] font-features-['liga','kern']",
              "text-[clamp(48px,6.4vw,96px)] leading-[0.98]",
              "[&_em]:italic [&_em]:text-accent",
            )}
          >
            <em>In their</em>
            <br />
            own words.
          </h2>
          <p className="text-base leading-[1.6] text-cream-2 max-w-[540px] pb-3 max-[1100px]:pb-0">
            A short walkthrough from Eric at Postchart — the project was a
            custom AI-featured Facebook Page management system with a bulk
            scheduler. Press play.
          </p>
        </header>

        {/* The frame — scales on scroll. The <video> is mounted from
            the start with preload="metadata" so the browser can fetch
            a real frame to use as the thumbnail; we seek to ~1.8s once
            metadata loads to skip past any black opening frame. The
            poster overlay sits on top until the user clicks play. */}
        <div
          className="relative w-full aspect-[16/9] bg-black border border-line rounded-[4px] overflow-hidden scale-[0.72] [transform-origin:center_60%] transition-[border-color] duration-500 ease-[ease] will-change-transform hover:border-accent/45"
          ref={frameRef}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full block object-cover bg-black cursor-pointer"
            src={VIDEO_URL}
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
              className="group absolute inset-0 border-0 p-0 m-0 bg-transparent cursor-pointer block text-left z-[2]"
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
                <span className="text-[clamp(22px,2vw,30px)] leading-none ml-1">
                  ▶
                </span>
              </div>
              <div className="absolute right-[clamp(20px,2.5vw,40px)] bottom-[clamp(22px,2.5vw,38px)] font-mono text-[12px] tracking-[0.16em] text-cream-2 [text-shadow:0_1px_12px_color-mix(in_oklab,black_50%,transparent)]">
                01:13
              </div>
            </button>
          )}
        </div>

        {/* Controls — visible only once the video is started. */}
        {started && (
          <div className="flex items-center gap-4 px-4 py-3 mt-3.5 border border-line bg-ink-2/60 rounded-[3px] opacity-0 animate-voices-fade max-[1100px]:flex-wrap max-[1100px]:gap-2.5 max-[1100px]:p-2.5">
            <button
              className="font-mono text-[12px] tracking-[0.16em] uppercase text-cream-2 px-2.5 py-1.5 border border-line rounded-[2px] bg-transparent transition-all duration-[250ms] ease-[ease] inline-flex items-center justify-center min-w-9 hover:border-accent hover:text-accent"
              onClick={toggle}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? "❚❚" : "▶"}
            </button>

            <div className="inline-flex items-baseline gap-1 font-mono text-[11px] tracking-[0.12em] text-cream min-w-24 whitespace-nowrap">
              <span>{fmtTime(time)}</span>
              <span className="text-line">/</span>
              <span className="text-muted">{fmtTime(duration)}</span>
            </div>

            <div
              ref={scrubRef}
              className="group/scrub relative flex-1 h-[26px] cursor-pointer flex items-center max-[1100px]:order-[-1] max-[1100px]:basis-full"
              onClick={seekFromEvent}
              role="slider"
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-valuenow={time}
            >
              <div className="w-full h-0.5 bg-line rounded-[1px]"></div>
              <div
                className="absolute left-0 top-1/2 h-0.5 bg-accent -translate-y-1/2 pointer-events-none"
                style={{ width: `${pct}%` }}
              ></div>
              <div
                className="absolute top-1/2 w-2.5 h-2.5 rounded-full bg-phosphor -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-150 ease-[ease] group-hover/scrub:scale-[1.3]"
                style={{ left: `${pct}%` }}
              ></div>
            </div>

            <button
              className="font-mono text-[11px] tracking-[0.16em] uppercase text-cream-2 px-2.5 py-1.5 border border-line rounded-[2px] bg-transparent transition-all duration-[250ms] ease-[ease] inline-flex items-center justify-center min-w-16 hover:border-accent hover:text-accent"
              onClick={toggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? "MUTED" : "AUDIO"}
            </button>
          </div>
        )}

        {/* Caption row — always visible under the frame. */}
        <div className="flex items-center flex-wrap gap-3.5 mt-[18px] font-mono text-[11px] tracking-[0.16em] uppercase text-muted max-[1100px]:gap-2.5">
          <span className="font-serif italic text-[17px] tracking-normal normal-case text-cream">
            Eric
          </span>
          <span className="text-muted"> · Postchart</span>
          <span
            className="inline-block w-[18px] h-px bg-line"
            aria-hidden="true"
          ></span>
          <a
            className="inline-flex items-center gap-1.5 text-accent pb-0.5 border-b border-b-transparent transition-[gap,border-color,color] duration-[250ms] ease-[ease] hover:gap-2.5 hover:border-b-accent/50 hover:text-cream"
            href="#work"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById("work");
              if (el)
                window.scrollTo({ top: el.offsetTop - 40, behavior: "smooth" });
            }}
          >
            See the project<span> ↗</span>
          </a>
          <span className="flex-1 max-[1100px]:hidden"></span>
          <span className="inline-flex items-center gap-2 text-cream-2">
            <span className="inline-flex items-center justify-center w-[14px] h-[14px] rounded-full bg-phosphor text-ink text-[8px] font-bold leading-none">
              ✓
            </span>
            Verified on Upwork
          </span>
        </div>

        {/* Pull-quote — placeholder text for now, swap with the line from the video */}
        <blockquote className="mt-14 grid grid-cols-[auto_1fr] gap-x-6 items-start max-w-[900px] max-[1100px]:grid-cols-1">
          <span
            className="font-serif text-[96px] leading-[0.7] text-accent opacity-55 pt-1.5 max-[1100px]:text-[56px] max-[1100px]:pb-0"
            aria-hidden="true"
          >
            &ldquo;
          </span>
          <p
            className={cn(
              "font-serif italic text-[clamp(22px,2.2vw,32px)] leading-[1.32] tracking-[-0.015em] text-cream [text-wrap:balance]",
              "[&_em]:not-italic [&_em]:font-mono [&_em]:text-[0.55em] [&_em]:tracking-[0.18em] [&_em]:uppercase [&_em]:text-accent [&_em]:bg-accent/8 [&_em]:px-2 [&_em]:py-0.5 [&_em]:rounded-[2px] [&_em]:align-[0.18em] [&_em]:mr-1.5",
            )}
          >
            <em>[Placeholder]</em> &nbsp;Drop in the strongest line from
            Eric&rsquo;s walkthrough here — the one sentence that sells the
            relationship.
          </p>
        </blockquote>
      </div>
    </section>
  );
}
