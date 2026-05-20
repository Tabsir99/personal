import { Fragment } from "react";
import Link from "next/link";

type Crumb = {
  label: string;
  // Missing href => current page (rendered as bold <span>)
  href?: string;
};

export function Breadcrumb({
  crumbs,
  className = "",
}: {
  crumbs: Crumb[];
  className?: string;
}) {
  return (
    <nav
      className={`font-mono inline-flex items-center gap-2.5 text-xs text-muted tracking-wide ${className}`.trim()}
      aria-label="Breadcrumb"
    >
      {crumbs.map((crumb, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <span aria-hidden="true" className="text-cream/8">
              /
            </span>
          )}
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="transition-colors duration-200 hover:text-cream"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-cream font-bold">{crumb.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
