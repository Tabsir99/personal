import type { Testimonial } from "@tabsircg/schemas/portfolio";

import { NavLink } from "../ui/nav-link";
import { Check } from "lucide-react";
import { BlockQuote } from "../ui/BlockQuote";
import { RichText } from "../ui/rich-text";

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
      className="page-shell grid grid-cols-[1fr_2fr] gap-10 border-y border-line items-center max-md:gap-16 max-md:grid-cols-1 max-sm:justify-items-center"
      aria-label={`Client testimonial from ${testimonial.name}${testimonial.company ? ` at ${testimonial.company}` : ""}`}
    >
      <aside className="flex flex-col gap-6 pt-2">
        <div className="eyebrow">
          {testimonial.period
            ? `Repeat client · ${testimonial.period}`
            : "Repeat client"}
        </div>

        <div className="flex items-center gap-4">
          <div
            className="inline-flex gap-1.5 text-accent text-[32px] leading-none text-shadow-accent text-shadow-md"
            aria-hidden="true"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="inline-block">
                {i < testimonial.rating ? "★" : "☆"}
              </span>
            ))}
          </div>
          <div className="inline-flex items-baseline gap-2 font-serif text-cream">
            <span className="text-[clamp(24px,2vw,48px)] italic tracking-tight leading-none">
              {testimonial.rating.toFixed(1)}
            </span>
            <span className="font-mono text-xs tracking-widest uppercase text-muted">
              / 5.0
            </span>
          </div>
        </div>

        <NavLink href="https://www.upwork.com/freelancers/tabsircg" underline>
          <Check className="size-4 self-baseline-last bg-green-500 rounded-full p-1 text-black" />
          <span>Verified on Upwork</span>
        </NavLink>
      </aside>

      <BlockQuote
        author={testimonial.name}
        authorAvatar={testimonial.avatar}
        company={testimonial.company}
      >
        <RichText text={testimonial.text} />
      </BlockQuote>
    </section>
  );
}
