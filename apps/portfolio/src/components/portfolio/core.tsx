"use client";
import { useState, useEffect, useRef } from "react";
import { Terminal } from "./terminal";

const useStateC = useState;
const useEffectC = useEffect;
const useRefC = useRef;

/* ===== Reveal hook — IntersectionObserver wrapper ===== */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  opts: { threshold?: number; rootMargin?: string } = {}
) {
  const ref = useRefC<T>(null);
  const [vis, setVis] = useStateC(false);
  useEffectC(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVis(true);
        io.disconnect();
      }
    }, { threshold: opts.threshold || 0.15, rootMargin: opts.rootMargin || '0px 0px -10% 0px' });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, vis] as const;
}

/* ===== Persistent left rail ===== */
export const SECTIONS = [
{ id: 'hero', label: '00 — Index' },
{ id: 'about', label: '01 — About' },
{ id: 'services', label: '02 — Services' },
{ id: 'work', label: '03 — Work' },
{ id: 'stack', label: '04 — Stack' },
{ id: 'writing', label: '05 — Writing' },
{ id: 'now', label: '06 — Now' },
{ id: 'contact', label: '07 — Contact' }];


export function Rail() {
  const [positions, setPositions] = useStateC<number[]>([]);
  const [active, setActive] = useStateC(0);
  const [progress, setProgress] = useStateC(0); // scrollY / docH — aligned with tick positions

  useEffectC(() => {
    function measure() {
      const docH = document.documentElement.scrollHeight;
      const pos = SECTIONS.map((s) => {
        const el = document.getElementById(s.id);
        if (!el) return 0;
        return el.offsetTop / docH * 100;
      });
      setPositions(pos);
    }
    measure();
    window.addEventListener('resize', measure);
    const t = setTimeout(measure, 600);
    return () => {window.removeEventListener('resize', measure);clearTimeout(t);};
  }, []);

  useEffectC(() => {
    function onScroll() {
      const docH = document.documentElement.scrollHeight;
      // fill + cursor track scroll position, using the SAME divisor as tick positions
      setProgress(window.scrollY / docH * 100);
      const y = window.scrollY + window.innerHeight * 0.35;
      let cur = 0;
      SECTIONS.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (el && el.offsetTop <= y) cur = i;
      });
      setActive(cur);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="rail" aria-hidden="true">
      <div className="rail-track"></div>
      <div className="rail-endcap top"></div>
      <div className="rail-endcap bot"></div>
      <div className="rail-fill" style={{ height: `${progress}%` }}></div>
      {positions.map((p, i) =>
      <div key={i}
      className={`rail-tick ${i === active ? 'active' : ''} ${i < active ? 'past' : ''}`}
      style={{ top: `${p}%` }}>
          <span className="rail-tick-label">{SECTIONS[i].label}</span>
        </div>
      )}
      <div className="rail-cursor" style={{ top: `${progress}%` }}></div>
    </div>);

}

/* ===== Header ===== */
export function Header() {
  const [scrolled, setScrolled] = useStateC(false);
  const [active, setActive] = useStateC('hero');

  useEffectC(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      const y = window.scrollY + window.innerHeight * 0.4;
      let cur = 'hero';
      SECTIONS.forEach((s) => {
        const el = document.getElementById(s.id);
        if (el && el.offsetTop <= y) cur = s.id;
      });
      setActive(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
  { id: 'about', label: 'About', num: '01' },
  { id: 'work', label: 'Work', num: '03' },
  { id: 'stack', label: 'Stack', num: '04' },
  { id: 'writing', label: 'Writing', num: '05' },
  { id: 'now', label: 'Now', num: '06' }];


  function jumpTo(id: string) {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 40, behavior: 'smooth' });
  }

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <a href="#hero" onClick={(e) => {e.preventDefault();window.scrollTo({ top: 0, behavior: 'smooth' });}} className="brand">
        <span style={{ fontStyle: 'italic' }}>Tabsir</span>
        <span className="brand-sep">·</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.12em', color: 'var(--muted)' }}>CG</span>
      </a>
      <nav className="nav">
        {navItems.map((it) =>
        <a key={it.id} href={`#${it.id}`} data-num={it.num}
        className={active === it.id ? 'active' : ''}
        onClick={(e) => {e.preventDefault();jumpTo(it.id);}}>{it.label}</a>
        )}
      </nav>
      <a href="#contact" className="header-cta" onClick={(e) => {e.preventDefault();jumpTo('contact');}}>
        <span className="pulse"></span>
        Available
      </a>
    </header>);

}

/* ===== Scramble Word =====
   Text-scramble effect that cycles through a list of words.
   Each character settles into the next target glyph in turn — feels like
   a glitch / re-resolve animation. Used to call attention to the hero hook word. */
export function ScrambleWord({ words, hold = 2200, charDelay = 38 }: { words: string[]; hold?: number; charDelay?: number }) {
  const [idx, setIdx] = useStateC(0);
  const [display, setDisplay] = useStateC(words[0] || '');
  const lastSettledRef = useRefC(words[0] || '');

  useEffectC(() => {
    if (!words || words.length < 2) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const chars = '!<>-_/[]{}=+*^?#$%&@';
    const from = lastSettledRef.current;
    const to = words[idx];
    const len = Math.max(from.length, to.length);
    const queue: { from: string; to: string; start: number; end: number }[] = [];
    for (let i = 0; i < len; i++) {
      const start = Math.floor(Math.random() * 10);
      const end = start + 10 + Math.floor(Math.random() * 14);
      queue.push({ from: from[i] || ' ', to: to[i] || ' ', start, end });
    }

    let frame = 0;
    const tick = () => {
      if (cancelled) return;
      let out = '';
      let complete = 0;
      for (const item of queue) {
        if (frame >= item.end) {
          complete++;
          out += item.to;
        } else if (frame >= item.start) {
          out += chars[Math.floor(Math.random() * chars.length)];
        } else {
          out += item.from;
        }
      }
      setDisplay(out);
      if (complete === queue.length) {
        lastSettledRef.current = to;
        timers.push(setTimeout(() => {
          if (!cancelled) setIdx((p) => (p + 1) % words.length);
        }, hold));
      } else {
        frame++;
        timers.push(setTimeout(tick, charDelay));
      }
    };
    // Small initial hold so the first word reads before scrambling
    timers.push(setTimeout(tick, idx === 0 ? hold : 0));

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [idx]);

  return <span className="scramble-word" aria-live="polite">{display}</span>;
}

/* ===== Hero =====
   Pain-point first. The hook word ([FRICTION]) scrambles through related
   nouns — friction → fragility → frustration → re-writes → slow ships.
   Title left, translucent terminal right. The whole composition is locked
   to a single viewport, no scroll needed to "get" it. */
export function Hero() {
  const heroRef = useRefC<HTMLElement>(null);
  const glowRef = useRefC<HTMLDivElement>(null);

  // Cursor-following accent glow — subtle ambient interaction.
  useEffectC(() => {
    if (!heroRef.current || !glowRef.current) return;
    let raf = 0;
    let tx = 0.4,ty = 0.5;
    let cx = 0.4,cy = 0.5;
    let inside = false;

    function onMove(e: MouseEvent) {
      const r = heroRef.current!.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = (e.clientY - r.top) / r.height;
      inside = true;
    }
    function onLeave() {
      inside = false;
      tx = 0.4;ty = 0.5;
    }
    function tick() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      if (glowRef.current) {
        glowRef.current.style.setProperty('--gx', `${cx * 100}%`);
        glowRef.current.style.setProperty('--gy', `${cy * 100}%`);
        glowRef.current.style.opacity = inside ? '1' : '0.5';
      }
      raf = requestAnimationFrame(tick);
    }
    const el = heroRef.current;
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Local time for the field-station meta line.
  const [clock, setClock] = useStateC(() => formatClock());
  useEffectC(() => {
    const id = setInterval(() => setClock(formatClock()), 30 * 1000);
    return () => clearInterval(id);
  }, []);
  void clock;

  return (
    <section id="hero" className="hero" data-screen-label="01 Hero" ref={heroRef}>
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
                  'FRICTION',
                  'FRAGILITY',
                  'FRUSTRATION',
                  'RE-WRITES',
                  'SLOW SHIPS']
                  } />

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
              Full-stack web work for teams who&rsquo;d rather <em>move than rewrite</em>.
              APIs, dashboards, the seams between them — built so they don&rsquo;t show.
            </p>

            <div className="hero-actions">
              <a
                href="#contact"
                className="hero-primary"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById('contact');
                  if (el) window.scrollTo({ top: el.offsetTop - 40, behavior: 'smooth' });
                }}>

                <span>Start a project</span>
                <span className="hero-primary-arrow">→</span>
              </a>
              <a
                href="#services"
                className="hero-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById('services');
                  if (el) window.scrollTo({ top: el.offsetTop - 40, behavior: 'smooth' });
                }}>

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
              aria-label="Top Rated on Upwork, 5.0 out of 5 stars">

              <span className="hero-upwork-stars" aria-hidden="true">★★★★★</span>
              <span className="hero-upwork-label">Top Rated on <em>Upwork</em></span>
              <span className="hero-upwork-arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="hero-foot">
          <span className="hero-foot-mono">↓ Scroll</span>
          <span className="hero-foot-divider"></span>
          <span className="hero-foot-text">Two years shipping. Seventeen projects merged.</span>
        </div>
      </div>
    </section>);

}

function formatClock() {
  // Approximate Dhaka time (UTC+6) using user clock offset isn't reliable;
  // just use local time for warmth — labelled "Field station · Dhaka".
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/* ===== Endorsement =====
   Sits between the Hero and the About section as an early-page hook —
   a pulled-quote testimonial with prominent stars and a verified-on-Upwork
   line. Editorial layout: meta column left, big italic quote right,
   generous breathing room. No card chrome, no rotation, no tape — just
   typography on the page so it reads as a real pull quote.
   --------------------------------------------------------------------- */
export function Endorsement() {
  const [ref, vis] = useReveal<HTMLElement>({ threshold: 0.2 });
  return (
    <section
      id="endorsement"
      className={`endorsement ${vis ? 'in' : ''}`}
      data-screen-label="01a Endorsement"
      ref={ref}
      aria-label="Client testimonial from Zohaib at DataZoro, verified on Upwork">

      <div className="container">
        <div className="endorsement-grid">
          {/* Left meta column — eyebrow + big stars + verified mark */}
          <aside className="endorsement-meta">
            <div className="eyebrow">Repeat client · 2025</div>

            <div className="endorsement-rating">
              <div className="endorsement-stars" aria-hidden="true">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <div className="endorsement-score">
                <span className="endorsement-score-num">5.0</span>
                <span className="endorsement-score-of">/ 5.0</span>
              </div>
            </div>

            <a
              className="endorsement-verified"
              href="https://www.upwork.com/"
              target="_blank"
              rel="noreferrer noopener">

              <span className="endorsement-check" aria-hidden="true">✓</span>
              <span className="endorsement-verified-label">Verified on Upwork</span>
              <span className="endorsement-verified-arrow" aria-hidden="true">↗</span>
            </a>
          </aside>

          {/* Right column — the actual quote + signature */}
          <blockquote className="endorsement-quote">
            <p className="endorsement-line">
              <span className="endorsement-mark" aria-hidden="true">&ldquo;</span>
              Quick response and attention to detail. Clean, efficient code
              and excellent <em>communication</em>.
            </p>
            <footer className="endorsement-sig">
              <span className="endorsement-sig-name">Zohaib</span>
              <span className="endorsement-sig-co"> · DataZoro</span>
              <span className="endorsement-sig-sep" aria-hidden="true"></span>
              <span className="endorsement-sig-when">Mar — Jul 2025</span>
              <span className="endorsement-sig-sep" aria-hidden="true"></span>
              <span className="endorsement-sig-tag">Repeat hire</span>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>);

}

/* ===== About ===== */
export function About() {
  const [ref, vis] = useReveal();
  const text = "I write code for the messy middle — where product specs collide with reality. I care about response budgets, accessible focus rings, sensible primary keys, and shipping things small enough to fix on a Friday. Two years in, mostly across SaaS dashboards, marketplaces, and a handful of internal tools nobody ever sees but everyone depends on.";
  const words = text.split(' ');

  return (
    <section id="about" className="about" data-screen-label="02 About">
      <span className="section-tag">/ 01 — About</span>
      <span className="margin-note" style={{ top: '220px' }}>no frameworks worshipped.</span>

      <div className="container">
        <div className="about-grid" ref={ref}>
          <div className={`reveal ${vis ? 'in' : ''}`}>
            <div className="eyebrow">A short note</div>
            <div className="about-stats">
              <div className="stat">
                <span className="num">∼2</span>
                <span className="lbl">Years shipping</span>
              </div>
              <div className="stat">
                <span className="num">17</span>
                <span className="lbl">Projects merged</span>
              </div>
              <div className="stat">
                <span className="num">4</span>
                <span className="lbl">Stacks daily</span>
              </div>
              <div className="stat">
                <span className="num">0</span>
                <span className="lbl">Frameworks worshipped</span>
              </div>
            </div>
          </div>
          <div className={`about-text word-reveal`}>
            {words.map((w, i) => {
              const isAccent = ['quiet', 'craft', 'reality.', 'middle'].some((t) => w.toLowerCase().includes(t));
              return (
                <span key={i} className={`word ${vis ? 'on' : ''}`} style={{ transitionDelay: `${0.3 + i * 0.025}s` }}>
                  {isAccent ? <em className="accent">{w}</em> : w}
                </span>);

            })}
          </div>
        </div>
      </div>
    </section>);

}
