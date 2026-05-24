import type { Testimonial } from "@tabsircg/schemas/portfolio";

import { BlockQuote } from "../ui/BlockQuote";
import { H2 } from "../ui/H2";
import { VoicesPlayer } from "./voices-player";

export function Voices({
  testimonial,
}: {
  testimonial: Testimonial | undefined;
}) {
  if (!testimonial || !testimonial.video) return null;

  return (
    <section id="voices" className="page-shell flex flex-col gap-12">
      <span className="margin-note top-[260px]">
        one minute,
        <br />
        one client.
      </span>

      <header className="flex justify-between em-accent">
        <H2>
          <em>In their</em>
          <br />
          own words.
        </H2>
        <p className="max-w-md">{testimonial.text}</p>
      </header>

      <VoicesPlayer
        src={testimonial.video}
        label={
          testimonial.company
            ? `${testimonial.name} · ${testimonial.company}`
            : testimonial.name
        }
        className="aspect-video h-auto"
      />

      <BlockQuote
        author={testimonial.name}
        company={testimonial.company}
        period={testimonial.period}
        className="em-accent"
      >
        {testimonial.text}
      </BlockQuote>
    </section>
  );
}
