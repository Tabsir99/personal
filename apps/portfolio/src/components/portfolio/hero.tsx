import { Terminal } from "./terminal";
import { ScrambleWord } from "./scramble-word";
import { cn } from "@/lib/utils";

/* ===== Hero =====
   Pain-point first. The hook word ([FRICTION]) scrambles through related
   nouns — friction → fragility → frustration → re-writes → slow ships.
   Title left, translucent terminal right. The whole composition is locked
   to a single viewport, no scroll needed to "get" it. */
export function Hero() {
  return (
    <section
      id="hero"
      data-screen-label="01 Hero"
      className={cn(
        "relative h-screen min-h-[720px] overflow-hidden p-0",
        "max-[1100px]:h-auto max-[1100px]:min-h-screen",
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        <div
          className={cn(
            "absolute inset-0",
            "bg-[linear-gradient(to_right,color-mix(in_oklab,var(--color-cream)_4%,transparent)_1px,transparent_1px)] bg-size-[12.5%_100%]",
            "mask-[radial-gradient(ellipse_at_60%_50%,black_30%,transparent_75%)]",
            "[-webkit-mask-image:radial-gradient(ellipse_at_60%_50%,black_30%,transparent_75%)]",
          )}
        ></div>
      </div>

      <div
        className={cn(
          "container",
          "z-1 flex h-full flex-col justify-between pt-24 pb-9",
          "max-[1100px]:pt-[110px] max-[1100px]:pb-14",
        )}
      >
        <div
          className={cn(
            "grid grid-cols-[1.15fr_0.95fr] items-center gap-[clamp(40px,6vw,96px)]",
            "min-h-0 flex-1",
            "max-[1100px]:grid-cols-1 max-[1100px]:gap-12",
          )}
        >
          {/* LEFT: title + dek + actions */}
          <div className="min-w-0">
            <h1
              className={cn(
                "m-0 mb-7 flex flex-col gap-0 font-normal text-balance",
              )}
            >
              <span
                className={cn(
                  "inline-flex items-baseline gap-1 font-mono font-medium",
                  "text-[clamp(40px,6.4vw,96px)] leading-[1.04] tracking-[-0.01em]",
                  "text-accent uppercase",
                  "[font-variant-numeric:tabular-nums] whitespace-nowrap",
                  "translate-y-2 opacity-0",
                  "animate-[hero-rise_0.9s_var(--ease-soft)_forwards_0.3s]",
                  "max-[1100px]:text-[clamp(36px,9vw,64px)]",
                )}
              >
                <span className="text-accent-2 font-normal opacity-70">[</span>
                <ScrambleWord
                  words={[
                    "FRICTION",
                    "FRAGILITY",
                    "FRUSTRATION",
                    "RE-WRITES",
                    "SLOW SHIPS",
                  ]}
                />

                <span className="text-accent-2 font-normal opacity-70">]</span>
              </span>
              <span
                className={cn(
                  "mt-1.5 flex flex-col font-serif",
                  "text-[clamp(56px,9vw,130px)] leading-[0.92] tracking-[-0.035em]",
                  "text-cream",
                  "max-[1100px]:text-[clamp(48px,12vw,96px)]",
                )}
              >
                <span
                  className={cn(
                    "block translate-y-[0.4em] opacity-0",
                    "animate-[hero-rise_1s_var(--ease-soft)_forwards_0.45s]",
                  )}
                >
                  is not
                </span>
                <span
                  className={cn(
                    "block translate-y-[0.4em] opacity-0",
                    "pl-[clamp(28px,5vw,96px)]",
                    "animate-[hero-rise_1s_var(--ease-soft)_forwards_0.6s]",
                    "max-[1100px]:pl-6",
                    "[&_em]:text-accent [&_em]:italic",
                  )}
                >
                  a <em>feature.</em>
                </span>
              </span>
            </h1>

            <p
              className={cn(
                "font-sans font-light",
                "text-[clamp(17px,1.55vw,22px)] leading-[1.45] tracking-normal",
                "text-cream-2",
                "mx-0 mt-9 mb-11 max-w-[52ch]",
                "opacity-0 animate-[hero-fade_0.9s_ease_forwards_0.9s]",
                "[&_em]:italic [&_em]:text-accent [&_em]:px-0.5",
                "[&_em]:bg-[linear-gradient(transparent_78%,color-mix(in_oklab,var(--color-accent)_18%,transparent)_78%,color-mix(in_oklab,var(--color-accent)_18%,transparent)_100%)]",
              )}
            >
              Full-stack web work for teams who&rsquo;d rather{" "}
              <em>move than rewrite</em>. APIs, dashboards, the seams between
              them — built so they don&rsquo;t show.
            </p>

            <div
              className={cn(
                "flex flex-wrap items-center gap-7",
                "opacity-0 animate-[hero-fade_0.9s_ease_forwards_1.05s]",
              )}
            >
              <a
                href="#contact"
                className={cn(
                  "group inline-flex items-center gap-3.5",
                  "px-6 py-4",
                  "bg-accent text-ink border border-accent rounded-[2px]",
                  "font-mono text-[11px] tracking-[0.16em] uppercase",
                  "transition-[background,color] duration-300 ease-[ease]",
                  "hover:bg-transparent hover:text-accent",
                )}
              >
                <span>Start a project</span>
                <span
                  className={cn(
                    "inline-block transition-transform duration-300 ease-[ease]",
                    "group-hover:translate-x-1",
                  )}
                >
                  →
                </span>
              </a>
              <a
                href="#services"
                className={cn(
                  "group relative inline-flex items-center gap-2.5",
                  "pb-1",
                  "font-mono text-[11px] tracking-[0.14em] uppercase",
                  "text-muted transition-colors duration-300 ease-[ease]",
                  "hover:text-cream",
                  "after:content-[''] after:absolute after:left-0 after:bottom-0",
                  "after:h-px after:w-full after:bg-muted",
                  "after:origin-left after:scale-x-[0.4]",
                  "after:transition-[scale,background] after:duration-300 after:ease-[ease]",
                  "hover:after:scale-x-100 hover:after:bg-cream",
                )}
              >
                <span>How I work</span>
                <span
                  className={cn(
                    "text-[13px] opacity-70",
                    "transition-[translate,opacity] duration-300 ease-[ease]",
                    "group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:opacity-100",
                  )}
                >
                  ↘
                </span>
              </a>
            </div>
          </div>

          {/* RIGHT: terminal + Upwork credential beneath it */}
          <div
            className={cn(
              "flex min-w-0 flex-col items-stretch gap-[18px]",
              "max-[1100px]:max-w-[540px]",
            )}
          >
            <Terminal />

            <a
              href="https://www.upwork.com/"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Top Rated on Upwork, 5.0 out of 5 stars"
              className={cn(
                "group inline-flex items-baseline gap-3 self-end",
                "w-max max-w-full",
                "font-mono text-[11px] tracking-[0.16em] uppercase",
                "text-muted transition-colors duration-300 ease-[ease]",
                "hover:text-cream",
                "opacity-0 animate-[hero-fade_0.9s_ease_forwards_1.2s]",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "text-accent text-[12px] tracking-[0.12em]",
                  "[text-shadow:0_0_10px_color-mix(in_oklab,var(--color-accent)_35%,transparent)]",
                )}
              >
                ★★★★★
              </span>
              <span
                className={cn(
                  "font-mono text-[10.5px] tracking-[0.18em] uppercase",
                  "[&_em]:font-serif [&_em]:italic [&_em]:text-[14px]",
                  "[&_em]:tracking-normal [&_em]:normal-case",
                  "[&_em]:text-phosphor [&_em]:ml-0.5",
                )}
              >
                Top Rated on <em>Upwork</em>
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "text-[11px] text-muted-2",
                  "transition-[translate,color] duration-300 ease-[ease]",
                  "group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                  "group-hover:text-phosphor",
                )}
              >
                ↗
              </span>
            </a>
          </div>
        </div>

        <div
          className={cn(
            "flex items-center gap-[18px]",
            "opacity-0 animate-[hero-fade_0.9s_ease_forwards_1.25s]",
          )}
        >
          <span
            className={cn(
              "inline-block font-mono text-[10.5px] tracking-[0.18em] uppercase",
              "text-cream",
              "animate-hero-foot-bob",
            )}
          >
            ↓ Scroll
          </span>
          <span className="h-px w-7 bg-line"></span>
          <span
            className={cn(
              "font-serif italic text-[13px] tracking-[0.005em]",
              "text-muted",
            )}
          >
            Two years shipping. Seventeen projects merged.
          </span>
        </div>
      </div>
    </section>
  );
}
