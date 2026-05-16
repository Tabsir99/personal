"use client";
import { useState, useEffect } from "react";
import { SECTIONS } from "./sections-data";

/* ===== Header ===== */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      const y = window.scrollY + window.innerHeight * 0.4;
      let cur = "hero";
      SECTIONS.forEach((s) => {
        const el = document.getElementById(s.id);
        if (el && el.offsetTop <= y) cur = s.id;
      });
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { id: "about", label: "About", num: "01" },
    { id: "work", label: "Work", num: "03" },
    { id: "stack", label: "Stack", num: "04" },
    { id: "writing", label: "Writing", num: "05" },
    { id: "now", label: "Now", num: "06" },
  ];

  function jumpTo(id: string) {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 40, behavior: "smooth" });
  }

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <a
        href="#hero"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="brand"
      >
        <span style={{ fontStyle: "italic" }}>Tabsir</span>
        <span className="brand-sep">·</span>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "10px",
            letterSpacing: "0.12em",
            color: "var(--muted)",
          }}
        >
          CG
        </span>
      </a>
      <nav className="nav">
        {navItems.map((it) => (
          <a
            key={it.id}
            href={`#${it.id}`}
            data-num={it.num}
            className={active === it.id ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              jumpTo(it.id);
            }}
          >
            {it.label}
          </a>
        ))}
      </nav>
      <a
        href="#contact"
        className="header-cta"
        onClick={(e) => {
          e.preventDefault();
          jumpTo("contact");
        }}
      >
        <span className="pulse"></span>
        Available
      </a>
    </header>
  );
}
