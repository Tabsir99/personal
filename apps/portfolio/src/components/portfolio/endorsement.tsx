import { cn } from "@/lib/utils";
import { NavLink } from "../ui/nav-link";
import { Check } from "lucide-react";

/* ===== Endorsement =====
   Sits between the Hero and the About section as an early-page hook —
   a pulled-quote testimonial with prominent stars and a verified-on-Upwork
   line. Editorial layout: meta column left, big italic quote right,
   generous breathing room. No card chrome, no rotation, no tape — just
   typography on the page so it reads as a real pull quote.    
   --------------------------------------------------------------------- */
export function Endorsement() {
  return (
    <section
      id="endorsement"
      data-reveal
      className={cn(
        "page-shell grid grid-cols-[1fr_2fr] gap-10 max-xl:grid-cols-1",
      )}
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

      {/* Right column — the actual quote + signature */}
      <blockquote className="relative pl-[clamp(24px,3vw,48px)] border-l border-line max-xl:pl-5">
        <p className="font-serif italic text-cream text-[clamp(26px,2.8vw,40px)] leading-[1.22] tracking-tight text-balance">
          <span
            className="absolute font-serif text-accent leading-none pointer-events-none left-[clamp(24px,3vw,48px)] ml-[-0.55em] mt-[-0.15em] text-[1.6em] opacity-50 max-xl:left-5"
            aria-hidden="true"
          >
            &ldquo;
          </span>
          Quick response and attention to detail. Clean, efficient code and
          <em className="px-1 text-accent underline underline-offset-4">
            communication
          </em>
          .
        </p>
        <footer className="flex items-center flex-wrap gap-3.5 mt-[clamp(28px,3vw,40px)] font-mono text-xs tracking-widest uppercase text-muted">
          <span className="text-cream font-medium">Zohaib</span>
          <span> · DataZoro</span>
          <span
            className="inline-block w-5 h-px bg-line"
            aria-hidden="true"
          ></span>
          <span>Mar — Jul 2025</span>
          <span
            className="inline-block w-5 h-px bg-line"
            aria-hidden="true"
          ></span>
          <span className="inline-flex items-center p-2 border border-line rounded-xs text-accent text-xxs tracking-widest">
            Repeat hire
          </span>
        </footer>
      </blockquote>
    </section>
  );
}
