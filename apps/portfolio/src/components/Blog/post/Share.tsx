"use client";

import * as React from "react";

export default function Share({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = React.useState(false);
  const intent = encodeURIComponent(`${title} — ${url}`);

  const onCopy = async () => {
    const target =
      url || (typeof window !== "undefined" ? window.location.href : "");
    try {
      await navigator.clipboard.writeText(target);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = target;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {}
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const xHref = `https://twitter.com/intent/tweet?text=${intent}`;
  const bskyHref = `https://bsky.app/intent/compose?text=${intent}`;

  return (
    <div className="share">
      <div className="share__head mono">// share</div>
      <div className="share__row">
        <button
          type="button"
          className={`share__btn ${copied ? "is-copied" : ""}`}
          onClick={onCopy}
          aria-label="Copy link"
          title="Copy link"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            {copied ? (
              <path
                d="M3 8.5l3 3 7-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <>
                <rect
                  x="2"
                  y="5"
                  width="7"
                  height="9"
                  rx="1.4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="M7 5V3.4A1.4 1.4 0 0 1 8.4 2H13a1 1 0 0 1 1 1v8.4A1.6 1.6 0 0 1 12.4 13H11"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </>
            )}
          </svg>
          <span className="share__btn-label mono">
            {copied ? "copied" : "copy link"}
          </span>
        </button>

        <a
          className="share__btn"
          href={xHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X"
          title="Share on X"
        >
          <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
            <path
              d="M11.4 2H13.6L9 7.2 14.4 14H10.2L7 9.7 3.4 14H1.2L6.1 8.4 1 2h4.3L8.2 5.9 11.4 2zm-1 10.6h1.2L4.7 3.3H3.4l7 9.3z"
              fill="currentColor"
            />
          </svg>
          <span className="share__btn-label mono">post to x</span>
        </a>

        <a
          className="share__btn"
          href={bskyHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Bluesky"
          title="Share on Bluesky"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path
              d="M3.5 3.2c1.7 1.2 3.5 3.6 4.2 4.9.7-1.3 2.5-3.7 4.2-4.9 1.2-.9 3.1-1.5 3.1.6 0 .4-.2 3.5-.4 4-.5 1.7-2.3 2.2-3.8 1.9 2.7.5 3.4 2 1.9 3.5-2.8 2.8-4-.7-4.4-1.6-.1-.2-.1-.2-.1 0-.4.9-1.6 4.4-4.4 1.6-1.5-1.5-.8-3 1.9-3.5-1.5.3-3.3-.2-3.8-1.9-.2-.5-.4-3.6-.4-4 0-2.1 1.9-1.5 3.1-.6z"
              fill="currentColor"
            />
          </svg>
          <span className="share__btn-label mono">post to bluesky</span>
        </a>
      </div>
    </div>
  );
}
