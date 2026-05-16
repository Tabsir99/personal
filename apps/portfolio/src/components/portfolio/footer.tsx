import { cn } from "@/lib/utils";

export function Footer() {
  return (
    <footer
      id="contact"
      className="relative pt-[180px] pb-[60px] border-t border-line bg-[linear-gradient(180deg,transparent,color-mix(in_oklab,black_40%,transparent))]"
      data-screen-label="08 Contact"
    >
      <div className={"container"}>
        <div
          data-reveal
          className={cn(
            "inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted before:content-[''] before:w-6 before:h-px before:bg-muted",
            "mb-10",
          )}
        >
          Currently taking projects · Q3 2026
        </div>
        <h2
          data-reveal
          className={cn(
            "font-serif font-normal leading-[0.96] tracking-[-0.02em] font-features-['liga','kern']",
            "text-[clamp(72px,13vw,220px)] leading-[0.88]! tracking-[-0.03em] mb-20",
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
        <a
          href="mailto:hello@tabsircg.com"
          data-reveal
          className="group inline-flex items-center gap-4 px-7 py-[18px] border border-cream rounded-[2px] font-mono text-[12px] tracking-[0.14em] uppercase mb-[120px] transition-all duration-300 hover:bg-accent hover:border-accent hover:text-ink"
        >
          hello@tabsircg.com
          <span className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
            ↗
          </span>
        </a>
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] max-[1100px]:grid-cols-2 gap-[60px] pt-[60px] border-t border-line [&_h5]:font-mono [&_h5]:text-[10px] [&_h5]:tracking-[0.16em] [&_h5]:uppercase [&_h5]:text-muted [&_h5]:mb-[18px] [&_h5]:font-normal">
          <div>
            <h5>Studio</h5>
            <p className="block text-[14px] text-cream mb-2 leading-normal">
              Tabsir CG · Independent practice
            </p>
            <p className="block text-[13px] text-muted mb-2 leading-normal">
              Apt 4B, Banani Road 11
              <br />
              Dhaka 1213, Bangladesh
            </p>
          </div>
          <div className="[&_a]:flex [&_a]:items-center [&_a]:gap-2 [&_a]:font-mono [&_a]:text-[12px] [&_a]:text-cream [&_a]:mb-2 [&_a]:leading-normal [&_a]:transition-colors [&_a]:duration-200 [&_a:hover]:text-accent">
            <h5>Direct</h5>
            <a href="mailto:hello@tabsircg.com">hello@tabsircg.com</a>
            <a href="#">
              +880 17 ████ ████{" "}
              <span className="text-muted-2 text-[10px]">(on request)</span>
            </a>
            <a href="#">Cal.com / tabsir</a>
          </div>
          <div className="[&_a]:flex [&_a]:items-center [&_a]:gap-2 [&_a]:font-mono [&_a]:text-[12px] [&_a]:text-cream [&_a]:mb-2 [&_a]:leading-normal [&_a]:transition-colors [&_a]:duration-200 [&_a:hover]:text-accent">
            <h5>Elsewhere</h5>
            <a href="#">
              GitHub <span className="text-muted-2 text-[10px]">↗</span>
            </a>
            <a href="#">
              Read.cv <span className="text-muted-2 text-[10px]">↗</span>
            </a>
            <a href="#">
              Bluesky <span className="text-muted-2 text-[10px]">↗</span>
            </a>
            <a href="#">
              LinkedIn <span className="text-muted-2 text-[10px]">↗</span>
            </a>
          </div>
          <div className="[&_a]:flex [&_a]:items-center [&_a]:gap-2 [&_a]:font-mono [&_a]:text-[12px] [&_a]:text-cream [&_a]:mb-2 [&_a]:leading-normal [&_a]:transition-colors [&_a]:duration-200 [&_a:hover]:text-accent">
            <h5>Work with me</h5>
            <a href="#">Full project (~6 wks +)</a>
            <a href="#">Sprint engagement (1–2 wks)</a>
            <a href="#">Advisory retainer</a>
            <a href="#">Code-review on call</a>
          </div>
        </div>
        <div className="mt-20 pt-8 border-t border-line flex justify-between items-center font-mono text-[10px] tracking-widest text-muted-2">
          <span>© 2026 · Tabsir CG · v2.6 · No tracking</span>
          <span>↑ back to top</span>
        </div>
      </div>
    </footer>
  );
}
