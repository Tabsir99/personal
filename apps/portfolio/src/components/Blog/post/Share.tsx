import { H3 } from "@/components/ui/H2";
import { CopyShareLink } from "./Copy";

export const CARD =
  "share-card group/sc relative inline-flex size-16 items-center justify-center rounded-sm border border-line bg-ink-2 text-cream-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export default function Share({ url, title }: { url: string; title: string }) {
  const intent = encodeURIComponent(`${title} — ${url}`);

  const xHref = `https://twitter.com/intent/tweet?text=${intent}`;
  const bskyHref = `https://bsky.app/intent/compose?text=${intent}`;

  return (
    <div className="flex flex-col gap-4">
      <H3 variant="widget">// share</H3>
      <div className="flex flex-col gap-3 max-md:flex-row">
        <CopyShareLink url={url} />
        <a
          className={CARD}
          href={xHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X"
          title="Share on X"
        >
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path
              d="M11.4 2H13.6L9 7.2 14.4 14H10.2L7 9.7 3.4 14H1.2L6.1 8.4 1 2h4.3L8.2 5.9 11.4 2zm-1 10.6h1.2L4.7 3.3H3.4l7 9.3z"
              fill="currentColor"
            />
          </svg>
        </a>

        <a
          className={CARD}
          href={bskyHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Bluesky"
          title="Share on Bluesky"
        >
          <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
            <path
              d="M3.5 3.2c1.7 1.2 3.5 3.6 4.2 4.9.7-1.3 2.5-3.7 4.2-4.9 1.2-.9 3.1-1.5 3.1.6 0 .4-.2 3.5-.4 4-.5 1.7-2.3 2.2-3.8 1.9 2.7.5 3.4 2 1.9 3.5-2.8 2.8-4-.7-4.4-1.6-.1-.2-.1-.2-.1 0-.4.9-1.6 4.4-4.4 1.6-1.5-1.5-.8-3 1.9-3.5-1.5.3-3.3-.2-3.8-1.9-.2-.5-.4-3.6-.4-4 0-2.1 1.9-1.5 3.1-.6z"
              fill="currentColor"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
