import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type NavLinkProps = {
  /** Defaults to "#" (placeholder). Routing + arrow direction derived from the URL. */
  href?: string;
  /** Mark as current. Forwards `aria-current="page"`. */
  current?: boolean;
  /** Adds the hero-style underline animation + trailing arrow. */
  underline?: boolean;
} & Omit<ComponentProps<"a">, "href" | "ref" | "aria-current">;

// "#" -> placeholder (disabled). mailto/tel/sms or http(s) -> native <a>. Anything else -> next/link.
const BASE =
  "inline-flex items-center gap-2 font-mono text-xs transition-colors duration-200 hover:text-accent [&.is-active]:text-accent";

// Outer modifiers when `underline` is on; the inner span carries the actual underline so it shrinks to text width.
const UL_OUTER =
  "group gap-2.5 text-xs tracking-widest uppercase text-muted hover:text-accent duration-300";

const UL_INNER =
  "relative inline-flex items-baseline gap-2.5 pb-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-px after:w-full after:bg-muted after:origin-left after:scale-x-[0.4] after:transition-[scale,background-color] after:duration-300 group-hover:after:scale-x-100 group-hover:after:bg-accent";

function Arrow({ external }: { external: boolean }) {
  return (
    <span className="text-sm opacity-70 transition-[translate,opacity] duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:opacity-100">
      {external ? "↗" : "↘"}
    </span>
  );
}

export function NavLink({
  href = "#",
  current,
  underline,
  className,
  children,
  ...rest
}: NavLinkProps) {
  const cls = cn(BASE, underline && UL_OUTER, className);
  const aria = current ? { "aria-current": "page" as const } : undefined;

  const isHttp = /^https?:\/\//.test(href);
  const isOtherScheme = /^(mailto|tel|sms):/i.test(href);
  const isExternal = isHttp || isOtherScheme;

  const body = underline ? (
    <span className={UL_INNER}>
      {children}
      <Arrow external={isExternal} />
    </span>
  ) : (
    children
  );

  if (isExternal) {
    return (
      <a
        {...rest}
        {...aria}
        href={href}
        {...(isHttp ? { target: "_blank", rel: "noreferrer noopener" } : {})}
        className={cls}
      >
        {body}
      </a>
    );
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const LinkAny = Link as any;
  return (
    <LinkAny {...rest} {...aria} href={href} className={cls}>
      {body}
    </LinkAny>
  );
}
