import { H2 } from "../ui/H2";
import { VoicesPlayer } from "./voices-player";

/* Voices — video testimonial section. Server-rendered shell; the
   interactive player (video + controls) lives in voices-player.tsx. */

const VIDEO_URL =
  "https://media.tabsircg.com/portfolio/testimonials/client-testimonial-ERIC-Postchart.mov";

export function Voices() {
  return (
    <section
      id="voices"
      className="relative pt-[180px] pb-[160px] max-xl:pt-[130px] max-xl:pb-[120px]"
    >
      <span className="margin-note top-[260px]">
        one minute,
        <br />
        one client.
      </span>

      <div className="page-shell">
        <header className="em-accent grid grid-cols-[0.9fr_1fr] items-end gap-20 mb-16 max-xl:grid-cols-1 max-xl:gap-7">
          <H2>
            <em>In their</em>
            <br />
            own words.
          </H2>
          <p className="text-base leading-[1.6] text-cream-2 max-w-[540px] pb-3 max-xl:pb-0">
            A short walkthrough from Eric at Postchart — the project was a
            custom AI-featured Facebook Page management system with a bulk
            scheduler. Press play.
          </p>
        </header>

        <VoicesPlayer src={VIDEO_URL} />

        {/* Caption row — always visible under the frame. */}
        <div className="flex items-center flex-wrap gap-3.5 mt-[18px] font-mono text-xs tracking-widest uppercase text-muted max-xl:gap-2.5">
          <span className="font-serif italic text-[17px] tracking-normal normal-case text-cream">
            Eric
          </span>
          <span className="text-muted"> · Postchart</span>
          <span
            className="inline-block w-5 h-px bg-line"
            aria-hidden="true"
          ></span>
          <a
            className="inline-flex items-center gap-1.5 text-accent pb-0.5 border-b border-b-transparent transition-[gap,border-color,color] duration-250 hover:gap-2.5 hover:border-b-accent/50 hover:text-cream"
            href="#work"
          >
            See the project<span> ↗</span>
          </a>
          <span className="inline-flex items-center gap-2 text-cream-2 ml-auto max-xl:ml-0">
            <span className="inline-flex items-center justify-center size-3.5 rounded-full bg-phosphor text-ink text-[8px] font-bold leading-none">
              ✓
            </span>
            Verified on Upwork
          </span>
        </div>

        {/* Pull-quote — placeholder text for now, swap with the line from the video */}
        <blockquote className="mt-14 grid grid-cols-[auto_1fr] gap-x-6 items-start max-w-[900px] max-xl:grid-cols-1">
          <span
            className="font-serif text-[96px] leading-[0.7] text-accent opacity-55 pt-1.5 max-xl:text-[56px] max-xl:pb-0"
            aria-hidden="true"
          >
            &ldquo;
          </span>
          <p className="font-serif italic text-[clamp(22px,2.2vw,32px)] leading-[1.32] tracking-tight text-cream text-balance [&_em]:not-italic [&_em]:font-mono [&_em]:text-[0.55em] [&_em]:tracking-widest [&_em]:uppercase [&_em]:text-accent [&_em]:bg-accent/8 [&_em]:px-2 [&_em]:py-0.5 [&_em]:rounded-xs [&_em]:align-[0.18em] [&_em]:mr-1.5">
            <em>[Placeholder]</em> &nbsp;Drop in the strongest line from
            Eric&rsquo;s walkthrough here — the one sentence that sells the
            relationship.
          </p>
        </blockquote>
      </div>
    </section>
  );
}
