import { cn } from "@/lib/utils";
import { NavLink } from "@/components/ui/nav-link";

export function Footer() {
  return (
    <footer
      id="contact"
      className="relative pt-[180px] pb-[60px] border-t border-line bg-[linear-gradient(180deg,transparent,color-mix(in_oklab,black_40%,transparent))]"
    >
      <div className="page-shell">
        <div
          data-reveal
          className={cn(
            "inline-flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted before:content-[''] before:w-6 before:h-px before:bg-muted",
            "mb-10",
          )}
        >
          Currently taking projects · Q3 2026
        </div>
        <h2
          data-reveal
          className={cn(
            "font-serif font-normal font-features-['liga','kern']",
            "text-[clamp(72px,13vw,220px)] leading-[0.88] tracking-[-0.03em] mb-20",
          )}
        >
          <span className="[-webkit-text-stroke:1px_var(--color-cream)] text-transparent">
            Let&apos;s build
          </span>
          <br />
          <em className="italic text-accent">something</em>
          <span className="text-muted"> small,</span>
          <br />
          <span className="text-muted">sturdy,</span> &amp;{" "}
          <em className="italic text-accent">true.</em>
        </h2>
        <NavLink
          href="mailto:hello@tabsircg.com"
          data-reveal
          className="group gap-4 px-7 py-[18px] border border-cream rounded-xs tracking-widest uppercase text-cream mb-[120px] transition-all duration-300 hover:bg-accent hover:border-accent hover:text-ink"
        >
          hello@tabsircg.com
          <span className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
            ↗
          </span>
        </NavLink>
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] max-xl:grid-cols-2 gap-[60px] pt-[60px] border-t border-line [&_h3]:font-mono [&_h3]:text-xxs [&_h3]:tracking-widest [&_h3]:uppercase [&_h3]:text-muted [&_h3]:mb-[18px] [&_h3]:font-normal">
          <div>
            <h3>Studio</h3>
            <p className="text-sm text-cream mb-2 leading-normal">
              Tabsir CG · Independent practice
            </p>
            <p className="text-sm text-muted leading-normal">
              Apt 4B, Banani Road 11
              <br />
              Dhaka 1213, Bangladesh
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h3>Direct</h3>
            <NavLink href="mailto:hello@tabsircg.com">
              hello@tabsircg.com
            </NavLink>
            <NavLink>
              +880 17 ████ ████{" "}
              <span className="text-muted-2 text-xxs">(on request)</span>
            </NavLink>
            <NavLink>Cal.com / tabsir</NavLink>
          </div>
          <div className="flex flex-col gap-3">
            <h3>Elsewhere</h3>
            <NavLink>GitHub</NavLink>
            <NavLink>Read.cv</NavLink>
            <NavLink>Bluesky</NavLink>
            <NavLink>LinkedIn</NavLink>
          </div>
          <div className="flex flex-col gap-3">
            <h3>Work with me</h3>
            <NavLink>Full project (~6 wks +)</NavLink>
            <NavLink>Sprint engagement (1–2 wks)</NavLink>
            <NavLink>Advisory retainer</NavLink>
            <NavLink>Code-review on call</NavLink>
          </div>
        </div>
        <div className="mt-20 pt-8 border-t border-line flex justify-between items-center">
          <span className="font-mono text-xxs tracking-widest text-muted-2">
            © 2026 · Tabsir CG · v2.6 · No tracking
          </span>
          <NavLink href="#hero">↑ back to top</NavLink>
        </div>
      </div>
    </footer>
  );
}
