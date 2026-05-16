"use client";
import { useReveal } from "./useReveal";

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
      className={`endorsement ${vis ? "in" : ""}`}
      data-screen-label="01a Endorsement"
      ref={ref}
      aria-label="Client testimonial from Zohaib at DataZoro, verified on Upwork"
    >
      <div className="container">
        <div className="endorsement-grid">
          {/* Left meta column — eyebrow + big stars + verified mark */}
          <aside className="endorsement-meta">
            <div className="eyebrow">Repeat client · 2025</div>

            <div className="endorsement-rating">
              <div className="endorsement-stars" aria-hidden="true">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
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
              rel="noreferrer noopener"
            >
              <span className="endorsement-check" aria-hidden="true">
                ✓
              </span>
              <span className="endorsement-verified-label">
                Verified on Upwork
              </span>
              <span className="endorsement-verified-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          </aside>

          {/* Right column — the actual quote + signature */}
          <blockquote className="endorsement-quote">
            <p className="endorsement-line">
              <span className="endorsement-mark" aria-hidden="true">
                &ldquo;
              </span>
              Quick response and attention to detail. Clean, efficient code and
              excellent <em>communication</em>.
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
    </section>
  );
}
