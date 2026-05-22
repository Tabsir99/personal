import { WorkList } from "./list";
import { WorkViewport } from "./viewport";
import { WorkMeta } from "./meta";
import { WorkStateIsland } from "./state-island";
import { H2 } from "@/components/ui/H2";
import { NavLink } from "@/components/ui/nav-link";

/* List/viewport/meta are server-rendered; state-island writes data-*
   + CSS vars on the section, CSS does the cross-fade choreography. */
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
      className="page-shell grid grid-cols-[0.75fr_1.25fr] gap-16 max-xl:grid-cols-1"
    >
      <WorkStateIsland />

      <span className="margin-note top-[260px]">
        five recent,
        <br />
        seventeen total.
      </span>

      <header data-reveal className="flex justify-between col-span-2">
        <H2>
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

      <WorkList />
      <WorkViewport />

      <WorkMeta className="col-span-2 -mt-20" />
    </section>
  );
}
