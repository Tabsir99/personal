"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Collapse } from "premium-ds/collapse";
import { Button } from "premium-ds/button";
import {
  ArrowsDownUpIcon,
  CaretDownIcon,
  CopyIcon,
  CheckIcon,
  CreditCardIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  TargetIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { JourneyEntry, JourneyEventType } from "@/lib/analyticsTypes";
import { formatClock, formatDayHeading, formatMoney } from "./journeyFormat";

const TIMELINE_WINDOW = 14;

const ENTRY_ICON: Record<JourneyEventType, typeof EyeIcon> = {
  referral: MagnifyingGlassIcon,
  pageview: EyeIcon,
  custom: TargetIcon,
  payment: CreditCardIcon,
};

function Chip({ children }: { children: ReactNode }) {
  return (
    <code className="max-w-64 truncate rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
      {children}
    </code>
  );
}

function entryText(entry: JourneyEntry): string {
  switch (entry.eventType) {
    case "referral":
      return `Found via ${entry.data.domainName || entry.data.channel}`;
    case "pageview":
      return `Viewed page ${entry.data.path}`;
    case "custom":
      return `Triggered event: ${entry.data.eventName}`;
    case "payment":
      return `Paid ${formatMoney(entry.data.amount)}`;
  }
}

function EntryContent({ entry }: { entry: JourneyEntry }) {
  switch (entry.eventType) {
    case "referral": {
      const tracker = entry.data.trackingParams[0];
      return (
        <>
          <span className="text-muted-foreground">Found via</span>
          <Chip>{entry.data.domainName || entry.data.channel}</Chip>
          {tracker && (
            <>
              <span className="text-muted-foreground">with tracker</span>
              <Chip>
                {tracker.type}={tracker.value}
              </Chip>
            </>
          )}
        </>
      );
    }
    case "pageview":
      return (
        <>
          <span className="text-muted-foreground">Viewed page</span>
          <Chip>{entry.data.path}</Chip>
          {entry.data.count > 1 && (
            <span className="text-xs text-muted-foreground/70">
              ×{entry.data.count}
            </span>
          )}
        </>
      );
    case "custom":
      return (
        <>
          <span className="text-muted-foreground">Triggered event:</span>
          <Chip>{entry.data.eventName}</Chip>
        </>
      );
    case "payment":
      return (
        <>
          <span className="font-medium text-destructive">Paid</span>
          <code className="rounded-md bg-destructive/10 px-1.5 py-0.5 font-mono text-xs font-medium text-destructive">
            {formatMoney(entry.data.amount)}
          </code>
        </>
      );
  }
}

function ParameterTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="mb-2 ml-11 max-w-md border-l border-border pl-4">
      {rows.map(([key, value]) => (
        <div key={key} className="flex items-baseline gap-3 py-1">
          <span className="w-40 shrink-0 truncate font-mono text-xs text-muted-foreground">
            {key}
          </span>
          <span className="min-w-0 truncate font-mono text-xs text-foreground/85">
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

function TimelineRow({ entry }: { entry: JourneyEntry }) {
  const [expanded, setExpanded] = useState(false);

  const Icon = ENTRY_ICON[entry.eventType];
  const isPayment = entry.eventType === "payment";

  const parameters: [string, string][] =
    entry.eventType === "custom"
      ? Object.entries(entry.data.metadata).map(([key, value]) => [
          key,
          typeof value === "object" ? JSON.stringify(value) : String(value),
        ])
      : entry.eventType === "referral"
        ? entry.data.trackingParams.map((p) => [p.type, p.value])
        : [];

  return (
    <div className={cn(isPayment && "bg-destructive/6")}>
      <div className="flex items-center gap-3 px-4 py-2.5">
        <Icon
          className={cn(
            "size-4 shrink-0",
            isPayment ? "text-destructive" : "text-muted-foreground/50",
          )}
          weight={isPayment ? "fill" : "regular"}
        />

        <span className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
          <EntryContent entry={entry} />
          {parameters.length > 0 && (
            <button
              type="button"
              onClick={() => setExpanded((open) => !open)}
              aria-expanded={expanded}
              className="ml-1 flex shrink-0 cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 text-xs text-muted-foreground/80 transition-colors hover:bg-foreground/6 hover:text-foreground"
            >
              ({parameters.length}) parameters
              <CaretDownIcon
                className={cn(
                  "size-3 transition-transform",
                  expanded && "rotate-180",
                )}
              />
            </button>
          )}
        </span>

        <span
          className={cn(
            "shrink-0 font-mono text-xs tabular-nums",
            isPayment ? "text-destructive" : "text-muted-foreground/80",
          )}
        >
          {formatClock(entry.timestamp)}
        </span>
      </div>

      {parameters.length > 0 && (
        <Collapse open={expanded}>
          <ParameterTable rows={parameters} />
        </Collapse>
      )}
    </div>
  );
}

function timelineToText(entries: JourneyEntry[]): string {
  return entries
    .map(
      (entry) =>
        `${new Date(entry.timestamp).toISOString()}\t${entryText(entry)}`,
    )
    .join("\n");
}

export function JourneyTimeline({ entries }: { entries: JourneyEntry[] }) {
  const [oldestFirst, setOldestFirst] = useState(true);
  const [visibleCount, setVisibleCount] = useState(TIMELINE_WINDOW);
  const [copied, setCopied] = useState(false);

  const ordered = useMemo(
    () => (oldestFirst ? entries : [...entries].reverse()),
    [entries, oldestFirst],
  );

  const visible = ordered.slice(0, visibleCount);
  const remaining = ordered.length - visible.length;

  const copy = () => {
    void navigator.clipboard.writeText(timelineToText(ordered)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <div className="flex min-h-0 flex-col">
      <div className="mx-auto flex w-3/4 shrink-0 items-center justify-end gap-1 px-4 pb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOldestFirst((value) => !value)}
          className="px-2! tracking-wide text-muted-foreground uppercase"
          iconLeft={<ArrowsDownUpIcon className="size-3.5" />}
        >
          {oldestFirst ? "Oldest first" : "Newest first"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={copy}
          className="px-2! tracking-wide text-muted-foreground uppercase"
          iconLeft={
            copied ? (
              <CheckIcon className="size-3.5" />
            ) : (
              <CopyIcon className="size-3.5" />
            )
          }
        >
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      <div className="mx-auto min-h-0 w-3/4 flex-1 overflow-y-auto pb-6">
        {visible.map((entry, index) => {
          const day = formatDayHeading(entry.timestamp);
          const previousDay =
            index === 0 ? null : formatDayHeading(visible[index - 1].timestamp);

          return (
            <div key={`${entry.timestamp}-${index}`}>
              {day !== previousDay && (
                <div className="sticky top-0 z-20 bg-card py-1.5">
                  <div className="rounded-lg bg-accent py-2 text-center text-xs font-medium text-muted-foreground drop-shadow-sm">
                    {day}
                  </div>
                </div>
              )}
              <TimelineRow entry={entry} />
            </div>
          );
        })}

        {remaining > 0 && (
          <div className="flex justify-center pt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setVisibleCount((count) => count + TIMELINE_WINDOW)
              }
              className="rounded-full!"
              iconLeft={<CaretDownIcon className="size-3.5" />}
            >
              Show ({remaining}) next event{remaining === 1 ? "" : "s"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
