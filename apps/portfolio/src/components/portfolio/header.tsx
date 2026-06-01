import "./styles/header.css";
import type { Resume } from "@tabsircg/schemas/portfolio";
import { Button } from "../ui/button";
import { SECTIONS } from "./sections-data";

export function Header({ resume }: { resume?: Resume }) {
  return (
    <>
      {/* Toggle + overlay sit OUTSIDE <header> on purpose: the header carries a
          transform (from data-reveal), and a transformed ancestor becomes the
          containing block for position:fixed children — which would trap the
          overlay inside the 80px bar instead of letting it cover the viewport.
          Kept as siblings so the `:checked ~ .hdr-shell__overlay` reveal works. */}
      <input
        type="checkbox"
        id="hdr-shell-menu"
        className="hdr-shell__toggle pointer-events-none absolute h-px w-px opacity-0"
      />

      <header
        data-reveal
        className="fixed top-0 left-0 z-100 w-dvw border-b border-line/50 before:absolute before:inset-0 before:h-full before:w-full before:bg-ink/20 before:backdrop-blur-sm before:content-['']"
      >
        <div className="relative z-2 mx-auto flex h-20 max-w-(--max-w) items-center gap-6 px-5 lg:gap-16 lg:px-14">
          <a
            data-brand
            className="flex-none font-mono text-xl leading-none tracking-tighter text-cream transition-colors duration-200 ease-soft hover:text-accent"
            href="#"
          >
            Tabsir<span className="text-accent">CG</span>
          </a>

          <nav
            className="hidden h-7.5 items-center gap-8 font-mono lg:flex"
            aria-label="Primary"
          >
            {SECTIONS.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className="group relative inline-flex items-center gap-1 text-xs tracking-wide text-muted transition-colors duration-200 ease-soft hover:text-cream after:absolute after:left-0 after:-bottom-2 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 after:ease-soft after:content-[''] hover:after:scale-x-100"
              >
                {label}
                <span
                  className="-translate-x-1 text-xs text-accent opacity-0 transition duration-200 ease-soft group-hover:translate-x-0 group-hover:opacity-100"
                  aria-hidden="true"
                >
                  →
                </span>
              </a>
            ))}
          </nav>

          <div className="ml-auto flex flex-none items-center gap-3.5">
            {resume?.url && (
              <span className="hidden lg:block">
                <Button
                  href={resume.url}
                  label="Download CV"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...(resume.filename ? { download: resume.filename } : {})}
                />
              </span>
            )}

            <label
              className="hdr-shell__burger relative z-3 -mr-2 flex size-11 cursor-pointer flex-col items-center justify-center gap-1.5 lg:hidden"
              htmlFor="hdr-shell-menu"
              aria-label="Open menu"
            >
              <span className="h-px w-6.5 bg-cream"></span>
              <span className="h-px w-6.5 bg-cream"></span>
              <span className="h-px w-6.5 bg-cream"></span>
            </label>
          </div>
        </div>
      </header>

      <div className="hdr-shell__overlay fixed inset-0 z-110 flex flex-col items-center justify-center bg-ink p-5 sm:p-10 lg:hidden">
        <label
          className="hdr-shell__close absolute top-6.5 right-5 flex size-11 cursor-pointer items-center justify-center font-mono text-2xl text-muted transition duration-300 ease-soft hover:rotate-90 hover:text-accent sm:right-10"
          htmlFor="hdr-shell-menu"
          aria-label="Close menu"
        >
          ×
        </label>
        <nav className="flex w-full flex-col items-center" aria-label="Mobile">
          {SECTIONS.map(({ id, label }) => (
            <a
              key={id}
              className="hdr-shell__mlink flex h-20 items-center justify-center font-serif text-5xl leading-none tracking-tight text-cream transition-colors duration-200 ease-soft hover:text-accent sm:text-6xl"
              href={`#${id}`}
            >
              {label}
            </a>
          ))}
          {resume?.url && (
            <div className="hdr-shell__mactions mt-6 flex flex-wrap justify-center gap-3.5">
              <Button
                href={resume.url}
                label="Download CV"
                target="_blank"
                rel="noopener noreferrer"
                {...(resume.filename ? { download: resume.filename } : {})}
              />
            </div>
          )}
        </nav>
      </div>
    </>
  );
}
