import { WorkList } from "./list";
import { WorkViewport } from "./viewport";
import { WorkMeta } from "./meta";
import { WorkStateIsland } from "./state-island";
import { H2 } from "@/components/ui/H2";
import { NavLink } from "@/components/ui/nav-link";

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
      className="page-shell"
    >
      <WorkStateIsland />

      <span className="margin-note top-[260px]">
        five recent,
        <br />
        seventeen total.
      </span>

      <header data-reveal className="flex justify-between">
        <H2 className="em-accent">
          <em>Selected</em>
          <br />
          work.
        </H2>
        <div className="flex flex-col gap-4">
          <p className="max-w-md leading-relaxed">
            Five from the last two years. Quiet UIs, opinionated back-ends, and
            a couple of weekends that quietly turned into demos. Hover the index
            to wander.
          </p>
          <NavLink href="#work" underline>
            All 17 projects · the full archive
          </NavLink>
        </div>
      </header>

      <div className="grid grid-cols-[0.78fr_1.22fr] gap-14 max-xl:grid-cols-1 max-xl:gap-10">
        <WorkList />
        <WorkViewport />
      </div>

      <WorkMeta />
    </section>
  );
}
