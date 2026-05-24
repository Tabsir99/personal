import type { TocItem } from "@open-notion/serializers";
import { H3 } from "@/components/ui/H2";

const ITEM_ANCHOR =
  "relative flex items-baseline gap-2.5 py-1.5 pl-1.5 pr-0 no-underline rounded-[3px] text-muted transition-colors hover:text-cream [&.is-active]:text-cream [&.is-active]:font-bold";
const BULLET =
  "shrink-0 w-1.5 h-1.5 rounded-full -translate-y-px bg-cream/8 transition-[background-color,transform,box-shadow] [.is-active_&]:bg-accent [.is-active_&]:scale-[1.2] [.is-active_&]:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-accent)_22%,transparent)]";

function renderItems(xs: TocItem[]) {
  return xs.map((it) => (
    <li key={it.id}>
      <a
        href={`#${it.id}`}
        data-nav={it.id}
        className={`${ITEM_ANCHOR} ${it.level === 3 ? "text-xs" : ""}`}
      >
        <span className={BULLET} aria-hidden="true" />
        <span className="line-clamp-2">{it.text}</span>
      </a>
      {it.children.length > 0 && (
        <ul className="list-none m-0 p-0 flex flex-col gap-1 mt-1 pl-3.5 max-xl:pl-0">
          {renderItems(it.children)}
        </ul>
      )}
    </li>
  ));
}

export default function Toc({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;
  const total = items.reduce((n, i) => n + 1 + i.children.length, 0);

  return (
    <>
      <details className="group hidden max-xl:block bg-ink-2 border border-line rounded-2xl text-sm">
        <summary className="flex items-center gap-2.5 px-4 py-3 cursor-pointer text-cream font-mono text-xs tracking-wide select-none list-none [&::-webkit-details-marker]:hidden">
          <span
            className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-accent)_22%,transparent)]"
            aria-hidden="true"
          />
          on this page
          <span className="text-muted">({total})</span>
          <span
            className="ml-auto text-sm font-bold text-muted transition-transform group-open:rotate-180"
            aria-hidden="true"
          >
            ↓
          </span>
        </summary>
        <ul className="list-none m-0 px-4 pb-4 flex flex-col gap-1">
          {renderItems(items)}
        </ul>
      </details>

      <nav className="relative text-sm leading-[1.45] pl-[18px] max-xl:hidden">
        <H3 variant="widget" className="mb-4">
          // on this page
        </H3>

        <ul className="list-none m-0 p-0 flex flex-col gap-1">
          {renderItems(items)}
        </ul>
      </nav>
    </>
  );
}
