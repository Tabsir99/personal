import { Terminal, type TerminalLine } from "./terminal";
import { ScrambleWord } from "./scramble-word";
import { cn } from "@/lib/utils";
import { NavLink } from "../ui/nav-link";

const TERMINAL_TITLE = "tabsir@field-station";
const TERMINAL_LINES: TerminalLine[] = [
  {
    command: "whoami",
    response: "full-stack engineer · 2y in production · javascript by default",
    delayBefore: 400,
  },
  {
    command: "cat stack.txt",
    response:
      "react · node · typescript · postgres\nnext.js · prisma · docker · aws",
    delayBefore: 500,
  },
  {
    command: "ls ./recent-work",
    response:
      "✓ field-survey.app    [shipped]\n✓ contour-cli         [shipped]\n· terminal-os         [in flight]",
    delayBefore: 500,
  },
  {
    command: "echo $STATUS",
    response: "available for work — Dhaka, BD",
    delayBefore: 500,
  },
];

/* ===== Hero =====
   Pain-point first. The hook word ([FRICTION]) scrambles through related
   nouns — friction → fragility → frustration → re-writes → slow ships.
   Title left, translucent terminal right. The whole composition is locked
   to a single viewport, no scroll needed to "get" it. */
export function Hero() {
  return (
    <section
      id="hero"
      className={cn(
        "relative h-screen min-h-[720px] overflow-hidden p-0 z-50",
        "max-xl:h-auto max-xl:min-h-screen",
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
          )}
        ></div>
      </div>

      <div
        className={cn(
          "page-shell",
          "z-1 flex h-full flex-col justify-between pt-24 pb-9",
          "max-xl:pt-[110px] max-xl:pb-14",
        )}
      >
        <div
          className={cn(
            "grid grid-cols-[1.15fr_0.95fr] items-center gap-[clamp(40px,6vw,96px)]",
            "min-h-0 flex-1",
            "max-xl:grid-cols-1 max-xl:gap-12",
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
                  "text-[clamp(40px,6.4vw,96px)] leading-[1.04] tracking-tight",
                  "text-accent uppercase",
                  "[font-variant-numeric:tabular-nums] whitespace-nowrap",
                  "translate-y-2 opacity-0",
                  "animate-hero-rise delay-300",
                  "max-xl:text-[clamp(36px,9vw,64px)]",
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
                  "max-xl:text-[clamp(48px,12vw,96px)]",
                )}
              >
                <span
                  className={cn(
                    "block translate-y-[0.4em] opacity-0",
                    "animate-hero-rise animation-duration-[1s] delay-[450ms]",
                  )}
                >
                  is not
                </span>
                <span
                  className={cn(
                    "block translate-y-[0.4em] opacity-0",
                    "pl-[clamp(28px,5vw,96px)]",
                    "animate-hero-rise animation-duration-[1s] delay-[600ms]",
                    "max-xl:pl-6",
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
                "opacity-0 animate-hero-fade delay-[900ms]",
                "[&_em]:italic [&_em]:text-accent [&_em]:px-0.5 [&_em]:text-highlight",
              )}
            >
              Full-stack web work for teams who&rsquo;d rather{" "}
              <em>move than rewrite</em>. APIs, dashboards, the seams between
              them — built so they don&rsquo;t show.
            </p>

            <div
              className={cn(
                "flex flex-wrap items-center gap-7",
                "opacity-0 animate-hero-fade delay-[1050ms]",
              )}
            >
              <a
                href="#contact"
                className={cn(
                  "group inline-flex items-center gap-3.5",
                  "px-6 py-4",
                  "bg-accent text-ink border border-accent rounded-xs",
                  "font-mono text-xs tracking-widest uppercase",
                  "transition-[background,color] duration-300",
                  "hover:bg-transparent hover:text-accent",
                )}
              >
                <span>Start a project</span>
                <span
                  className={cn(
                    "inline-block transition-transform duration-300",
                    "group-hover:translate-x-1",
                  )}
                >
                  →
                </span>
              </a>
              <NavLink href="#services" underline>
                How I work
              </NavLink>
            </div>
          </div>

          {/* RIGHT: terminal + Upwork credential beneath it */}
          <div
            className={cn(
              "flex min-w-0 flex-col items-stretch gap-5",
              "max-xl:max-w-[540px]",
            )}
          >
            <Terminal title={TERMINAL_TITLE} lines={TERMINAL_LINES} />
          </div>
        </div>

        <div
          className={cn(
            "flex items-center gap-5",
            "opacity-0 animate-hero-fade delay-[1250ms]",
          )}
        >
          <span
            className={cn(
              "inline-block font-mono text-xs tracking-widest uppercase",
              "text-cream",
              "animate-hero-foot-bob",
            )}
          >
            ↓ Scroll
          </span>
          <span className="h-px w-7 bg-line"></span>
          <span
            className={cn("italic text-sm tracking-[0.005em]", "text-muted")}
          >
            Two years shipping. Seventeen projects merged.
          </span>
        </div>
      </div>
    </section>
  );
}
