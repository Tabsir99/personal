import Link from "next/link";

export default function Filters({
  tags,
  active,
  count,
}: {
  tags: string[];
  active: string;
  count: number;
}) {
  return (
    <div className="filters">
      <div className="filters__head">
        <h2 className="filters__title">
          <span className="filters__title-num">{String(count).padStart(2, "0")}</span>
          <span className="filters__title-text">posts in the archive</span>
        </h2>
      </div>
      <div className="filters__chips" role="tablist" aria-label="Filter by tag">
        {tags.map((t) => {
          const isOn = active === t;
          const href = t === "all" ? "/blog" : `/blog?tag=${encodeURIComponent(t)}`;
          return (
            <Link
              key={t}
              href={href}
              role="tab"
              aria-selected={isOn}
              className={`tagbtn ${isOn ? "is-on" : ""}`}
              scroll={false}
            >
              <span className="tagbtn__hash">#</span>
              {t}
              {isOn && <span className="tagbtn__pill" aria-hidden="true" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
