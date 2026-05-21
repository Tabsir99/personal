import { NavLink } from "@/components/ui/nav-link";
import { SECTIONS } from "./sections-data";

export function Header() {
  const navItems = SECTIONS.filter((s) => s.inNav);

  return (
    <header className="fixed top-[20px] left-1/2 z-100 inline-flex -translate-x-1/2 -translate-y-2 items-center gap-5 rounded-full border border-line py-[6px] pr-[8px] pl-[14px] whitespace-nowrap opacity-0 shadow-[0_10px_40px_color-mix(in_oklab,black_45%,transparent),inset_0_1px_0_color-mix(in_oklab,white_3%,transparent)] backdrop-blur-[20px] backdrop-saturate-180 bg-ink/78 transition-[border-color,background] duration-300 ease-linear animate-rise-in animation-duration-[700ms] delay-[50ms] [--rise-x:-50%] [html[data-scrolled]_&]:border-accent/18">
      <NavLink
        href="/#hero"
        className="font-serif text-[15px] text-cream tracking-tight"
      >
        <span className="italic">Tabsir</span>
        <span className="text-xs text-muted-2">·</span>
        <span className="font-mono text-xxs tracking-widest text-muted">
          CG
        </span>
      </NavLink>
      <nav
        aria-label="Sections"
        className="flex gap-5 border-l border-line pr-1 pl-2 max-xl:hidden"
      >
        {navItems.map((it) => (
          <NavLink key={it.id} href={`#${it.id}`} data-nav={it.id}>
            {it.label}
          </NavLink>
        ))}
      </nav>
      <NavLink
        href="#contact"
        className="rounded-full border border-line px-3 py-[6px] uppercase tracking-widest text-xxs hover:border-accent hover:bg-accent/8"
      >
        <span className="size-1.5 animate-pulse rounded-full bg-phosphor shadow-[0_0_8px_var(--color-phosphor)]"></span>
        Available
      </NavLink>
    </header>
  );
}
