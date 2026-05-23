import type { Testimonial } from "@tabsircg/schemas/portfolio";

import { NavLink } from "../ui/nav-link";
import { Check } from "lucide-react";
import { BlockQuote } from "../ui/BlockQuote";

export function Endorsement({
  testimonial,
}: {
  testimonial: Testimonial | undefined;
}) {
  if (!testimonial) return null;

  return (
    <section
      id="endorsement"
      data-reveal
      className="page-shell grid grid-cols-[1fr_2fr] gap-10 max-xl:grid-cols-1 border-y border-line"
      aria-label={`Client testimonial from ${testimonial.name}${testimonial.company ? ` at ${testimonial.company}` : ""}`}
    >
      <aside className="flex flex-col gap-7 pt-2">
        <div className="eyebrow">
          {testimonial.period
            ? `Repeat client · ${testimonial.period}`
            : "Repeat client"}
        </div>

        <div
          className="inline-flex gap-1.5 text-accent text-[32px] leading-none text-shadow-accent text-shadow-md max-xl:text-[26px] max-xl:gap-1"
          aria-hidden="true"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="inline-block">
              {i < testimonial.rating ? "★" : "☆"}
            </span>
          ))}
        </div>
        <div className="inline-flex items-baseline gap-2 font-serif text-cream">
          <span className="text-[36px] italic tracking-tight leading-none max-xl:text-[30px]">
            {testimonial.rating.toFixed(1)}
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
        author={testimonial.name}
        company={testimonial.company}
        period={testimonial.period}
        badge="Repeat hire"
      >
        {testimonial.text}
      </BlockQuote>
    </section>
  );
}
