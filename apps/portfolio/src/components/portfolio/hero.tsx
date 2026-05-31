import Image from "next/image";
import { ScrambleWord } from "./scramble-word";
import { cn } from "@/lib/utils";
import { NavLink } from "../ui/nav-link";

const portraitMask =
  "radial-gradient(ellipse at center, #000 38%, transparent 100%)";

export function Hero({ photo }: { photo: string }) {
  return (
    <section
      id="hero"
      className={cn(
        "page-shell min-h-dvh overflow-hidden z-50",
        "grid grid-cols-[2fr_1.4fr] gap-16 max-md:grid-cols-1",
        "items-center pt-36",
      )}
    >
      <div className="min-w-0">
        <h1 className="m-0 mb-7 flex flex-col text-balance font-serif">
          <span
            data-hero-word
            className={cn(
              "inline-flex items-baseline gap-[0.04em] font-mono font-medium",
              "text-[clamp(46px,6vw,96px)] leading-[1.04] tracking-tight",
              "text-accent uppercase",
              "whitespace-nowrap",
            )}
          >
            <span data-hero-bracket="l" className="text-accent-2 opacity-70">
              [
            </span>
            <span className="inline-block min-w-[11ch] text-center">
              <ScrambleWord
                words={[
                  "FRICTION",
                  "FRAGILITY",
                  "FRUSTRATION",
                  "RE-WRITES",
                  "SLOW SHIPS",
                ]}
                delay={6000}
              />
            </span>

            <span data-hero-bracket="r" className="text-accent-2 opacity-70">
              ]
            </span>
          </span>

          <span
            className={cn(
              "mt-1.5 flex flex-col",
              "text-[clamp(68px,9vw,130px)] leading-[0.92] tracking-[-0.035em]",
              "text-cream",
            )}
          >
            <span
              className="block translate-y-[0.4em] opacity-0 animate-rise-in animation-duration-[1s]"
              style={{ animationDelay: "calc(var(--hero-stagger) + 100ms)" }}
            >
              is not
            </span>
            <span
              className={cn(
                "em-accent block translate-y-[0.4em] opacity-0",
                "pl-[clamp(40px,5vw,96px)]",
                "animate-rise-in duration-1000",
              )}
              style={{ animationDelay: "calc(var(--hero-stagger) + 200ms)" }}
            >
              a <em>feature.</em>
            </span>
          </span>
        </h1>

        <p
          className={cn(
            "em-accent",
            "text-[clamp(16px,1.5vw,22px)] leading-[1.45]",
            "text-cream-2 mt-9 mb-11 max-w-[52ch]",
            "opacity-0 animate-fade-in",
          )}
          style={{ animationDelay: "calc(var(--hero-stagger) + 300ms)" }}
        >
          Full-stack web work for teams who&rsquo;d rather{" "}
          <em className="underline underline-offset-2">move than rewrite</em>.
          APIs, dashboards, the seams between them — built so they don&rsquo;t
          show.
        </p>

        <div
          className="flex flex-wrap items-center  gap-7 opacity-0 animate-fade-in"
          style={{ animationDelay: "calc(var(--hero-stagger) + 400ms)" }}
        >
          <a
            href="#contact"
            className={cn(
              "group inline-flex items-center gap-3 px-6 py-4 max-lg:px-4 max-lg:text-xxs max-lg:py-3",
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
          <NavLink href="#services" underline className="max-lg:text-xxs">
            How I work
          </NavLink>
        </div>
      </div>

      <div
        className="relative w-full opacity-0 animate-rise-in duration-1000"
        style={{ animationDelay: "calc(var(--hero-stagger) + 300ms)" }}
      >
        <div className="relative aspect-square">
          <Image
            src={photo}
            alt="Tabsir"
            fill
            priority
            sizes="(max-width: 1280px) 50vw, 400px"
            className="object-cover object-[50%_20%]"
            style={{
              WebkitMaskImage: portraitMask,
              maskImage: portraitMask,
            }}
          />
        </div>
      </div>

      <span className="inline-block font-mono uppercase text-xs self-end opacity-75">
        ↓ Scroll
      </span>
    </section>
  );
}
