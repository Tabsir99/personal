"use client";

import * as React from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
  height?: number;
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Common chrome for every dashboard chart: hairline-bordered card with an
 * eyebrow + title header, an optional action slot (date range selector),
 * and the shared loading / error / empty states. Removes 5+ duplicate
 * versions of the same loading/error/empty pattern across the codebase.
 */
export function ChartCard({
  eyebrow,
  title,
  action,
  height = 280,
  isLoading,
  isError,
  isEmpty,
  emptyMessage = "No data for this range",
  className,
  children,
}: ChartCardProps) {
  return (
    <Card className={cn("group/chart-card", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pt-5 pb-3">
        <div className="flex min-w-0 flex-col gap-1">
          {eyebrow && (
            <Eyebrow tone="muted" family="mono">
              {eyebrow}
            </Eyebrow>
          )}
          <h3 className="truncate text-base leading-snug font-semibold tracking-tight text-foreground">
            {title}
          </h3>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </CardHeader>
      <CardContent style={{ height }} className="pb-5">
        {isError ? (
          <ChartState message="Failed to load" />
        ) : isLoading ? (
          <Skeleton className="h-full w-full rounded-md" />
        ) : isEmpty ? (
          <ChartState message={emptyMessage} />
        ) : (
          <div className="h-full w-full">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}

function ChartState({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <Eyebrow tone="muted" family="mono">
        {message}
      </Eyebrow>
    </div>
  );
}
