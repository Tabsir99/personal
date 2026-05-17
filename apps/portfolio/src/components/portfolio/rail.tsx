import { cn } from "@/lib/utils";
import { SECTIONS } from "./sections-data";

/* ===== Persistent left rail — server-rendered =====
   All scroll-driven state comes from [components/ui/active-section.tsx]:
   - Tick position: `--rail-pos-<id>` per section (one-time + resize)
   - Active tick: `.is-active` toggled on `[data-nav={id}]` matches
   - Scroll fill bar / breath dot: `--scroll-progress` (0-100)
   - Past tick coloring: CSS `:has(~ [data-rail-tick].is-active)` */
export function Rail() {
  return (
    <div
      className={cn(
        "fixed top-24 bottom-14 left-(--rail-x) w-px z-50 pointer-events-none",
        "opacity-0 animate-rail-in",
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-line"></div>
      <div className="absolute left-[-3px] top-[-3px] w-[7px] h-[7px] border border-muted-2 rounded-full bg-ink"></div>
      <div className="absolute left-[-3px] bottom-[-3px] w-[7px] h-[7px] border border-muted-2 rounded-full bg-ink"></div>
      <div
        className={cn(
          "absolute top-0 left-0 w-px h-0 bg-accent",
          "shadow-[0_0_8px_color-mix(in_oklab,var(--color-accent)_35%,transparent)]",
          "transition-[height] duration-60 ease-linear",
        )}
        style={{ height: "calc(var(--scroll-progress, 0) * 1%)" }}
      ></div>
      {SECTIONS.map((s) => (
        <div
          key={s.id}
          data-rail-tick
          data-nav={s.id}
          className={cn(
            "absolute left-[-4px] w-[9px] h-px transition-colors duration-400 ease-[ease]",
            "[&_.rail-tick-label]:transition-colors [&_.rail-tick-label]:duration-300 [&_.rail-tick-label]:ease-[ease]",
            // Future (default)
            "bg-muted-2 [&_.rail-tick-label]:text-muted-2",
            // Current
            "[&.is-active_.rail-tick-label]:text-cream",
            // Past — a later sibling tick has .is-active
            "[&:has(~_[data-rail-tick].is-active)]:bg-accent",
            "[&:has(~_[data-rail-tick].is-active)_.rail-tick-label]:text-muted",
          )}
          style={{ top: `var(--rail-pos-${s.id}, 0%)` }}
        >
          <span
            className={cn(
              "rail-tick-label",
              "absolute left-[22px] font-mono text-[9px] tracking-[0.15em] uppercase",
              "-translate-y-1/2 whitespace-nowrap",
            )}
          >
            {s.label}
          </span>
        </div>
      ))}
      <div
        className={cn(
          "absolute left-[-3px] w-[7px] h-[7px] bg-accent rounded-full",
          "shadow-[0_0_14px_color-mix(in_oklab,var(--color-accent)_70%,transparent)]",
          "-translate-y-1/2 transition-[top] duration-60 ease-linear animate-rail-breath",
          "after:content-[''] after:absolute after:left-[12px] after:top-1/2",
          "after:w-[22px] after:h-px after:bg-accent after:-translate-y-1/2 after:opacity-50",
        )}
        style={{ top: "calc(var(--scroll-progress, 0) * 1%)" }}
      ></div>
    </div>
  );
}
