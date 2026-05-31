import { Fragment } from "react";
import { NavLink } from "@/components/ui/nav-link";
import { getPageData } from "@/lib/pageData";
import { H2, H3 } from "../ui/H2";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

function Column({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-2", className)}>
      <H3 className="col-span-full">{title}</H3>
      {children}
    </div>
  );
}

export async function Footer() {
  const { contact, studioName, address } = await getPageData();
  const { email, social } = contact;

  const addressLines = address.split("\n").filter((line) => line.trim());

  return (
    <footer
      id="contact"
      className="page-shell flex flex-col gap-20 mb-0 pb-2 pt-10"
    >
      <H2
        data-reveal
        className="em-accent text-[clamp(6rem,12vw,12rem)] leading-[0.88]"
      >
        <span className="[-webkit-text-stroke:1px_var(--color-cream)] text-transparent">
          Got something
        </span>
        <br />
        <span className="text-muted">to</span> <em>build</em>
        <br />
        <span className="text-muted">or something that&apos;s</span>{" "}
        <em>breaking?</em>
      </H2>
      {email && (
        <Button
          href={`mailto:${email}`}
          label={email}
          data-reveal
          className="max-w-fit py-4 uppercase"
        />
      )}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-10 pt-10 border-t border-line">
        <Column title="Studio">
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

        <Column title="Elsewhere" className="max-md:grid-cols-4">
          {social.map((s) => (
            <NavLink key={s.name} href={s.url || undefined}>
              {s.name}
            </NavLink>
          ))}
        </Column>
      </div>
      <div className="py-8 border-t border-line flex justify-between items-center">
        <span className="font-mono text-xxs tracking-widest text-muted-2">
          © 2026 · Tabsir CG · v2.6 · No cookies, no third-parties
        </span>
        <NavLink href="#hero">↑ back to top</NavLink>
      </div>
    </footer>
  );
}
