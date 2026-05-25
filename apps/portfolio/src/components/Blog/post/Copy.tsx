"use client";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CARD } from "./Share";

export const CopyShareLink = ({ url }: { url: string }) => {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button
      type="button"
      className={cn(CARD, copied && "share-card-stamped")}
      onClick={onCopy}
      aria-label={copied ? "Link copied" : "Copy link"}
      title={copied ? "Copied" : "Copy link"}
    >
      <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
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
              strokeWidth="1.3"
            />
            <path
              d="M7 5V3.4A1.4 1.4 0 0 1 8.4 2H13a1 1 0 0 1 1 1v8.4A1.6 1.6 0 0 1 12.4 13H11"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
    </button>
  );
};
