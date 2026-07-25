"use client";

import { ListDashesIcon, PlusIcon, CheckIcon } from "@phosphor-icons/react";
import { Popover } from "premium-ds/popover";
import { Button } from "premium-ds/button";
import { cn } from "@/lib/utils";
import type { FunnelDefinition } from "@/lib/analyticsTypes";

interface FunnelMenuProps {
  funnels: FunnelDefinition[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
}

export function FunnelMenu({
  funnels,
  activeId,
  onSelect,
  onCreate,
}: FunnelMenuProps) {
  return (
    <Popover
      side="bottom"
      align="end"
      trigger={
        <Button variant="secondary" size="icon" aria-label="Funnels">
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
            <button
              key={f.id}
              type="button"
              onClick={() => {
                onSelect(f.id);
                close();
              }}
              className={cn(
                "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm",
                f.id === activeId
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/80 hover:bg-foreground/5",
              )}
            >
              <span className="min-w-0 truncate">{f.name}</span>
              {f.id === activeId && (
                <CheckIcon size={14} className="shrink-0" weight="bold" />
              )}
            </button>
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
