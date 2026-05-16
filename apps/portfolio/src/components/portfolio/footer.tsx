"use client";
import { useState, useEffect } from "react";
import { useReveal } from "./useReveal";

function FooterClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
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
