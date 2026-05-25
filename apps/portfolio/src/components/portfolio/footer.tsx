import { Fragment } from "react";
import { NavLink } from "@/components/ui/nav-link";
import { getPageData } from "@/lib/pageData";
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

export async function Footer() {
  const { contact, services, studioName, address } = await getPageData();
  const { email, phone, calLabel, calUrl, social } = contact;

  const offerings = services
    .filter((s) => s.isActive)
    .sort((a, b) => a.order - b.order);

  const addressLines = address.split("\n").filter((line) => line.trim());

  return (
    <footer id="contact" className="page-shell flex flex-col gap-20 mb-0 pb-2">
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
      {email && (
        <NavLink
          href={`mailto:${email}`}
          data-reveal
          className="w-fit group gap-4 px-7 py-[18px] border border-cream rounded-xs tracking-widest uppercase text-cream transition-all duration-300 hover:bg-accent hover:border-accent hover:text-ink"
        >
          {email}
          <span className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
            ↗
          </span>
        </NavLink>
      )}
      <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 pt-10 border-t border-line">
        <Column title="Studio" gap="gap-2">
          {studioName && (
            <p className="text-sm text-cream mb-2 leading-normal">
              {studioName}
            </p>
          )}
          {addressLines.length > 0 && (
            <p className="text-sm text-muted leading-normal">
              {addressLines.map((line, i) => (
                <Fragment key={i}>
                  {i > 0 && <br />}
                  {line}
                </Fragment>
              ))}
            </p>
          )}
        </Column>
        <Column title="Direct">
          {email && <NavLink href={`mailto:${email}`}>{email}</NavLink>}
          {phone && (
            <NavLink>
              {phone}{" "}
              <span className="text-muted-2 text-xxs">(on request)</span>
            </NavLink>
          )}
          {calLabel && (
            <NavLink href={calUrl || undefined}>{calLabel}</NavLink>
          )}
        </Column>
        <Column title="Elsewhere">
          {social.map((s) => (
            <NavLink key={s.name} href={s.url || undefined}>
              {s.name}
            </NavLink>
          ))}
        </Column>
        <Column title="Work with me">
          {offerings.map((s) => (
            <NavLink key={s.title}>{s.title}</NavLink>
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
