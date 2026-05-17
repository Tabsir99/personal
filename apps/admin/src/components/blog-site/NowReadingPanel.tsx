"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSiteConfigStore } from "@/stores/SiteConfigStore";
import Panel from "./Panel";
import { Eyebrow } from "@/components/ui/Eyebrow";
import HeightTransition from "./HeightTransition";

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

  const initialIdSet = React.useMemo(
    () => new Set(initialIds),
    [initialIds],
  );

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
      eyebrow="02 · sidebar"
      title="Now reading"
      description="The pinned books shown in the /blog sticker. Order matters — top of the list shows first."
      count={`${draftRows.length} item${draftRows.length === 1 ? "" : "s"}`}
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => useSiteConfigStore.getState().addNowReading()}
          className="transition-transform active:scale-[0.97]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add book
        </Button>
      }
    >
      <HeightTransition show={isEmpty}>
        <div className="flex flex-col items-start gap-2 rounded-md border border-foreground/[0.06] bg-foreground/[0.02] px-4 py-6">
          <Eyebrow tone="muted" family="mono">
            Empty
          </Eyebrow>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Nothing pinned. Add a book and it shows up in the /blog sticker.
          </p>
        </div>
      </HeightTransition>
      <HeightTransition show={!isEmpty}>
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
                <div className="group relative grid grid-cols-[auto_minmax(0,1.4fr)_minmax(0,1fr)_auto] items-center gap-3 border-b border-foreground/[0.05] py-3 last:border-b-0">
                  <span
                    aria-hidden
                    className={[
                      "pointer-events-none absolute left-0 top-2 bottom-2 w-px bg-primary transition-opacity duration-200 ease-out",
                      anyEdited ? "opacity-100" : "opacity-0",
                    ].join(" ")}
                  />
                  <div className="flex items-center gap-3 pl-2">
                    <span className="w-5 font-mono text-kbd tabular-nums text-foreground/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        useSiteConfigStore.getState().toggleNowReadingDone(i)
                      }
                      aria-pressed={row.done}
                      aria-label={row.done ? "Mark unfinished" : "Mark finished"}
                      title={row.done ? "Finished" : "Mark finished"}
                      className={[
                        "relative !h-4 !w-4 !p-0 !rounded-[3px] border transition-all",
                        row.done
                          ? "!border-primary !bg-primary hover:!bg-primary/90"
                          : "!border-foreground/15 !bg-background hover:!border-foreground/30",
                      ].join(" ")}
                      style={{
                        boxShadow: row.done
                          ? "inset 0 -1px 0 0 rgb(0 0 0 / 0.18)"
                          : "0 1px 0 0 rgb(0 0 0 / 0.04), inset 0 -1px 0 0 rgb(0 0 0 / 0.04)",
                      }}
                    >
                      {row.done && (
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
                    </Button>
                  </div>
                  <Input
                    value={row.title}
                    onChange={(e) =>
                      useSiteConfigStore.getState().updateNowReading(i, {
                        title: e.target.value,
                      })
                    }
                    placeholder="Book title"
                    aria-label={`Book ${i + 1} title`}
                    className="border-transparent bg-transparent text-sm font-medium shadow-none focus-visible:border-foreground/10 focus-visible:bg-background"
                  />
                  <Input
                    value={row.author}
                    onChange={(e) =>
                      useSiteConfigStore.getState().updateNowReading(i, {
                        author: e.target.value,
                      })
                    }
                    placeholder="Author"
                    aria-label={`Book ${i + 1} author`}
                    className="border-transparent bg-transparent text-sm text-muted-foreground shadow-none focus-visible:border-foreground/10 focus-visible:bg-background"
                  />
                  <div className="invisible flex items-center gap-1 group-hover:visible focus-within:visible">
                    <IconBtn
                      label="Move up"
                      disabled={i === 0}
                      onClick={() =>
                        useSiteConfigStore.getState().moveNowReading(i, -1)
                      }
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </IconBtn>
                    <IconBtn
                      label="Move down"
                      disabled={i === draftRows.length - 1}
                      onClick={() =>
                        useSiteConfigStore.getState().moveNowReading(i, 1)
                      }
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </IconBtn>
                    <IconBtn
                      label="Remove"
                      destructive
                      onClick={() => handleRemove(id, i)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </IconBtn>
                  </div>
                </div>
              </RowShell>
            );
          })}
        </ul>
      </HeightTransition>
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
    <li
      className="grid ease-out"
      style={{
        gridTemplateRows: collapsed ? "0fr" : "1fr",
        opacity: collapsed ? 0 : 1,
        transitionProperty: "grid-template-rows, opacity",
        transitionDuration: "240ms",
      }}
    >
      <div className="overflow-hidden">{children}</div>
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
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={
        destructive
          ? "text-foreground/60 hover:bg-destructive/10 hover:text-destructive"
          : "text-foreground/60"
      }
    >
      {children}
    </Button>
  );
}
