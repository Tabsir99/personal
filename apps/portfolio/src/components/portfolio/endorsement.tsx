import { NavLink } from "../ui/nav-link";
import { Check } from "lucide-react";
import { BlockQuote } from "../ui/BlockQuote";

export function Endorsement() {
  return (
    <section
      id="endorsement"
      data-reveal
      className="page-shell grid grid-cols-[1fr_2fr] gap-10 max-xl:grid-cols-1 border-y border-line"
      aria-label="Client testimonial from Zohaib at DataZoro, verified on Upwork"
    >
      <aside className="flex flex-col gap-7 pt-2">
        <div className="eyebrow">Repeat client · 2025</div>

        <div
          className="inline-flex gap-1.5 text-accent text-[32px] leading-none text-shadow-accent text-shadow-md max-xl:text-[26px] max-xl:gap-1"
          aria-hidden="true"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="inline-block">
              ★
            </span>
          ))}
        </div>
        <div className="inline-flex items-baseline gap-2 font-serif text-cream">
          <span className="text-[36px] italic tracking-tight leading-none max-xl:text-[30px]">
            5.0
          </span>
          <span className="font-mono text-xs tracking-widest uppercase text-muted">
            / 5.0
          </span>
        </div>

        <NavLink href="https://www.upwork.com/" underline>
          <Check className="size-4 self-baseline-last bg-green-500 rounded-full p-1 text-black" />
          <span>Verified on Upwork</span>
        </NavLink>
      </aside>

      <BlockQuote
        author="Zohaib"
        company="DataZoro"
        period="Mar — Jul 2025"
        badge="Repeat hire"
      >
        Quick response and attention to detail. Clean, efficient code and
        <em className="px-1 text-accent underline underline-offset-4">
          communication
        </em>
        .
      </BlockQuote>
    </section>
  );
}
