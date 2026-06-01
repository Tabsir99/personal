import Image from "next/image";
import { cn } from "@/lib/utils";
import { splitAccent } from "@/components/ui/rich-text";
import { NavLink } from "../ui/nav-link";

const portraitMask =
  "radial-gradient(ellipse at center, #000 38%, transparent 100%)";

const desc = `I built a Facebook scheduling platform that's been live a year —
real users, real payments, hundreds of pages, ::built solo.::
React and Node, plus the reliability work most people skip.`;

export function Hero({ photo }: { photo: string }) {
  let w = 0;
  let sw = 0;
  const headlineLines = [
    { text: "I ship things that", accent: false },
    { text: "stay shipped.", accent: true },
  ];

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
        <h1
          data-hero-rise
          className="h-serif m-0 mb-7 text-cream text-[clamp(3rem,10vw,7rem)] leading-[0.9]"
        >
          {headlineLines.map((line, li) => (
            <span
              key={li}
              className={cn("block", line.accent && "italic text-accent")}
            >
              {line.text.split(" ").map((word) => {
                const i = w++;
                return (
                  <span key={i} className="word">
                    <span style={{ "--i": i } as React.CSSProperties}>
                      {word}
                    </span>
                  </span>
                );
              })}
            </span>
          ))}
        </h1>

        <p
          data-reveal-words
          className={cn(
            "text-[clamp(16px,1.5vw,22px)] leading-[1.45]",
            "text-cream-2 mt-9 mb-11 max-w-[52ch]",
          )}
        >
          {splitAccent(desc).flatMap((seg) =>
            seg.text
              .split(" ")
              .filter(Boolean)
              .map((word) => {
                const i = sw++;
                return (
                  <span
                    key={i}
                    className="word"
                    style={{ "--word-i": i } as React.CSSProperties}
                  >
                    {seg.accent ? (
                      <em className="text-accent italic">{word}</em>
                    ) : (
                      word
                    )}
                  </span>
                );
              }),
          )}
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
          {photo && (
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
          )}
        </div>
      </div>

      <span className="inline-block font-mono uppercase text-xs self-end opacity-75">
        ↓ Scroll
      </span>
    </section>
  );
}
