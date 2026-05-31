import Image from "next/image";
import { RichText } from "./rich-text";

interface BlockQuoteProps {
  children: React.ReactNode;
  author?: string;
  authorAvatar?: string;
  company?: string;
  period?: string;
  className?: string;
  sourceUrl?: string;
}

export function BlockQuote({
  children,
  author,
  company,
  period,
  authorAvatar,
  className = "",
  sourceUrl,
}: BlockQuoteProps) {
  const hasFooter = author || company || period || authorAvatar;

  return (
    <blockquote
      cite={sourceUrl}
      className={`relative pl-[clamp(24px,3vw,48px)] border-l border-line ${className}`}
    >
      <p className="font-serif italic text-cream text-[clamp(28px,3vw,40px)] leading-tight">
        <span
          className="absolute text-accent leading-none pointer-events-none left-[clamp(24px,3vw,48px)] ml-[-0.55em] mt-[-0.15em] text-[1.6em] opacity-50"
          aria-hidden="true"
        >
          &ldquo;
        </span>
        {children}
      </p>

      {hasFooter && (
        <footer className="flex items-center flex-wrap gap-4 mt-[clamp(28px,3vw,40px)] font-mono text-xs tracking-widest uppercase text-muted">
          {(author || authorAvatar) && (
            <span className="flex items-center gap-3">
              {authorAvatar && (
                <Image
                  src={authorAvatar}
                  alt={author || "Author"}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover border border-line shrink-0"
                />
              )}
              {author && (
                <span className="text-cream font-medium flex gap-1 items-center">
                  <RichText text={author} />
                </span>
              )}
            </span>
          )}

          {company && (
            <span>
              {" · "}
              <RichText text={company} />
            </span>
          )}

          {period && (
            <>
              <span
                className="inline-block w-5 h-px bg-line"
                aria-hidden="true"
              />
              <span>
                <RichText text={period} />
              </span>
            </>
          )}
        </footer>
      )}
    </blockquote>
  );
}
