"use client";
import { cn } from "@/lib/utils";
import { useReveal } from "./useReveal";

/* ===== Now ===== */

export function Now() {
  const [ref, vis] = useReveal();
  return (
    <section
      id="now"
      className="relative py-40"
      data-screen-label="07 Now"
    >
      <div className={"container"}>
        <div
          className="grid items-start gap-[100px] grid-cols-[1fr_1.4fr] max-[1100px]:grid-cols-1"
          ref={ref}
        >
          <div
            className={cn(
              "sticky top-[120px] reveal",
              vis ? "in" : undefined,
            )}
          >
            <div
              className={cn(
                "inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted before:content-[''] before:w-6 before:h-px before:bg-muted",
                "mb-6",
              )}
            >
              A /now page
            </div>
            <h2
              className={cn(
                "font-serif font-normal leading-[0.96] tracking-[-0.02em] [font-feature-settings:'liga','kern']",
                "text-[clamp(48px,6vw,84px)] !leading-none mb-6",
              )}
            >
              What I&apos;m into
              <br />
              <em className="italic text-accent">right now.</em>
            </h2>
            <div className="inline-flex items-center gap-[10px] font-mono text-[11px] uppercase tracking-[0.1em] px-[14px] py-2 border border-line rounded-[2px] bg-ink-2">
              <span className="w-[7px] h-[7px] rounded-full bg-phosphor shadow-[0_0_10px_var(--color-phosphor)] animate-pulse-soft"></span>
              Updated · May 2026
            </div>
          </div>
          <div
            className={cn(
              "flex flex-col gap-10 reveal-stagger",
              vis ? "in" : undefined,
            )}
          >
            <div className="border-t border-line pt-7 grid grid-cols-[140px_1fr] gap-10">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                Building
              </div>
              <div className="text-[17px] leading-[1.55] text-cream [&_strong]:font-normal [&_strong]:text-accent [&_.muted]:text-muted">
                <strong>Lumen Stack</strong> — an observability dashboard built
                for solo founders and 2-person infra teams.
                <span className="muted">
                  {" "}
                  Currently in private beta with eight teams. Public launch
                  later this summer.
                </span>
              </div>
            </div>
            <div className="border-t border-line pt-7 grid grid-cols-[140px_1fr] gap-10">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                Working with
              </div>
              <div className="text-[17px] leading-[1.55] text-cream [&_strong]:font-normal [&_strong]:text-accent [&_.muted]:text-muted">
                A small fintech in <strong>Singapore</strong> on their treasury
                console, and a design studio in
                <strong> Berlin</strong> on the front-end for a publishing
                platform.
              </div>
            </div>
            <div className="border-t border-line pt-7 grid grid-cols-[140px_1fr] gap-10">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                Reading
              </div>
              <div className="text-[17px] leading-[1.55] text-cream [&_strong]:font-normal [&_strong]:text-accent [&_.muted]:text-muted">
                <em className="font-serif text-[19px]">
                  Designing Data-Intensive Applications
                </em>
                <span className="muted"> — on round two. </span>
                <em className="font-serif text-[19px]">
                  The Pragmatic Engineer
                </em>
                <span className="muted"> newsletter, faithfully.</span>
              </div>
            </div>
            <div className="border-t border-line pt-7 grid grid-cols-[140px_1fr] gap-10">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                Learning
              </div>
              <div className="text-[17px] leading-[1.55] text-cream [&_strong]:font-normal [&_strong]:text-accent [&_.muted]:text-muted">
                Going deeper on <strong>Rust</strong> for back-end services.
                Re-learning DSP for an audio side-project nobody asked for.
              </div>
            </div>
            <div className="border-t border-line pt-7 grid grid-cols-[140px_1fr] gap-10">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                Listening
              </div>
              <div className="text-[17px] leading-[1.55] text-cream [&_strong]:font-normal [&_strong]:text-accent [&_.muted]:text-muted">
                Lots of <strong>ambient + dub techno</strong> while I code.
                Currently rotating: Burial, Loraine James,
                <span className="muted">
                  {" "}
                  and a suspicious amount of lo-fi jazz radio.
                </span>
              </div>
            </div>
            <div className="border-t border-line pt-7 grid grid-cols-[140px_1fr] gap-10">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                Not doing
              </div>
              <div className="text-[17px] leading-[1.55] text-cream [&_strong]:font-normal [&_strong]:text-accent [&_.muted]:text-muted">
                Twitter, mostly. Saying &ldquo;yes&rdquo; to projects that smell
                like scope creep. Coffee after 4pm.
              </div>
            </div>
            <div className="font-mono text-[10px] text-muted-2 mt-3 tracking-[0.1em]">
              / inspired by Derek Sivers · /now-page movement
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
