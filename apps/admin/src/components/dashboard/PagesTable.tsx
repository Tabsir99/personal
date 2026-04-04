"use client";
import { useState } from "react";
import { usePagePerformance } from "@/lib/hooks/useDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function PagesTable({ days }: { days: number }) {
  const { data, error, isLoading } = usePagePerformance(days);
  const [sortKey, setSortKey] = useState<string>("views");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showAll, setShowAll] = useState(false);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Failed to load</CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const sortedData = [...(data || [])].sort((a, b) => {
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const displayData = showAll ? sortedData : sortedData.slice(0, 5);

  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0s";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const truncate = (str: string, len: number) => {
    if (str.length > len) return str.substring(0, len) + "...";
    return str;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Pages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort("path")}>
                  Path {sortKey === "path" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer text-right" onClick={() => handleSort("views")}>
                  Views {sortKey === "views" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer text-right" onClick={() => handleSort("avgTimeOnPage")}>
                  Avg Time {sortKey === "avgTimeOnPage" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer text-right" onClick={() => handleSort("bounceRate")}>
                  Bounce Rate {sortKey === "bounceRate" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((page, i) => (
                <TableRow key={i} className="hover:bg-muted/50 cursor-default">
                  <TableCell title={page.path} className="font-medium max-w-[200px]">
                    {truncate(page.path, 30)}
                  </TableCell>
                  <TableCell className="text-right">{new Intl.NumberFormat().format(page.views)}</TableCell>
                  <TableCell className="text-right">{formatDuration(page.avgTimeOnPage)}</TableCell>
                  <TableCell className="text-right">{page.bounceRate.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
              {displayData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {sortedData.length > 5 && (
          <div className="mt-4 text-center">
            <button
              className="text-sm font-medium text-primary hover:underline cursor-pointer"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show less" : "Show all"}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
