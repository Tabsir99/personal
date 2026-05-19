import { cn } from "@/lib/utils";

/* ===== Endorsement =====
   Sits between the Hero and the About section as an early-page hook —
   a pulled-quote testimonial with prominent stars and a verified-on-Upwork
   line. Editorial layout: meta column left, big italic quote right,
   generous breathing room. No card chrome, no rotation, no tape — just
   typography on the page so it reads as a real pull quote.
   --------------------------------------------------------------------- */
export function Endorsement() {
  return (
    <section
      id="endorsement"
      data-reveal
      className={cn(
        "relative pt-24 pb-20 max-xl:pt-[72px] max-xl:pb-16",
        // Hairline rules bracketing the strip — left=rail-gutter (180px),
        // right=gutter (96px). Matches base.css :root layout vars.
        "before:content-[''] before:absolute before:top-0 before:left-(--rail-gutter) before:right-(--gutter) before:h-px before:bg-line",
        "after:content-[''] after:absolute after:bottom-0 after:left-(--rail-gutter) after:right-(--gutter) after:h-px after:bg-line",
      )}
      aria-label="Client testimonial from Zohaib at DataZoro, verified on Upwork"
    >
      <div className="page-shell">
        <div
          className={cn(
            "grid items-start grid-cols-[0.85fr_2fr] gap-[clamp(48px,7vw,96px)]",
            "max-xl:grid-cols-1 max-xl:gap-8",
          )}
        >
          {/* Left meta column — eyebrow + big stars + verified mark */}
          <aside className="flex flex-col gap-7 pt-2">
            <div
              className={cn(
                "inline-flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted",
                "before:content-[''] before:w-6 before:h-px before:bg-muted",
              )}
            >
              Repeat client · 2025
            </div>

            <div className="flex flex-col gap-2.5">
              <div
                className={cn(
                  "inline-flex gap-1.5 text-accent text-[32px] leading-none",
                  "[text-shadow:0_0_12px_color-mix(in_oklab,var(--color-accent)_35%,transparent),0_0_28px_color-mix(in_oklab,var(--color-accent)_18%,transparent)]",
                  "max-xl:text-[26px] max-xl:gap-1",
                )}
                aria-hidden="true"
              >
                <span className="inline-block">★</span>
                <span className="inline-block">★</span>
                <span className="inline-block">★</span>
                <span className="inline-block">★</span>
                <span className="inline-block">★</span>
              </div>
              <div className="inline-flex items-baseline gap-2 font-serif text-cream">
                <span
                  className={cn(
                    "text-[36px] italic tracking-tight leading-none",
                    "max-xl:text-[30px]",
                  )}
                >
                  5.0
                </span>
                <span className="font-mono text-xs tracking-widest uppercase text-muted">
                  / 5.0
                </span>
              </div>
            </div>

            <a
              className={cn(
                "group inline-flex items-center gap-2.5 w-max font-mono text-xs tracking-widest uppercase text-muted",
                "[transition:color_300ms_ease,gap_300ms_ease]",
                "hover:text-cream hover:gap-3",
              )}
              href="https://www.upwork.com/"
              target="_blank"
              rel="noreferrer noopener"
            >
              <span
                className={cn(
                  "inline-flex items-center justify-center w-4 h-4 rounded-full bg-phosphor text-ink text-xxs font-bold leading-none shrink-0",
                  "[box-shadow:0_0_12px_color-mix(in_oklab,var(--color-phosphor)_32%,transparent)]",
                )}
                aria-hidden="true"
              >
                ✓
              </span>
              <span className="text-cream-2">Verified on Upwork</span>
              <span
                className={cn(
                  "text-muted-2 text-xs [transition:translate_300ms_ease,color_300ms_ease]",
                  "group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-phosphor",
                )}
                aria-hidden="true"
              >
                ↗
              </span>
            </a>
          </aside>

          {/* Right column — the actual quote + signature */}
          <blockquote
            className={cn(
              "relative pl-[clamp(24px,3vw,48px)] border-l border-line",
              "max-xl:pl-5",
            )}
          >
            <p
              className={cn(
                "font-serif italic text-cream",
                "text-[clamp(26px,2.8vw,40px)] leading-[1.22] tracking-tight",
                "text-balance",
              )}
            >
              <span
                className={cn(
                  "absolute font-serif not-italic text-accent leading-none pointer-events-none",
                  "left-[clamp(24px,3vw,48px)] ml-[-0.55em] mt-[-0.15em] text-[1.6em] opacity-50",
                  "max-xl:left-5",
                )}
                aria-hidden="true"
              >
                &ldquo;
              </span>
              Quick response and attention to detail. Clean, efficient code and
              excellent{" "}
              <em
                className={cn(
                  "italic text-accent px-0.5 text-highlight",
                  "[--text-highlight-color:color-mix(in_oklab,var(--color-accent)_15%,transparent)]",
                )}
              >
                communication
              </em>
              .
            </p>
            <footer
              className={cn(
                "flex items-center flex-wrap gap-3.5",
                "mt-[clamp(28px,3vw,40px)] font-mono text-xs tracking-widest uppercase text-muted",
              )}
            >
              <span className="text-cream font-medium">Zohaib</span>
              <span className="text-muted"> · DataZoro</span>
              <span
                className="inline-block w-5 h-px bg-line"
                aria-hidden="true"
              ></span>
              <span className="text-muted">Mar — Jul 2025</span>
              <span
                className="inline-block w-5 h-px bg-line"
                aria-hidden="true"
              ></span>
              <span
                className={cn(
                  "inline-flex items-center px-2.5 pt-[3px] pb-1 border border-line rounded-xs",
                  "text-accent text-xxs tracking-widest",
                )}
              >
                Repeat hire
              </span>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
