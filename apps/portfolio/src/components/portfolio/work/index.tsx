import { cn } from "@/lib/utils";
import { WorkList } from "./list";
import { WorkViewport } from "./viewport";
import { WorkMeta } from "./meta";
import { WorkStateIsland } from "./state-island";

/* Selected work — "The Reel".
   Two-column showcase: project index on the left, viewing window on the
   right. List, viewport and meta are all server-rendered; a tiny client
   island owns active/still as data-* attrs + CSS vars on the section, and
   CSS does the cross-fade + scan-wipe choreography. */
export function Work() {
  return (
    <section
      id="work"
      data-work-section=""
      data-work-active="0"
      data-work-still="0"
      data-work-transit="0"
      style={
        {
          "--work-active": 0,
          "--work-still": 0,
        } as React.CSSProperties
      }
      className={cn(
        "relative pt-[200px] pb-[180px]",
        "bg-[radial-gradient(900px_600px_at_80%_0%,color-mix(in_oklab,var(--color-accent)_3.5%,transparent),transparent_60%),linear-gradient(180deg,transparent,color-mix(in_oklab,var(--color-phosphor)_1.5%,transparent)_70%,transparent)]",
      )}
    >
      <WorkStateIsland />

      <span className="margin-note top-[260px]">
        five recent,
        <br />
        seventeen total.
      </span>

      <div className="page-shell">
        <header
          data-reveal
          className="grid grid-cols-[0.9fr_1fr] items-end gap-20 mb-[72px] max-xl:grid-cols-1 max-xl:gap-8"
        >
          <h2 className="display font-serif text-[clamp(48px,6.4vw,96px)] leading-[0.98] tracking-tight [&>em]:italic [&>em]:text-accent">
            <em>Selected</em>
            <br />
            work.
          </h2>
          <div className="flex flex-col gap-[22px] pb-3">
            <p className="text-base leading-[1.6] text-cream-2 max-w-[480px]">
              Five from the last two years. Quiet UIs, opinionated back-ends,
              and a couple of weekends that quietly turned into demos. Hover the
              index to wander.
            </p>
            <a
              className={cn(
                "inline-flex items-center gap-2.5 w-max font-mono text-xs tracking-widest uppercase text-muted-2 pb-1 border-b border-transparent",
                "transition-[color,gap,border-color] duration-250 ease-out",
                "hover:text-accent hover:gap-3.5 hover:border-b-accent/40",
                "[&_.arrow]:opacity-70",
              )}
            >
              <span>All 17 projects · the full archive</span>
              <span className="arrow">↗</span>
            </a>
          </div>
        </header>

        <div className="grid grid-cols-[0.78fr_1.22fr] gap-14 items-stretch max-xl:grid-cols-1 max-xl:gap-10">
          <WorkList />
          <WorkViewport />
        </div>

        <WorkMeta />
      </div>
    </section>
  );
}
