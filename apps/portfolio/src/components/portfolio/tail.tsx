"use client";
import { useState, useEffect } from "react";
import { useReveal } from "./core";

const useStateT = useState;
const useEffectT = useEffect;

/* ===== Writing ===== */

const ARTICLES = [
  {
    num: "01",
    date: "2026 · 04",
    title: 'On the tyranny of "just one more abstraction"',
    meta: "12 min · Engineering",
  },
  {
    num: "02",
    date: "2026 · 02",
    title: "Postgres is enough — for the first 10,000 users",
    meta: "8 min · Backend",
  },
  {
    num: "03",
    date: "2025 · 11",
    title: "How I write components I will not hate in six months",
    meta: "14 min · Frontend",
  },
  {
    num: "04",
    date: "2025 · 09",
    title: "A junior dev's field-guide to reading other people's code",
    meta: "10 min · Career",
  },
  {
    num: "05",
    date: "2025 · 07",
    title: "Quiet animation: motion that doesn't beg for attention",
    meta: "7 min · Design",
  },
];

export function Writing() {
  const [ref, vis] = useReveal();
  return (
    <section id="writing" data-screen-label="06 Writing">
      <div className="container">
        <div className="work-head">
          <h2 className="work-title display">
            <em>Notes</em>
            <br />
            from the keyboard.
          </h2>
          <div className="work-count">
            <div>{ARTICLES.length} posts</div>
            <div style={{ marginTop: 6, color: "var(--muted-2)" }}>
              read more →
            </div>
          </div>
        </div>
        <div
          className={`writing-list reveal-stagger ${vis ? "in" : ""}`}
          ref={ref}
        >
          {ARTICLES.map((a) => (
            <a key={a.num} className="write-row" href="#">
              <div className="write-num">{a.num}</div>
              <div className="write-date">{a.date}</div>
              <div className="write-title-text display">{a.title}</div>
              <div className="write-meta">{a.meta}</div>
              <div className="write-arrow">Read ↗</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===== Now ===== */

export function Now() {
  const [ref, vis] = useReveal();
  return (
    <section id="now" className="now" data-screen-label="07 Now">
      <div className="container">
        <div className="now-grid" ref={ref}>
          <div className={`now-head reveal ${vis ? "in" : ""}`}>
            <div className="eyebrow" style={{ marginBottom: 24 }}>
              A /now page
            </div>
            <h2 className="now-title display">
              What I'm into
              <br />
              <em style={{ fontStyle: "italic", color: "var(--accent)" }}>
                right now.
              </em>
            </h2>
            <div className="now-status">
              <span className="dot"></span>
              Updated · May 2026
            </div>
          </div>
          <div className={`now-blocks reveal-stagger ${vis ? "in" : ""}`}>
            <div className="now-block">
              <div className="now-block-label">Building</div>
              <div className="now-block-body">
                <strong>Lumen Stack</strong> — an observability dashboard built
                for solo founders and 2-person infra teams.
                <span className="muted">
                  {" "}
                  Currently in private beta with eight teams. Public launch
                  later this summer.
                </span>
              </div>
            </div>
            <div className="now-block">
              <div className="now-block-label">Working with</div>
              <div className="now-block-body">
                A small fintech in <strong>Singapore</strong> on their treasury
                console, and a design studio in
                <strong> Berlin</strong> on the front-end for a publishing
                platform.
              </div>
            </div>
            <div className="now-block">
              <div className="now-block-label">Reading</div>
              <div className="now-block-body">
                <em style={{ fontFamily: "var(--serif)", fontSize: 19 }}>
                  Designing Data-Intensive Applications
                </em>
                <span className="muted"> — on round two. </span>
                <em style={{ fontFamily: "var(--serif)", fontSize: 19 }}>
                  The Pragmatic Engineer
                </em>
                <span className="muted"> newsletter, faithfully.</span>
              </div>
            </div>
            <div className="now-block">
              <div className="now-block-label">Learning</div>
              <div className="now-block-body">
                Going deeper on <strong>Rust</strong> for back-end services.
                Re-learning DSP for an audio side-project nobody asked for.
              </div>
            </div>
            <div className="now-block">
              <div className="now-block-label">Listening</div>
              <div className="now-block-body">
                Lots of <strong>ambient + dub techno</strong> while I code.
                Currently rotating: Burial, Loraine James,
                <span className="muted">
                  {" "}
                  and a suspicious amount of lo-fi jazz radio.
                </span>
              </div>
            </div>
            <div className="now-block">
              <div className="now-block-label">Not doing</div>
              <div className="now-block-body">
                Twitter, mostly. Saying "yes" to projects that smell like scope
                creep. Coffee after 4pm.
              </div>
            </div>
            <div className="now-updated">
              / inspired by Derek Sivers · /now-page movement
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===== Footer ===== */

export function FooterClock() {
  const [time, setTime] = useStateT("");
  useEffectT(() => {
    const tick = () => {
      const d = new Date();
      const opts: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Dhaka",
      };
      setTime(d.toLocaleTimeString("en-GB", opts) + " · GMT+6");
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="clock">
      <span className="dot"></span>
      {time} · Dhaka
    </span>
  );
}

export function Footer() {
  const [ref, vis] = useReveal();
  return (
    <footer id="contact" className="footer" data-screen-label="08 Contact">
      <div className="container" ref={ref}>
        <div className={`footer-eyebrow eyebrow reveal ${vis ? "in" : ""}`}>
          Currently taking projects · Q3 2026
        </div>
        <h2 className={`footer-mega display reveal ${vis ? "in" : ""}`}>
          <span className="stroke">Let's build</span>
          <br />
          <em>something</em>
          <span className="muted" style={{ color: "var(--muted)" }}>
            {" "}
            small,
          </span>
          <br />
          <span className="muted" style={{ color: "var(--muted)" }}>
            sturdy,
          </span>{" "}
          &amp; <em>true.</em>
        </h2>
        <a
          href="mailto:hello@tabsircg.com"
          className={`footer-cta reveal ${vis ? "in" : ""}`}
        >
          hello@tabsircg.com
          <span className="arrow">↗</span>
        </a>
        <div className="footer-grid">
          <div className="footer-col">
            <h5>Studio</h5>
            <p
              style={{
                fontFamily: "var(--serif)",
                fontSize: 22,
                lineHeight: 1.3,
                marginBottom: 14,
                color: "var(--cream)",
              }}
            >
              Tabsir CG · Independent practice
            </p>
            <p style={{ color: "var(--muted)", fontSize: 13 }}>
              Apt 4B, Banani Road 11
              <br />
              Dhaka 1213, Bangladesh
            </p>
          </div>
          <div className="footer-col">
            <h5>Direct</h5>
            <a href="mailto:hello@tabsircg.com">hello@tabsircg.com</a>
            <a href="#">
              +880 17 ████ ████ <span className="ext">(on request)</span>
            </a>
            <a href="#">Cal.com / tabsir</a>
          </div>
          <div className="footer-col">
            <h5>Elsewhere</h5>
            <a href="#">
              GitHub <span className="ext">↗</span>
            </a>
            <a href="#">
              Read.cv <span className="ext">↗</span>
            </a>
            <a href="#">
              Bluesky <span className="ext">↗</span>
            </a>
            <a href="#">
              LinkedIn <span className="ext">↗</span>
            </a>
          </div>
          <div className="footer-col">
            <h5>Work with me</h5>
            <a href="#">Full project (~6 wks +)</a>
            <a href="#">Sprint engagement (1–2 wks)</a>
            <a href="#">Advisory retainer</a>
            <a href="#">Code-review on call</a>
          </div>
        </div>
        <div className="footer-bot">
          <FooterClock />
          <span>© 2026 · Tabsir CG · v2.6 · No tracking</span>
          <span>↑ back to top</span>
        </div>
      </div>
    </footer>
  );
}
