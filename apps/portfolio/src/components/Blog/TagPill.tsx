import Link from "next/link";

const TAG_BASE =
  "font-mono text-xs px-2.5 py-[3px] rounded-full text-cream-2 [transition:transform_200ms_ease,background-color_200ms_ease,color_200ms_ease] hover:-translate-y-px hover:bg-accent hover:text-cream";

export function TagPill({
  tag,
  variant = "filled",
  asLink = true,
  scroll = true,
}: {
  tag: string;
  variant?: "filled" | "outlined";
  asLink?: boolean;
  scroll?: boolean;
}) {
  const className =
    variant === "outlined"
      ? `${TAG_BASE} bg-transparent border border-cream/8`
      : `${TAG_BASE} bg-ink-2`;

  if (!asLink) {
    return <span className={className}>#{tag}</span>;
  }
  return (
    <Link
      href={`/blog?tag=${encodeURIComponent(tag)}`}
      className={className}
      scroll={scroll}
    >
      #{tag}
    </Link>
  );
}
