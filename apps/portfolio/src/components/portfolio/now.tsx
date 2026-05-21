/* ===== Now ===== */

import { H2 } from "../ui/H2";

const NOW_ITEMS: { label: string; body: React.ReactNode }[] = [
  {
    label: "Building",
    body: (
      <>
        <strong>Lumen Stack</strong> — an observability dashboard built for solo
        founders and 2-person infra teams.
        <span className="muted">
          {" "}
          Currently in private beta with eight teams. Public launch later this
          summer.
        </span>
      </>
    ),
  },
  {
    label: "Working with",
    body: (
      <>
        A small fintech in <strong>Singapore</strong> on their treasury console,
        and a design studio in
        <strong> Berlin</strong> on the front-end for a publishing platform.
      </>
    ),
  },
  {
    label: "Reading",
    body: (
      <>
        <em className="font-serif text-lg">
          Designing Data-Intensive Applications
        </em>
        <span className="muted"> — on round two. </span>
        <em className="font-serif text-lg">The Pragmatic Engineer</em>
        <span className="muted"> newsletter, faithfully.</span>
      </>
    ),
  },
  {
    label: "Learning",
    body: (
      <>
        Going deeper on <strong>Rust</strong> for back-end services. Re-learning
        DSP for an audio side-project nobody asked for.
      </>
    ),
  },
  {
    label: "Listening",
    body: (
      <>
        Lots of <strong>ambient + dub techno</strong> while I code. Currently
        rotating: Burial, Loraine James,
        <span className="muted">
          {" "}
          and a suspicious amount of lo-fi jazz radio.
        </span>
      </>
    ),
  },
  {
    label: "Not doing",
    body: (
      <>
        Twitter, mostly. Saying &ldquo;yes&rdquo; to projects that smell like
        scope creep. Coffee after 4pm.
      </>
    ),
  },
];

export function Now() {
  return (
    <section
      id="now"
      className="page-shell grid grid-cols-[1fr_1.5fr] gap-10 max-xl:grid-cols-1 items-start"
    >
      <div data-reveal className="sticky top-24 space-y-6">
        <H2>
          What I&apos;m into
          <br />
          <em className="italic text-accent">right now.</em>
        </H2>

        <div className="inline-flex items-center gap-[10px] font-mono text-xs uppercase tracking-widest px-[14px] py-2 border border-line rounded-xs bg-ink-2">
          Updated · May 2026
        </div>
      </div>
      <div data-reveal-stagger className="flex flex-col gap-10">
        {NOW_ITEMS.map((item, i) => (
          <div
            key={item.label}
            style={{ "--i": i } as React.CSSProperties}
            className="border-t border-line pt-7 grid grid-cols-[140px_1fr] gap-10"
          >
            <div className="font-mono text-xxs uppercase tracking-widest text-muted">
              {item.label}
            </div>
            <div className="text-cream [&_strong]:font-normal [&_strong]:text-accent [&_.muted]:text-muted">
              {item.body}
            </div>
          </div>
        ))}
        <div
          style={{ "--i": 6 } as React.CSSProperties}
          className="font-mono text-xxs text-muted-2 mt-3 tracking-widest"
        >
          / inspired by Derek Sivers · /now-page movement
        </div>
      </div>
    </section>
  );
}
