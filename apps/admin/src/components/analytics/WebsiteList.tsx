"use client";

import { Plus } from "@phosphor-icons/react";
import { Button } from "premium-ds/button";
import type { AnalyticsWebsite } from "@/actions/analyticsActions";
import { WebsitePanel } from "./WebsitePanel";

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
      <header className="flex items-end justify-between pb-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Websites</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Tracked domains. Each website partitions analytics data
            independently.
          </p>
        </div>
        <Button size="sm" iconLeft={<Plus size={14} />} onClick={onAdd}>
          Add website
        </Button>
      </header>

      <div className="space-y-6 stagger-cascade">
        {websites.map((site, i) => (
          <div
            key={site.id}
            style={{ "--stagger-index": i } as React.CSSProperties}
          >
            <WebsitePanel
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
