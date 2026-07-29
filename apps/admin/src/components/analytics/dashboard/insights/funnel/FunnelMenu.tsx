"use client";

import {
  ListDashesIcon,
  PlusIcon,
  CheckIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Popover } from "premium-ds/popover";
import { Button } from "premium-ds/button";
import { cn } from "@/lib/utils";
import type { FunnelDefinition } from "@/lib/analyticsTypes";

interface FunnelMenuProps {
  funnels: FunnelDefinition[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function FunnelMenu({
  funnels,
  activeId,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
}: FunnelMenuProps) {
  return (
    <Popover
      side="bottom"
      align="end"
      trigger={
        <Button
          variant="secondary"
          size="icon"
          htmlProps={{ "aria-label": "Funnels" }}
        >
          <ListDashesIcon size={16} />
        </Button>
      }
    >
      {({ close }) => (
        <div className="flex w-56 flex-col rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-dialog">
          <div className="px-2 py-1.5 text-xs font-medium tracking-wide text-muted-foreground/70 uppercase">
            Funnels
          </div>
          {funnels.map((f) => (
            <div
              key={f.id}
              className={cn(
                "group/row flex items-center gap-1 rounded-md pr-1",
                f.id === activeId
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/80 hover:bg-foreground/5",
              )}
            >
              <button
                type="button"
                onClick={() => {
                  onSelect(f.id);
                  close();
                }}
                className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm"
              >
                <span className="min-w-0 truncate">{f.name}</span>
                {f.id === activeId && (
                  <CheckIcon size={14} className="shrink-0" weight="bold" />
                )}
              </button>
              <span className="flex shrink-0 items-center opacity-0 transition-opacity group-hover/row:opacity-100 focus-within:opacity-100">
                <button
                  type="button"
                  aria-label={`Edit ${f.name}`}
                  onClick={() => {
                    onEdit(f.id);
                    close();
                  }}
                  className="rounded-md p-1 text-muted-foreground hover:text-foreground"
                >
                  <PencilSimpleIcon size={13} />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${f.name}`}
                  onClick={() => {
                    onDelete(f.id);
                    close();
                  }}
                  className="rounded-md p-1 text-muted-foreground hover:text-destructive"
                >
                  <TrashIcon size={13} />
                </button>
              </span>
            </div>
          ))}
          <div className="my-1 h-px bg-foreground/6" />
          <button
            type="button"
            onClick={() => {
              onCreate();
              close();
            }}
            className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm font-medium text-primary hover:bg-primary/8"
          >
            <PlusIcon size={15} weight="bold" /> New funnel
          </button>
        </div>
      )}
    </Popover>
  );
}
