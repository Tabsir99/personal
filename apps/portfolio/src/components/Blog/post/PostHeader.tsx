import { KIND_LABEL, formatDate, type PostMeta } from "@/lib/posts";
import { Breadcrumb } from "../Breadcrumb";
import { TagPill } from "../TagPill";

const KIND_KICKER: Record<PostMeta["kind"], string> = {
  essay: "bg-cream text-ink",
  "deep-dive": "bg-phosphor text-ink",
  "war-story": "bg-accent text-cream",
  notes: "bg-ink-2 text-cream-2",
};

function MetadataRow({
  label,
  ddExtra = "",
  children,
}: {
  label: string;
  ddExtra?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 m-0">
      <dt className="uppercase tracking-widest text-xxs after:content-['_›'] after:opacity-50">
        {label}
      </dt>
      <dd
        className={`m-0 flex items-center gap-2.5 text-cream ${ddExtra}`.trim()}
      >
        {children}
      </dd>
    </div>
  );
}

export default function PostHeader({ post }: { post: PostMeta }) {
  return (
    <header className="pb-10 border-b border-line mb-12 max-sm:pb-7 max-sm:mb-8">
      <Breadcrumb
        className="mb-8 max-sm:mb-5"
        crumbs={[
          { label: "tabsircg.com", href: "/" },
          { label: "blog", href: "/blog" },
          { label: post.slug },
        ]}
      />

      <div className="flex items-center gap-3.5 mb-7">
        <span
          className={`inline-block px-3 py-[5px] rounded-full font-mono text-xs lowercase tracking-wider ${KIND_KICKER[post.kind]}`}
        >
          {KIND_LABEL[post.kind]}
        </span>
        <span
          className="shrink-0 w-6 h-px bg-line opacity-40"
          aria-hidden="true"
        />
        <time className="font-mono text-muted text-xs" dateTime={post.date}>
          {formatDate(post.date)}
        </time>
      </div>

      <h1 className="text-[clamp(40px,7vw,160px)] leading-[1.1] tracking-tighter font-serif mb-6">
        {post.title}
      </h1>

      <p className="text-[clamp(18px,1.6vw,22px)] leading-[1.45] text-cream-2 max-w-[56ch] m-0 mb-9 font-light text-pretty max-sm:mb-6">
        {post.dek}
      </p>

      <dl className="font-mono flex flex-wrap gap-7 m-0 text-xs text-muted max-sm:gap-4">
        <MetadataRow label="read">
          <span
            className="inline-block w-[60px] h-[3px] rounded-xs bg-cream/8 overflow-hidden"
            aria-hidden="true"
          >
            <span
              className="block h-full bg-cream origin-left animate-fill"
              style={{ width: `${Math.min(100, post.readTime * 4)}%` }}
            />
          </span>
          {post.readTime} min
        </MetadataRow>
        <MetadataRow label="tags" ddExtra="inline-flex flex-wrap">
          {post.tags.map((t) => (
            <TagPill key={t} tag={t} />
          ))}
        </MetadataRow>
      </dl>
    </header>
  );
}
