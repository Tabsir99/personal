"use client";
import { useReveal } from "./useReveal";

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
