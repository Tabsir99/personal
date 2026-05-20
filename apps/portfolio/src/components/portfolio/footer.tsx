import { NavLink } from "@/components/ui/nav-link";
import { H2, H3 } from "../ui/H2";

function Column({
  title,
  gap = "gap-3",
  children,
}: {
  title: string;
  gap?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col ${gap}`}>
      <H3>{title}</H3>
      {children}
    </div>
  );
}

const ELSEWHERE = ["GitHub", "Read.cv", "Bluesky", "LinkedIn"];
const SERVICES_OFFERED = [
  "Full project (~6 wks +)",
  "Sprint engagement (1–2 wks)",
  "Advisory retainer",
  "Code-review on call",
];

export function Footer() {
  return (
    <footer id="contact" className="page-shell flex flex-col gap-20">
      <H2
        data-reveal
        className="em-accent text-[clamp(6rem,12vw,13rem)] leading-[0.88]"
      >
        <span className="[-webkit-text-stroke:1px_var(--color-cream)] text-transparent">
          Let&apos;s build
        </span>
        <br />
        <em>something</em>
        <span className="text-muted"> small,</span>
        <br />
        <span className="text-muted">sturdy,</span> &amp; <em>true.</em>
      </H2>
      <NavLink
        href="mailto:hello@tabsircg.com"
        data-reveal
        className="w-fit group gap-4 px-7 py-[18px] border border-cream rounded-xs tracking-widest uppercase text-cream transition-all duration-300 hover:bg-accent hover:border-accent hover:text-ink"
      >
        hello@tabsircg.com
        <span className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
          ↗
        </span>
      </NavLink>
      <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 pt-10 border-t border-line">
        <Column title="Studio" gap="gap-2">
          <p className="text-sm text-cream mb-2 leading-normal">
            Tabsir CG · Independent practice
          </p>
          <p className="text-sm text-muted leading-normal">
            Apt 4B, Banani Road 11
            <br />
            Dhaka 1213, Bangladesh
          </p>
        </Column>
        <Column title="Direct">
          <NavLink href="mailto:hello@tabsircg.com">hello@tabsircg.com</NavLink>
          <NavLink>
            +880 17 ████ ████{" "}
            <span className="text-muted-2 text-xxs">(on request)</span>
          </NavLink>
          <NavLink>Cal.com / tabsir</NavLink>
        </Column>
        <Column title="Elsewhere">
          {ELSEWHERE.map((s) => (
            <NavLink key={s}>{s}</NavLink>
          ))}
        </Column>
        <Column title="Work with me">
          {SERVICES_OFFERED.map((s) => (
            <NavLink key={s}>{s}</NavLink>
          ))}
        </Column>
      </div>
      <div className="py-8 border-t border-line flex justify-between items-center">
        <span className="font-mono text-xxs tracking-widest text-muted-2">
          © 2026 · Tabsir CG · v2.6 · No tracking
        </span>
        <NavLink href="#hero">↑ back to top</NavLink>
      </div>
    </footer>
  );
}
