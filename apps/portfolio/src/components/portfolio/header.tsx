"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
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

  return (
    <header
      className={cn(
        "fixed top-[20px] left-1/2 z-100 inline-flex -translate-x-1/2 -translate-y-2 items-center gap-5 rounded-full border py-[6px] pr-[8px] pl-[14px] whitespace-nowrap opacity-0 shadow-[0_10px_40px_color-mix(in_oklab,black_45%,transparent),inset_0_1px_0_color-mix(in_oklab,white_3%,transparent)] backdrop-blur-[20px] backdrop-saturate-180",
        "bg-ink/78 transition-[border-color,background] duration-300 ease-linear",
        "animate-header-in",
        scrolled ? "border-accent/18" : "border-line",
      )}
    >
      <a
        href="/#hero"
        className="flex items-center gap-2 font-serif text-[15px] tracking-[-0.01em]"
      >
        <span className="italic">Tabsir</span>
        <span className="text-[11px] text-muted-2">·</span>
        <span className="font-mono text-[10px] tracking-[0.12em] text-muted">
          CG
        </span>
      </a>
      <nav className="ml-1 flex gap-[18px] border-l border-line py-0 pr-1 pl-2 font-mono text-[10.5px] tracking-[0.06em] max-[1100px]:hidden">
        {navItems.map((it) => (
          <a
            key={it.id}
            href={`#${it.id}`}
            data-num={it.num}
            className={cn(
              "relative inline-flex items-center gap-[5px] transition-colors duration-200",
              "before:mr-0 before:text-[8px] before:content-[attr(data-num)]",
              active === it.id
                ? "text-cream before:text-accent"
                : "text-muted before:text-muted-2 hover:text-cream",
            )}
          >
            {it.label}
          </a>
        ))}
      </nav>
      <a
        href="#contact"
        className="inline-flex items-center gap-[7px] rounded-full border border-line px-3 py-[6px] font-mono text-[9.5px] tracking-[0.08em] uppercase transition-all duration-200 hover:border-accent hover:bg-accent/8"
      >
        <span className="h-[6px] w-[6px] animate-pulse-soft rounded-full bg-phosphor shadow-[0_0_8px_var(--color-phosphor)]"></span>
        Available
      </a>
    </header>
  );
}
