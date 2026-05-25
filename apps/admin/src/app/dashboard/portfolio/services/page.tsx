"use client";

import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { Card, CardContent } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { AddCard } from "@/components/ui/add-card";
import { ActionButtonGroup } from "@/components/ui/actionButtonGroup";
import ServiceDialog from "@/components/portfolio/modals/ServiceModal";

import { usePortfolioStore } from "@/stores/PortfolioStore";
import { cn } from "@/lib/utils";

export default function Services() {
  const services = usePortfolioStore(
    useShallow((state) => state.pageData.services),
  );
  const service = usePortfolioStore().services;
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl leading-tight font-semibold tracking-tight">
          Services
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The offerings shown on the portfolio landing page.
        </p>
      </header>

      <div className="stagger-cascade-tight grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((item, index) => (
          <div
            key={item.title + index}
            style={{ ["--stagger-index" as string]: index }}
          >
            <Card className="group/card relative tactile-lift">
              <ActionButtonGroup
                buttons={[
                  {
                    onClick: () => service.moveUp(index),
                    variant: "moveUp",
                    disabled: index === 0,
                  },
                  {
                    onClick: () => service.moveDown(index),
                    variant: "moveDown",
                    disabled: index === services.length - 1,
                  },
                  {
                    onClick: () => service.toggle(index, "isActive"),
                    variant: "toggle",
                    active: item.isActive,
                  },
                  { onClick: () => setEditingIndex(index), variant: "edit" },
                  {
                    onClick: () => service.delete(index),
                    variant: "delete",
                  },
                ]}
                entityName="service"
              />
              <CardContent
                className={cn(
                  "flex flex-col gap-3.5 p-5",
                  !item.isActive && "opacity-50",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="font-mono text-eyebrow tracking-widest tabular-nums text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item.label && (
                      <Eyebrow tone="muted" family="mono" className="truncate">
                        {item.label}
                      </Eyebrow>
                    )}
                  </div>
                  {item.frameNum && (
                    <span className="font-mono text-eyebrow tracking-widest tabular-nums text-muted-foreground/60">
                      {item.frameNum}
                    </span>
                  )}
                </div>

                <h3 className="font-heading text-[15px] leading-snug font-medium tracking-tight text-balance">
                  {item.title.replace(/\s*\n\s*/g, " ")}
                </h3>

                {item.desc && (
                  <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                )}

                {item.items.length > 0 && (
                  <ul className="flex flex-col gap-1.5 border-t border-foreground/6 pt-3">
                    {item.items.map((bullet, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 font-mono text-xs leading-relaxed text-muted-foreground"
                      >
                        <span className="mt-px text-primary/70">→</span>
                        <span className="min-w-0">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        ))}

        <ServiceDialog>
          <AddCard
            title="Add service"
            description="Add a new service to your portfolio"
            className="min-h-52"
          />
        </ServiceDialog>
      </div>

      <ServiceDialog
        open={editingIndex !== null}
        onOpenChange={(open) => !open && setEditingIndex(null)}
        serviceIndex={editingIndex}
        {...(editingIndex !== null
          ? { service: services[editingIndex] }
          : {})}
      />
    </div>
  );
}
