"use client";
import { useState } from "react";
import { ArrowDown, ArrowUpDown } from "lucide-react";

import { usePagePerformance } from "@/hooks/useDashboardData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/utils";

import { DateRangeSelector } from "./DateRangeSelector";
import { ChartCard } from "./ChartCard";

interface PageRow {
  path: string;
  views: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

type SortKey = keyof PageRow;

function formatDuration(seconds: number) {
  if (!seconds || isNaN(seconds)) return "0s";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

const numberFormat = new Intl.NumberFormat();

const COLUMNS: { key: SortKey; label: string; align: "left" | "right" }[] = [
  { key: "path", label: "Path", align: "left" },
  { key: "views", label: "Views", align: "right" },
  { key: "avgTimeOnPage", label: "Avg time", align: "right" },
  { key: "bounceRate", label: "Bounce", align: "right" },
];

export function PagesTable() {
  const [days, setDays] = useState(7);
  const { data, error, isLoading } = usePagePerformance(days);
  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showAll, setShowAll] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const sortedData: PageRow[] = [...((data as PageRow[]) || [])].sort(
    (a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    },
  );

  const displayData = showAll ? sortedData : sortedData.slice(0, 5);
  const isEmpty = !error && !isLoading && displayData.length === 0;

  return (
    <ChartCard
      title="Top pages"
      action={<DateRangeSelector value={days} onChange={setDays} />}
      height={isLoading ? 280 : Math.max(displayData.length, 1) * 44 + 48}
      isLoading={isLoading}
      isError={!!error}
    >
      {error ? (
        <p className="text-sm text-muted-foreground">Failed to load</p>
      ) : isLoading ? (
        <div className="space-y-2">
          <div className="flex gap-2 border-b border-foreground/6 pb-2">
            {COLUMNS.map((col) => (
              <Skeleton
                key={col.key}
                className={cn(
                  "h-4 rounded-sm",
                  col.key === "path" ? "flex-1" : "w-16",
                )}
              />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-sm" />
          ))}
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow className="border-foreground/6 hover:bg-transparent">
                {COLUMNS.map((col) => {
                  const isActive = sortKey === col.key;
                  return (
                    <TableHead
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className={cn(
                        "h-9 cursor-pointer px-2 text-xs font-medium text-muted-foreground select-none hover:text-foreground",
                        col.align === "right" && "text-right",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex items-center gap-1",
                          col.align === "right" && "justify-end w-full",
                        )}
                      >
                        {col.label}
                        {isActive ? (
                          <ArrowDown
                            className={cn(
                              "h-2.5 w-2.5 transition-transform duration-200",
                              sortOrder === "asc" && "rotate-180",
                            )}
                            aria-hidden="true"
                          />
                        ) : (
                          <ArrowUpDown
                            className="h-2.5 w-2.5 text-muted-foreground/30"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isEmpty ? (
                <TableRow>
                  <TableCell
                    colSpan={COLUMNS.length}
                    className="h-20 text-center"
                  >
                    <Eyebrow tone="muted" family="mono">
                      No pages tracked yet
                    </Eyebrow>
                  </TableCell>
                </TableRow>
              ) : (
                displayData.map((page, i) => (
                  <TableRow
                    key={i}
                    className="border-foreground/4 transition-colors hover:bg-foreground/3"
                  >
                    <TableCell
                      title={page.path}
                      className="max-w-xs truncate px-2 py-2 font-mono text-xs text-foreground"
                    >
                      {page.path}
                    </TableCell>
                    <TableCell className="px-2 py-2 text-right font-mono text-xs tabular-nums">
                      {numberFormat.format(page.views)}
                    </TableCell>
                    <TableCell className="px-2 py-2 text-right font-mono text-xs tabular-nums text-muted-foreground">
                      {formatDuration(page.avgTimeOnPage)}
                    </TableCell>
                    <TableCell className="px-2 py-2 text-right font-mono text-xs tabular-nums text-muted-foreground">
                      {page.bounceRate.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {sortedData.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="mt-3 font-mono text-kbd tracking-widest uppercase text-muted-foreground transition-colors hover:text-foreground"
            >
              {showAll ? "Show less" : `Show all ${sortedData.length}`}
            </button>
          )}
        </>
      )}
    </ChartCard>
  );
}
