import React from "react";
import { LinkIcon } from "@phosphor-icons/react";

export function getFaviconUrl(
  source: string,
  size: number = 64,
): string | null {
  try {
    const domain = source.includes("://")
      ? new URL(source).hostname
      : source.split("/")[0];

    if (!domain || !domain.includes(".")) return null;

    return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
  } catch {
    return null;
  }
}

interface FaviconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  source: string;
  size?: number;
}

export function Favicon({
  source,
  size = 64,
  className,
  onError,
  ...props
}: FaviconProps) {
  const url = getFaviconUrl(source, size);

  if (!url) return <LinkIcon size={16} />;

  return (
    <img
      src={url}
      alt=""
      className={className || "size-4 rounded-sm object-contain"}
      onError={(e) => {
        (e.target as HTMLElement).style.display = "none";
        onError?.(e);
      }}
      {...props}
    />
  );
}
