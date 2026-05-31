import "./styles/header.css";
import { Button } from "../ui/button";
import { SECTIONS } from "./sections-data";

export function Header() {
  return (
    <header
      data-reveal
      className="fixed top-0 left-0 w-dvw z-100 border-b border-line/50 before:content-['']
    before:absolute before:inset-0 before:bg-ink/20 before:backdrop-blur-sm before:w-full before:h-full
    "
    >
      <input
        type="checkbox"
        id="hdr-shell-menu"
        className="hdr-shell__toggle"
      />

      <div className="hdr-shell__inner">
        <a className="hdr-shell__brand" href="#">
          Tabsir CG
        </a>

        <nav className="hdr-shell__nav" aria-label="Primary">
          {SECTIONS.map(({ id, label }) => (
            <a key={id} href={`#${id}`}>
              {label}
              <span className="arr" aria-hidden="true">
                →
              </span>
            </a>
          ))}
        </nav>

        <div className="hdr-shell__actions">
          <span>
            <Button href="#" label="Download CV" />
          </span>

          <label
            className="hdr-shell__burger"
            htmlFor="hdr-shell-menu"
            aria-label="Open menu"
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </label>
        </div>
      </div>

      <div className="hdr-shell__overlay">
        <label
          className="hdr-shell__close"
          htmlFor="hdr-shell-menu"
          aria-label="Close menu"
        >
          ×
        </label>
        <nav className="hdr-shell__menu" aria-label="Mobile">
          {SECTIONS.map(({ id, label }) => (
            <a key={id} className="hdr-shell__mlink" href={`#${id}`}>
              {label}
            </a>
          ))}
          <div className="hdr-shell__mactions">
            <Button href="#" label="Download CV" />
          </div>
        </nav>
      </div>
    </header>
  );
}
