"use client";
import { useState, useEffect, useRef } from "react";

const useStateV = useState;
const useEffectV = useEffect;
const useRefV = useRef;

/* =====================================================================
   Voices — Video testimonial section
   --------------------------------------------------------------------
   Plays inline. No modal, no overlay, no scan lines, no pulsing rings.

   The frame scales up from 0.86 → 1.0 as the section moves into the
   viewport, then locks at 1.0 once it's well-positioned. Click the
   poster to start the video in place; custom controls (play/pause,
   timecode, scrubber, audio) sit beneath the frame.
   --------------------------------------------------------------------- */

const VIDEO_URL = 'https://media.tabsircg.com/portfolio/testimonials/client-testimonial-ERIC-Postchart.mov';
const DURATION_GUESS = 73; // 1:13 — replaced by real duration on loadedmetadata

function fmtTime(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function Voices() {
  const sectionRef = useRefV<HTMLElement>(null);
  const frameRef = useRefV<HTMLDivElement>(null);
  const videoRef = useRefV<HTMLVideoElement>(null);
  const scrubRef = useRefV<HTMLDivElement>(null);

  const [started, setStarted] = useStateV(false);    // user clicked play
  const [playing, setPlaying] = useStateV(false);
  const [muted, setMuted] = useStateV(false);
  const [time, setTime] = useStateV(0);
  const [duration, setDuration] = useStateV(DURATION_GUESS);
  const [loaded, setLoaded] = useStateV(false);
  void loaded;

  /* Scroll-into-view scale: the frame grows from 0.72 to 1.0 as the
     section moves through the viewport. The animation tracks the
     section's TOP edge — starts when it touches the bottom of the
     viewport, completes when it reaches ~20% from the top, and locks
     at 1.0 from there on. */
  useEffectV(() => {
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
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  function start() {
    const v = videoRef.current;
    if (v) {
      try { v.currentTime = 0; } catch (e) {}
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
      try { v.currentTime = 1.8; } catch (err) {}
    }
  }

  const pct = duration > 0 ? (time / duration) * 100 : 0;

  return (
    <section id="voices" className="voices" data-screen-label="06 Voices" ref={sectionRef}>
      <span className="section-tag">/ 03a — Voices</span>
      <span className="margin-note" style={{ top: '260px' }}>one minute,<br/>one client.</span>

      <div className="container">
        <header className="voices-header">
          <h2 className="voices-title display">
            <em>In their</em><br/>own words.
          </h2>
          <p className="voices-blurb">
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
        <div className="voices-frame" ref={frameRef}>
          <video
            ref={videoRef}
            className="voices-video"
            src={VIDEO_URL}
            playsInline
            preload="metadata"
            onClick={started ? toggle : start}
            onLoadedMetadata={onLoaded}
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)} />

          {!started &&
          <button className="voices-overlay" onClick={start} aria-label="Play testimonial">
              <div className="voices-overlay-veil" aria-hidden="true"></div>
              <div className="voices-overlay-name">Eric &middot; Postchart</div>
              <div className="voices-overlay-play" aria-hidden="true">
                <span className="voices-overlay-play-icon">▶</span>
              </div>
              <div className="voices-overlay-time">01:13</div>
            </button>
          }
        </div>

        {/* Controls — visible only once the video is started. */}
        {started &&
        <div className="voices-controls">
            <button className="voices-ctl voices-ctl--play" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? '❚❚' : '▶'}
            </button>

            <div className="voices-time">
              <span className="voices-time-cur">{fmtTime(time)}</span>
              <span className="voices-time-sep">/</span>
              <span className="voices-time-tot">{fmtTime(duration)}</span>
            </div>

            <div
            ref={scrubRef}
            className="voices-scrub"
            onClick={seekFromEvent}
            role="slider"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={time}>

              <div className="voices-scrub-track"></div>
              <div className="voices-scrub-fill" style={{ width: `${pct}%` }}></div>
              <div className="voices-scrub-thumb" style={{ left: `${pct}%` }}></div>
            </div>

            <button className="voices-ctl voices-ctl--mute" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
              {muted ? 'MUTED' : 'AUDIO'}
            </button>
          </div>
        }

        {/* Caption row — always visible under the frame. */}
        <div className="voices-meta">
          <span className="voices-meta-name">Eric</span>
          <span className="voices-meta-co"> · Postchart</span>
          <span className="voices-meta-sep" aria-hidden="true"></span>
          <a
            className="voices-meta-link"
            href="#work"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('work');
              if (el) window.scrollTo({ top: el.offsetTop - 40, behavior: 'smooth' });
            }}>

            See the project<span> ↗</span>
          </a>
          <span className="voices-meta-grow"></span>
          <span className="voices-meta-verified">
            <span className="voices-meta-check">✓</span>
            Verified on Upwork
          </span>
        </div>

        {/* Pull-quote — placeholder text for now, swap with the line from the video */}
        <blockquote className="voices-quote">
          <span className="voices-quote-mark" aria-hidden="true">&ldquo;</span>
          <p className="voices-quote-line">
            <em>[Placeholder]</em> &nbsp;Drop in the strongest line from Eric&rsquo;s
            walkthrough here — the one sentence that sells the relationship.
          </p>
        </blockquote>
      </div>
    </section>);

}
