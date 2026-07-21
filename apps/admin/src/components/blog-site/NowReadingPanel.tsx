"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, Plus, X } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "premium-ds/button";
import { TextField } from "premium-ds/text-field";
import { Checkbox } from "premium-ds/checkbox";
import { useSiteConfigStore } from "@/stores/SiteConfigStore";
import Panel from "./Panel";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Collapse } from "premium-ds/collapse";

export default function NowReadingPanel() {
  const { draftRows, initialRows, draftIds, initialIds } = useSiteConfigStore(
    useShallow((s) => ({
      draftRows: s.draft.nowReading,
      initialRows: s.initial.nowReading,
      draftIds: s.draftIds,
      initialIds: s.initialIds,
    })),
  );

  const initialById = React.useMemo(() => {
    const map = new Map<string, (typeof initialRows)[number]>();
    initialIds.forEach((id, i) => {
      const row = initialRows[i];
      if (row) map.set(id, row);
    });
    return map;
  }, [initialIds, initialRows]);

  const initialIdSet = React.useMemo(() => new Set(initialIds), [initialIds]);

  const [leaving, setLeaving] = React.useState<Set<string>>(new Set());
  const handleRemove = (id: string, index: number) => {
    if (leaving.has(id)) return;
    setLeaving((s) => new Set(s).add(id));
    window.setTimeout(() => {
      useSiteConfigStore.getState().removeNowReading(index);
      setLeaving((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }, 240);
  };

  const isEmpty = draftRows.length === 0;

  return (
    <Panel
      title="Now reading"
      description="The pinned books shown in the /blog sticker. Order matters — top of the list shows first."
      {...(draftRows.length > 0
        ? {
            count: `${draftRows.length} item${draftRows.length === 1 ? "" : "s"}`,
          }
        : {})}
      action={
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => useSiteConfigStore.getState().addNowReading()}
          className="transition-transform active:scale-95"
          iconLeft={<Plus size={14} />}
        >
          Add book
        </Button>
      }
    >
      <Collapse open={isEmpty} fade>
        <div className="flex flex-col items-start gap-2 rounded-md border border-foreground/6 bg-foreground/2 px-4 py-6">
          <Eyebrow tone="muted" family="mono">
            Empty
          </Eyebrow>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Nothing pinned. Add a book and it shows up in the /blog sticker.
          </p>
        </div>
      </Collapse>
      <Collapse open={!isEmpty} fade>
        <ul>
          {draftRows.map((row, i) => {
            const id = draftIds[i] ?? `row-${i}`;
            const prior = initialById.get(id);
            const isLeaving = leaving.has(id);
            const isNew = !initialIdSet.has(id);
            const titleEdited = !prior || prior.title !== row.title;
            const authorEdited = !prior || prior.author !== row.author;
            const anyEdited = titleEdited || authorEdited;
            return (
              <RowShell key={id} isLeaving={isLeaving} isNew={isNew}>
                <div className="group relative grid grid-cols-[auto_minmax(0,1.4fr)_minmax(0,1fr)_auto] items-center gap-3 border-b border-foreground/5 py-3 pl-2 last:border-b-0">
                  <span
                    aria-hidden
                    className={[
                      "pointer-events-none absolute left-0 top-2 bottom-2 w-px bg-primary transition-opacity duration-200 ease-out",
                      anyEdited ? "opacity-100" : "opacity-0",
                    ].join(" ")}
                  />
                  <div className="flex items-center pl-2">
                    <Checkbox
                      checked={row.done}
                      onChange={() =>
                        useSiteConfigStore.getState().toggleNowReadingDone(i)
                      }
                      aria-label={
                        row.done ? "Mark unfinished" : "Mark finished"
                      }
                    />
                  </div>
                  <TextField
                    value={row.title}
                    onChange={(e) =>
                      useSiteConfigStore.getState().updateNowReading(i, {
                        title: e.target.value,
                      })
                    }
                    placeholder="Book title"
                    aria-label={`Book ${i + 1} title`}
                  />
                  <TextField
                    value={row.author}
                    onChange={(e) =>
                      useSiteConfigStore.getState().updateNowReading(i, {
                        author: e.target.value,
                      })
                    }
                    placeholder="Author"
                    aria-label={`Book ${i + 1} author`}
                  />
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <IconBtn
                      label="Move up"
                      disabled={i === 0}
                      onClick={() =>
                        useSiteConfigStore.getState().moveNowReading(i, -1)
                      }
                    >
                      <ArrowUp size={14} />
                    </IconBtn>
                    <IconBtn
                      label="Move down"
                      disabled={i === draftRows.length - 1}
                      onClick={() =>
                        useSiteConfigStore.getState().moveNowReading(i, 1)
                      }
                    >
                      <ArrowDown size={14} />
                    </IconBtn>
                    <IconBtn
                      label="Remove"
                      destructive
                      onClick={() => handleRemove(id, i)}
                    >
                      <X size={14} />
                    </IconBtn>
                  </div>
                </div>
              </RowShell>
            );
          })}
        </ul>
      </Collapse>
    </Panel>
  );
}

function RowShell({
  isLeaving,
  isNew,
  children,
}: {
  isLeaving: boolean;
  isNew: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(!isNew);
  React.useEffect(() => {
    if (!isNew) return;
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, [isNew]);
  const collapsed = isLeaving || !open;
  return (
    <Collapse As="li" open={!collapsed} fade>
      {children}
    </Collapse>
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
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={
        destructive
          ? "min-w-0 p-1 text-foreground/60 hover:bg-destructive/10 hover:text-destructive"
          : "min-w-0 p-1 text-foreground/60"
      }
    >
      {children}
    </Button>
  );
}
