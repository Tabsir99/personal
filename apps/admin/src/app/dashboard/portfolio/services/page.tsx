"use client";

import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { Card, CardContent } from "@/components/ui/card";
import Img from "@/components/ui/image";
import { AddCard } from "@/components/ui/add-card";
import { ActionButtonGroup } from "@/components/ui/actionButtonGroup";
import ServiceDialog from "@/components/portfolio/modals/ServiceModal";

import { usePortfolioStore } from "@/stores/PortfolioStore";

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
            <Card className="group/service relative tactile-lift">
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
              <CardContent className="p-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md border border-foreground/6 bg-foreground/2 p-2">
                      <Img
                        src={item.icon}
                        alt={item.title}
                        width={28}
                        height={28}
                      />
                    </div>
                    <h3 className="truncate text-base leading-snug font-semibold tracking-tight">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.content}
                  </p>
                </div>
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
