"use client";
import { PageHeader } from "@/components/ui/common/PageHeader";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" />
      <div className="flex h-[50vh] items-center justify-center rounded-lg border border-dashed border-border bg-card text-muted-foreground">
        No analytics data available.
      </div>
    </div>
  );
}
