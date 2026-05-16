import * as React from "react";

/* Server-component passthrough. Marks the `<article>` with `data-reveal`
   so the global ScrollObserver script adds `is-in` on viewport entry;
   blog.css handles the fade-up. */
export default function InViewArticle({
  className = "",
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <article data-reveal className={className} style={style}>
      {children}
    </article>
  );
}
