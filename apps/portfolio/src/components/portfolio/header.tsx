import { NavLink } from "@/components/ui/nav-link";
import { SECTIONS } from "./sections-data";
import Image from "next/image";

export function Header() {
  const navItems = SECTIONS.filter((s) => s.inNav);

  return (
    <header
      className="fixed top-[20px] inset-x-0 w-fit mx-auto z-100 flex items-center -translate-y-2 gap-5 rounded-full border border-line py-[6px] pr-[8px] pl-[14px] whitespace-nowrap opacity-0 
     backdrop-blur-xs bg-ink/50 animate-rise-in duration-1000"
    >
      <NavLink
        href="/#hero"
        className="font-serif text-[15px] text-cream tracking-tight"
      >
        <Image
          src="https://media.tabsircg.com/logo.png"
          alt="Tabsir"
          width={32}
          height={32}
        />
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
        className="rounded-full border border-line px-3 py-2 hover:border-accent/50 hover:bg-accent/8"
      >
        Available
      </NavLink>
    </header>
  );
}
