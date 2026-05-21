import { SECTIONS } from "./sections-data";

const TICK_BASE =
  "absolute left-[-4px] w-[9px] h-px transition-colors duration-400 bg-muted-2 " +
  "[&_.rail-tick-label]:transition-colors [&_.rail-tick-label]:duration-300 " +
  "[&_.rail-tick-label]:text-muted-2 " +
  // Current (carries `is-active` from scroll-island.tsx)
  "[&.is-active_.rail-tick-label]:text-cream " +
  // Past — a later sibling tick has .is-active
  "[&:has(~_[data-rail-tick].is-active)]:bg-accent " +
  "[&:has(~_[data-rail-tick].is-active)_.rail-tick-label]:text-muted";

export function Rail() {
  return (
    <div
      aria-hidden="true"
      className="fixed top-24 bottom-14 left-(--rail-x) w-px z-50 pointer-events-none opacity-0 animate-fade-in duration-1000 delay-500"
    >
      <div className="absolute inset-0 bg-line"></div>
      <div
        id="rail-bar"
        className="absolute top-0 left-0 w-px h-full origin-top will-change-transform bg-accent shadow-[0_0_4px_var(--color-accent),0_0_9px_var(--color-accent),0_0_18px_color-mix(in_oklab,var(--color-accent)_55%,transparent)]"
      ></div>
      {SECTIONS.map((s, index) => (
        <div key={s.id} data-rail-tick data-nav={s.id} className={TICK_BASE}>
          <span className="rail-tick-label absolute left-[22px] font-mono text-xxs tracking-widest uppercase -translate-y-1/2 whitespace-nowrap">
            0{index} — {s.label}
          </span>
        </div>
      ))}

      <div
        id="rail-dot"
        className="absolute top-0 left-0 h-full will-change-transform"
      >
        <span className="absolute rounded-full left-[-2.5px] size-1.5 -translate-y-1/2 bg-accent shadow-[0_0_6px_var(--color-accent)]" />
      </div>
    </div>
  );
}
