/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { getAnalyticsWebsites } from "@/actions/analyticsActions";
import type { AnalyticsWebsite } from "@/actions/analyticsActions";
import { WebsiteList } from "@/components/analytics/WebsiteList";
import { WebsiteEmptyState } from "@/components/analytics/WebsiteEmptyState";
import { WebsiteDialog } from "@/components/analytics/WebsiteDialog";

export default function AnalyticsPage() {
  const [websites, setWebsites] = useState<AnalyticsWebsite[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AnalyticsWebsite | null>(null);

  const load = useCallback(async () => {
    const res = await getAnalyticsWebsites();
    if (res.status === "success") setWebsites(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditTarget(null);
    setDialogOpen(true);
  };

  const openEdit = (website: AnalyticsWebsite) => {
    setEditTarget(website);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="space-y-4 pt-2">
          <div className="h-7 w-48 animate-pulse rounded-md bg-foreground/5" />
          <div className="h-4 w-72 animate-pulse rounded-md bg-foreground/4" />
          <div className="mt-8 space-y-5">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl bg-foreground/3"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl h-full">
      {websites.length === 0 ? (
        <WebsiteEmptyState onAdd={openAdd} />
      ) : (
        <WebsiteList
          websites={websites}
          onAdd={openAdd}
          onEdit={openEdit}
          onMutate={load}
        />
      )}

      <WebsiteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editTarget}
        onSuccess={load}
      />
    </div>
  );
}
