interface BlockQuoteProps {
  children: React.ReactNode;
  author?: string;
  company?: string;
  period?: string;
  badge?: string;
  className?: string;
  sourceUrl?: string;
}

export function BlockQuote({
  children,
  author,
  company,
  period,
  badge,
  className = "",
  sourceUrl,
}: BlockQuoteProps) {
  const hasFooter = author || company || period || badge;

  return (
    <blockquote
      cite={sourceUrl}
      className={`relative pl-[clamp(24px,3vw,48px)] border-l border-line max-xl:pl-5 ${className}`}
    >
      <p className="font-serif italic text-cream text-[clamp(26px,2.8vw,40px)] leading-[1.22] tracking-tight text-balance">
        <span
          className="absolute font-serif text-accent leading-none pointer-events-none left-[clamp(24px,3vw,48px)] ml-[-0.55em] mt-[-0.15em] text-[1.6em] opacity-50 max-xl:left-5"
          aria-hidden="true"
        >
          &ldquo;
        </span>
        {children}
      </p>

      {hasFooter && (
        <footer className="flex items-center flex-wrap gap-3.5 mt-[clamp(28px,3vw,40px)] font-mono text-xs tracking-widest uppercase text-muted">
          {author && <span className="text-cream font-medium">{author}</span>}
          {company && <span> · {company}</span>}
          {period && (
            <>
              <span
                className="inline-block w-5 h-px bg-line"
                aria-hidden="true"
              />
              <span>{period}</span>
            </>
          )}
          {badge && (
            <>
              <span
                className="inline-block w-5 h-px bg-line"
                aria-hidden="true"
              />
              <span className="inline-flex items-center p-2 border border-line rounded-xs text-accent text-xxs tracking-widest">
                {badge}
              </span>
            </>
          )}
        </footer>
      )}
    </blockquote>
  );
}
