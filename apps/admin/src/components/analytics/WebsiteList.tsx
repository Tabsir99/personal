"use client";

import { useState } from "react";
import {
  Globe,
  PencilSimple,
  Trash,
  Plus,
  Copy,
  Check,
} from "@phosphor-icons/react";
import { Button } from "premium-ds/button";
import { Tag, TagGroup } from "premium-ds/tag";
import { toast } from "premium-ds/toast";
import { Dialog } from "premium-ds/dialog";
import type { AnalyticsWebsite } from "@/actions/analyticsActions";
import { deleteAnalyticsWebsite } from "@/actions/analyticsActions";

interface WebsiteListProps {
  websites: AnalyticsWebsite[];
  onAdd: () => void;
  onEdit: (website: AnalyticsWebsite) => void;
  onMutate: () => void;
}

export function WebsiteList({
  websites,
  onAdd,
  onEdit,
  onMutate,
}: WebsiteListProps) {
  return (
    <div className="animate-in duration-400 ease-out fade-in slide-in-from-bottom-1">
      <header className="flex items-end justify-between border-b border-foreground/6 pb-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Websites</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Tracked domains. Each website partitions analytics data
            independently.
          </p>
        </div>
        <Button size="sm" iconLeft={<Plus size={14} />} onClick={onAdd}>
          Add
        </Button>
      </header>

      <div className="mt-5 space-y-3">
        {websites.map((site, i) => (
          <div
            key={site.id}
            className="animate-in duration-500 ease-out fill-mode-both fade-in slide-in-from-bottom-2"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <WebsiteCard
              site={site}
              onEdit={() => onEdit(site)}
              onMutate={onMutate}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function WebsiteCard({
  site,
  onEdit,
  onMutate,
}: {
  site: AnalyticsWebsite;
  onEdit: () => void;
  onMutate: () => void;
}) {
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const res = await deleteAnalyticsWebsite(site.id);
    setDeleting(false);
    if (res.status === "error") {
      toast.error(res.message);
      return;
    }
    toast.success(`"${site.name}" deleted`);
    onMutate();
  };

  const copyId = async () => {
    await navigator.clipboard.writeText(site.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group rounded-xl border border-border bg-card px-5 py-4 shadow-card-rest transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-foreground/6 bg-foreground/[0.02]">
            <Globe
              size={16}
              weight="duotone"
              className="text-muted-foreground"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                {site.name}
              </h3>
              <button
                type="button"
                onClick={copyId}
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-foreground/4 hover:text-foreground"
                title="Copy website ID"
              >
                {site.id}
                {copied ? (
                  <Check size={10} weight="bold" className="text-green-600" />
                ) : (
                  <Copy size={10} />
                )}
              </button>
            </div>

            <div className="mt-2.5">
              <TagGroup label="Allowed origins">
                {site.origins.map((origin) => (
                  <Tag key={origin} size="sm">
                    {origin}
                  </Tag>
                ))}
              </TagGroup>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            iconLeft={<PencilSimple size={14} />}
            onClick={onEdit}
            aria-label="Edit"
          />
          <Dialog
            trigger={
              <Button
                variant="ghost"
                size="sm"
                iconLeft={<Trash size={14} />}
                loading={deleting}
                aria-label="Delete"
                className="hover:text-destructive!"
              />
            }
            title="Delete website?"
            description="Are you sure you want to delete? All analytics will be deleted"
          />
        </div>
      </div>
    </div>
  );
}
