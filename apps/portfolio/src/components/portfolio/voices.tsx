import { BlockQuote } from "../ui/BlockQuote";
import { H2 } from "../ui/H2";
import { VoicesPlayer } from "./voices-player";

const VIDEO_URL =
  "https://media.tabsircg.com/portfolio/testimonials/client-testimonial-ERIC-Postchart.mov";

export function Voices() {
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
        <p className="max-w-md">
          A short walkthrough from Eric at Postchart — the project was a custom
          AI-featured Facebook Page management system with a bulk scheduler.
          Press play.
        </p>
      </header>

      <VoicesPlayer src={VIDEO_URL} />

      <BlockQuote
        author="Eric Bihr"
        company="Postchart"
        period="Mar — Jul 2025"
        className="em-accent"
      >
        <em>[Placeholder]</em> &nbsp;Drop in the strongest line from
        Eric&rsquo;s walkthrough here — the one sentence that sells the
        relationship. .
      </BlockQuote>
    </section>
  );
}
