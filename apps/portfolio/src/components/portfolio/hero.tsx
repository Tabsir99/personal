"use client";
import { useState, useEffect, useRef } from "react";
import { Terminal } from "./terminal";
import { ScrambleWord } from "./scramble-word";

function formatClock() {
  // Approximate Dhaka time (UTC+6) using user clock offset isn't reliable;
  // just use local time for warmth — labelled "Field station · Dhaka".
  const d = new Date();
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/* ===== Hero =====
   Pain-point first. The hook word ([FRICTION]) scrambles through related
   nouns — friction → fragility → frustration → re-writes → slow ships.
   Title left, translucent terminal right. The whole composition is locked
   to a single viewport, no scroll needed to "get" it. */
export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // Cursor-following accent glow — subtle ambient interaction.
  useEffect(() => {
    if (!heroRef.current || !glowRef.current) return;
    let raf = 0;
    let tx = 0.4,
      ty = 0.5;
    let cx = 0.4,
      cy = 0.5;
    let inside = false;

    function onMove(e: MouseEvent) {
      const r = heroRef.current!.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = (e.clientY - r.top) / r.height;
      inside = true;
    }
    function onLeave() {
      inside = false;
      tx = 0.4;
      ty = 0.5;
    }
    function tick() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      if (glowRef.current) {
        glowRef.current.style.setProperty("--gx", `${cx * 100}%`);
        glowRef.current.style.setProperty("--gy", `${cy * 100}%`);
        glowRef.current.style.opacity = inside ? "1" : "0.5";
      }
      raf = requestAnimationFrame(tick);
    }
    const el = heroRef.current;
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Local time for the field-station meta line.
  const [clock, setClock] = useState(() => formatClock());
  useEffect(() => {
    const id = setInterval(() => setClock(formatClock()), 30 * 1000);
    return () => clearInterval(id);
  }, []);
  void clock;

  return (
    <section
      id="hero"
      className="hero"
      data-screen-label="01 Hero"
      ref={heroRef}
    >
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-glow" ref={glowRef}></div>
        <div className="hero-grid-lines"></div>
      </div>

      <div className="container hero-body">
        <div className="hero-grid">
          {/* LEFT: title + dek + actions */}
          <div className="hero-left">
            <h1 className="hero-headline">
              <span className="hero-headline-word">
                <span className="hero-bracket hero-bracket--l">[</span>
                <ScrambleWord
                  words={[
                    "FRICTION",
                    "FRAGILITY",
                    "FRUSTRATION",
                    "RE-WRITES",
                    "SLOW SHIPS",
                  ]}
                />

                <span className="hero-bracket hero-bracket--r">]</span>
              </span>
              <span className="hero-headline-rest">
                <span className="hero-headline-line">is not</span>
                <span className="hero-headline-line hero-headline-line--accent">
                  a <em>feature.</em>
                </span>
              </span>
            </h1>

            <p className="hero-dek">
              Full-stack web work for teams who&rsquo;d rather{" "}
              <em>move than rewrite</em>. APIs, dashboards, the seams between
              them — built so they don&rsquo;t show.
            </p>

            <div className="hero-actions">
              <a
                href="#contact"
                className="hero-primary"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById("contact");
                  if (el)
                    window.scrollTo({
                      top: el.offsetTop - 40,
                      behavior: "smooth",
                    });
                }}
              >
                <span>Start a project</span>
                <span className="hero-primary-arrow">→</span>
              </a>
              <a
                href="#services"
                className="hero-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById("services");
                  if (el)
                    window.scrollTo({
                      top: el.offsetTop - 40,
                      behavior: "smooth",
                    });
                }}
              >
                <span>How I work</span>
                <span className="hero-secondary-arrow">↘</span>
              </a>
            </div>
          </div>

          {/* RIGHT: terminal + Upwork credential beneath it */}
          <div className="hero-right">
            <Terminal />

            {/* Social-proof line — pure typography, no card. */}
            <a
              className="hero-upwork"
              href="https://www.upwork.com/"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Top Rated on Upwork, 5.0 out of 5 stars"
            >
              <span className="hero-upwork-stars" aria-hidden="true">
                ★★★★★
              </span>
              <span className="hero-upwork-label">
                Top Rated on <em>Upwork</em>
              </span>
              <span className="hero-upwork-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          </div>
        </div>

        <div className="hero-foot">
          <span className="hero-foot-mono">↓ Scroll</span>
          <span className="hero-foot-divider"></span>
          <span className="hero-foot-text">
            Two years shipping. Seventeen projects merged.
          </span>
        </div>
      </div>
    </section>
  );
}
