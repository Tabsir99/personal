"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Input } from "@/components/ui/input";
import { useSiteConfigStore } from "@/stores/SiteConfigStore";
import Panel from "./Panel";
import Eyebrow from "./Eyebrow";

export default function NowReadingPanel() {
  const [draftRows, initialRows, draftIds, initialIds] = useSiteConfigStore(
    useShallow((s) => [
      s.draft.nowReading,
      s.initial.nowReading,
      s.draftIds,
      s.initialIds,
    ]),
  );
  const addNowReading = useSiteConfigStore((s) => s.addNowReading);
  const updateNowReading = useSiteConfigStore((s) => s.updateNowReading);
  const removeNowReading = useSiteConfigStore((s) => s.removeNowReading);
  const moveNowReading = useSiteConfigStore((s) => s.moveNowReading);
  const toggleNowReadingDone = useSiteConfigStore(
    (s) => s.toggleNowReadingDone,
  );

  const initialById = React.useMemo(() => {
    const map = new Map<string, (typeof initialRows)[number]>();
    initialIds.forEach((id, i) => {
      const row = initialRows[i];
      if (row) map.set(id, row);
    });
    return map;
  }, [initialIds, initialRows]);

  return (
    <Panel
      eyebrow="02 · sidebar"
      title="Now reading"
      description="The pinned books shown in the /blog sticker. Order matters — top of the list shows first."
      count={`${draftRows.length} item${draftRows.length === 1 ? "" : "s"}`}
      action={
        <button
          type="button"
          onClick={addNowReading}
          className="inline-flex h-8 items-center gap-2 rounded-md border border-foreground/[0.08] bg-card px-3 text-xs font-medium text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary"
          style={{
            boxShadow:
              "0 1px 0 0 rgb(0 0 0 / 0.03), inset 0 -1px 0 0 rgb(0 0 0 / 0.03)",
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Add book
        </button>
      }
    >
      {draftRows.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="divide-y divide-foreground/[0.05]">
          {draftRows.map((row, i) => {
            const id = draftIds[i] ?? `row-${i}`;
            const prior = initialById.get(id);
            return (
              <Row
                key={id}
                index={i}
                total={draftRows.length}
                title={row.title}
                author={row.author}
                done={row.done}
                titleEdited={!prior || prior.title !== row.title}
                authorEdited={!prior || prior.author !== row.author}
                onTitle={(v) => updateNowReading(i, { title: v })}
                onAuthor={(v) => updateNowReading(i, { author: v })}
                onToggle={() => toggleNowReadingDone(i)}
                onUp={() => moveNowReading(i, -1)}
                onDown={() => moveNowReading(i, 1)}
                onRemove={() => removeNowReading(i)}
              />
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-start gap-2 rounded-md border border-dashed border-foreground/[0.08] px-4 py-6">
      <Eyebrow>Empty</Eyebrow>
      <p className="text-sm text-muted-foreground">
        Nothing pinned. Add a book and it shows up in the /blog sticker.
      </p>
    </div>
  );
}

function Row({
  index,
  total,
  title,
  author,
  done,
  titleEdited,
  authorEdited,
  onTitle,
  onAuthor,
  onToggle,
  onUp,
  onDown,
  onRemove,
}: {
  index: number;
  total: number;
  title: string;
  author: string;
  done: boolean;
  titleEdited: boolean;
  authorEdited: boolean;
  onTitle: (v: string) => void;
  onAuthor: (v: string) => void;
  onToggle: () => void;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}) {
  const anyEdited = titleEdited || authorEdited;
  return (
    <li
      className={[
        "group relative grid grid-cols-[auto_minmax(0,1.4fr)_minmax(0,1fr)_auto] items-center gap-3 py-3",
        anyEdited
          ? "before:absolute before:-left-3 before:top-2 before:bottom-2 before:w-px before:bg-primary"
          : "",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <span className="w-5 font-mono text-[10px] tracking-[0.04em] text-foreground/40">
          {String(index + 1).padStart(2, "0")}
        </span>
        <DoneCheck on={done} onToggle={onToggle} />
      </div>
      <Input
        value={title}
        onChange={(e) => onTitle(e.target.value)}
        placeholder="Book title"
        aria-label={`Book ${index + 1} title`}
        className="border-transparent bg-transparent text-sm font-medium shadow-none focus-visible:border-foreground/10 focus-visible:bg-background"
      />
      <Input
        value={author}
        onChange={(e) => onAuthor(e.target.value)}
        placeholder="Author"
        aria-label={`Book ${index + 1} author`}
        className="border-transparent bg-transparent text-sm text-muted-foreground shadow-none focus-visible:border-foreground/10 focus-visible:bg-background"
      />
      {/* Hidden controls collapse out of the tab order until the row is hovered/focused. */}
      <div className="invisible flex items-center gap-1 group-hover:visible focus-within:visible">
        <IconBtn label="Move up" disabled={index === 0} onClick={onUp}>
          <ArrowUp className="h-3.5 w-3.5" />
        </IconBtn>
        <IconBtn
          label="Move down"
          disabled={index === total - 1}
          onClick={onDown}
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </IconBtn>
        <IconBtn label="Remove" onClick={onRemove} destructive>
          <X className="h-3.5 w-3.5" />
        </IconBtn>
      </div>
    </li>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
  destructive,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={[
        "inline-flex h-7 w-7 items-center justify-center rounded-md text-foreground/60 transition-colors",
        disabled
          ? "opacity-30"
          : destructive
            ? "hover:bg-destructive/10 hover:text-destructive"
            : "hover:bg-foreground/[0.05] hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

// Real keycap-feeling toggle. aria-pressed (not role=checkbox) so the
// native <button> Space/Enter semantics are honored consistently.
function DoneCheck({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={on ? "Mark unfinished" : "Mark finished"}
      title={on ? "Finished" : "Mark finished"}
      className={[
        "relative h-4 w-4 rounded-[3px] border transition-all",
        on
          ? "border-primary bg-primary"
          : "border-foreground/15 bg-background hover:border-foreground/30",
      ].join(" ")}
      style={{
        boxShadow: on
          ? "inset 0 -1px 0 0 rgb(0 0 0 / 0.18)"
          : "0 1px 0 0 rgb(0 0 0 / 0.04), inset 0 -1px 0 0 rgb(0 0 0 / 0.04)",
      }}
    >
      {on && (
        <svg
          viewBox="0 0 16 16"
          className="absolute inset-0 m-auto h-2.5 w-2.5 text-primary-foreground"
          aria-hidden
        >
          <path
            d="M3 8.5l3 3 7-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
