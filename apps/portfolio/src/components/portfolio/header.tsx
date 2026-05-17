import { cn } from "@/lib/utils";

/* ===== Header — server-rendered =====
   All scroll-driven state comes from [components/ui/active-section.tsx]:
   `.is-active` on the matching `[data-nav]` link, plus `data-scrolled`
   on `<html>` (read by the border-color variant below). */
export function Header() {
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
        "border-line",
        "[html[data-scrolled]_&]:border-accent/18",
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
            data-nav={it.id}
            data-num={it.num}
            className={cn(
              "relative inline-flex items-center gap-[5px] transition-colors duration-200",
              "before:mr-0 before:text-[8px] before:content-[attr(data-num)]",
              "text-muted before:text-muted-2 hover:text-cream",
              "[&.is-active]:text-cream [&.is-active]:before:text-accent",
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
