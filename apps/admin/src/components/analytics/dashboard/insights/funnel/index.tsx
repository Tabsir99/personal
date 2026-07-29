"use client";

import { useState } from "react";
import { PlusIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "premium-ds/button";
import { Dialog } from "premium-ds/dialog";
import { toast } from "premium-ds/toast";
import { useAnalyticsStore } from "@/stores/analyticsStore";
import { PERIOD_LABEL } from "@/components/analytics/dashboard/shared/chartFormat";
import { cn } from "@/lib/utils";
import { deleteFunnel } from "@/actions/funnelActions";
import { FunnelRiver, type RiverStep } from "./FunnelRiver";
import { FunnelMenu } from "./FunnelMenu";
import { FunnelDialog } from "./FunnelDialog";

export function FunnelTab() {
  const {
    funnels,
    funnelsLoading,
    activeFunnelId,
    funnel,
    funnelLoading,
    period,
    websiteId,
    setActiveFunnel,
    reloadFunnels,
  } = useAnalyticsStore(
    useShallow((s) => ({
      funnels: s.funnels,
      funnelsLoading: s.funnelsLoading,
      activeFunnelId: s.activeFunnelId,
      funnel: s.funnel,
      funnelLoading: s.funnelLoading,
      period: s.period,
      websiteId: s.websiteId,
      setActiveFunnel: s.setActiveFunnel,
      reloadFunnels: s.reloadFunnels,
    })),
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const editing = funnels?.find((f) => f.id === editingId) ?? null;
  const pendingDelete = funnels?.find((f) => f.id === deletingId) ?? null;

  const openCreate = () => {
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (id: string) => {
    setEditingId(id);
    setDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    const res = await deleteFunnel(pendingDelete.id);
    setDeleting(false);

    if (res.status === "error") {
      toast.error(res.message);
      return;
    }

    toast.success(`"${pendingDelete.name}" deleted`);
    setDeletingId(null);
    reloadFunnels();
  };

  const funnelDialog = websiteId ? (
    <FunnelDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      websiteId={websiteId}
      editing={editing}
      onSuccess={(id) => reloadFunnels(id)}
    />
  ) : null;

  const deleteDialog = (
    <Dialog
      open={pendingDelete !== null}
      onOpenChange={(o) => !o && setDeletingId(null)}
      tone="danger"
      title="Delete funnel?"
      description={
        pendingDelete
          ? `"${pendingDelete.name}" and its step configuration will be permanently removed. Collected analytics events are not affected.`
          : ""
      }
      footer={(close) => (
        <div className="flex gap-2">
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} loading={deleting}>
            Delete
          </Button>
        </div>
      )}
    />
  );

  if (funnels === null || (funnelsLoading && funnels.length === 0)) {
    return (
      <div className="h-full p-3">
        <div className="h-full animate-pulse rounded-lg bg-foreground/3" />
      </div>
    );
  }

  if (funnels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <div>
          <p className="text-sm font-medium text-foreground/80">
            No funnels yet
          </p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground/60">
            Chain goals and pageviews into a conversion flow to see where
            visitors drop off.
          </p>
        </div>
        <Button
          onClick={openCreate}
          iconLeft={<PlusIcon size={15} weight="bold" />}
        >
          Create funnel
        </Button>
        {funnelDialog}
      </div>
    );
  }

  const steps: RiverStep[] = funnel
    ? funnel.data.map((d, i) => ({
        ...d,
        name: funnel.funnel.steps[i]?.name ?? d.label,
        kind: funnel.funnel.steps[i]?.type ?? "goal",
      }))
    : [];

  const conv = funnel?.metrics.overallConversionRate ?? 0;

  return (
    <div className="relative h-110 overflow-hidden">
      {funnelLoading && !funnel ? (
        <div className="absolute inset-3 animate-pulse rounded-lg bg-foreground/3" />
      ) : steps.length ? (
        <div className={cn("h-full", funnelLoading && "opacity-60")}>
          <FunnelRiver steps={steps} />
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground/50">
          No data for this period
        </div>
      )}

      <div className="pointer-events-none absolute top-13 right-4 text-right">
        <div className="text-sm font-semibold text-foreground">
          {conv >= 99.95 ? "100" : conv.toFixed(1)}% conversion rate
        </div>
        <div className="text-xs text-muted-foreground/70">
          {PERIOD_LABEL[period] ?? period}
        </div>
      </div>

      <div className="absolute top-3 right-3 z-30">
        <FunnelMenu
          funnels={funnels}
          activeId={activeFunnelId}
          onSelect={setActiveFunnel}
          onCreate={openCreate}
          onEdit={openEdit}
          onDelete={setDeletingId}
        />
      </div>

      {funnelDialog}
      {deleteDialog}
    </div>
  );
}
