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
        "page-shell min-h-dvh overflow-hidden z-50",
        "grid grid-cols-[2fr_1.4fr] gap-16",
        "items-center",
      )}
    >
      <div className="min-w-0">
        <h1 className="m-0 mb-7 flex flex-col text-balance font-serif">
          <span
            className={cn(
              "inline-flex items-baseline gap-1 font-mono font-medium",
              "text-[clamp(40px,6.4vw,96px)] leading-[1.04] tracking-tight",
              "text-accent uppercase",
              "whitespace-nowrap",
              "translate-y-2 opacity-0",
              "animate-rise-in delay-300",
              "max-xl:text-[clamp(36px,9vw,64px)]",
            )}
          >
            <span className="text-accent-2 opacity-70">[</span>
            <ScrambleWord
              words={[
                "FRICTION",
                "FRAGILITY",
                "FRUSTRATION",
                "RE-WRITES",
                "SLOW SHIPS",
              ]}
            />

            <span className="text-accent-2 opacity-70">]</span>
          </span>

          <span
            className={cn(
              "mt-1.5 flex flex-col",
              "text-[clamp(56px,9vw,130px)] leading-[0.92] tracking-[-0.035em]",
              "text-cream",
              "max-xl:text-[clamp(48px,12vw,96px)]",
            )}
          >
            <span className="block translate-y-[0.4em] opacity-0 animate-rise-in animation-duration-[1s] delay-500">
              is not
            </span>
            <span
              className={cn(
                "em-accent block translate-y-[0.4em] opacity-0",
                "pl-[clamp(28px,5vw,96px)] max-xl:pl-6",
                "animate-rise-in animation-duration-[1s] delay-600",
              )}
            >
              a <em>feature.</em>
            </span>
          </span>
        </h1>

        <p
          className={cn(
            "em-accent",
            "text-[clamp(17px,1.55vw,22px)] leading-[1.45]",
            "text-cream-2 mt-9 mb-11 max-w-[52ch]",
            "opacity-0 animate-fade-in delay-800",
          )}
        >
          Full-stack web work for teams who&rsquo;d rather{" "}
          <em className="underline underline-offset-2">move than rewrite</em>.
          APIs, dashboards, the seams between them — built so they don&rsquo;t
          show.
        </p>

        <div className="flex flex-wrap items-center gap-7 opacity-0 animate-fade-in delay-1000">
          <a
            href="#contact"
            className={cn(
              "group inline-flex items-center gap-3.5 px-6 py-4",
              "bg-accent text-ink border border-accent rounded-xs",
              "font-mono text-xs tracking-widest uppercase",
              "transition-[background,color] duration-300",
              "hover:bg-transparent hover:text-accent",
            )}
          >
            <span>Start a project</span>
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
          <NavLink href="#services" underline>
            How I work
          </NavLink>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-5 max-xl:max-w-[540px]">
        <Terminal title={TERMINAL_TITLE} lines={TERMINAL_LINES} />
      </div>

      <div className="flex items-center gap-5 text-sm  self-end">
        <span className="inline-block font-mono uppercase">↓ Scroll</span>
        <span className="font-serif italic text-muted">
          Two years shipping. Seventeen projects merged.
        </span>
      </div>
    </section>
  );
}
