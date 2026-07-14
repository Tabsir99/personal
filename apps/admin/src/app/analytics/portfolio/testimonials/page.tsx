"use client";
import { useState } from "react";
import { useShallow } from "zustand/shallow";
import { Star, VideoCamera } from "@phosphor-icons/react";

import { Badge } from "premium-ds/badge";
import { Avatar } from "premium-ds/avatar";

import { usePortfolioStore } from "@/stores/PortfolioStore";
import TestimonialDialog from "@/components/portfolio/modals/Testimonial";
import { AddCard } from "@/components/ui/add-card";
import { ActionButtonGroup } from "@/components/ui/actionButtonGroup";
import { cn } from "@/lib/utils";

const SLOT_LABEL: Record<"endorsement" | "voices" | "none", string> = {
  endorsement: "Endorsement",
  voices: "Voices",
  none: "Hidden",
};

export default function Testimonials() {
  const testimonials = usePortfolioStore(
    useShallow((state) => state.pageData.testimonials),
  );
  const testimonial = usePortfolioStore().testimonials;
  const [editingIndex, setEditingIndex] = useState<number | "new" | null>(null);

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl leading-tight font-semibold tracking-tight">
          Client testimonials
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Quotes and reviews displayed on the portfolio home.
        </p>
      </header>

      <div className="grid stagger-cascade-tight grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, index) => (
          <div
            key={t.name + index}
            style={{ ["--stagger-index" as string]: index }}
          >
            <div className="group/card relative rounded-lg border border-border bg-card tactile-lift">
              <ActionButtonGroup
                buttons={[
                  {
                    variant: "moveUp",
                    onClick: () => testimonial.moveUp(index),
                    disabled: index === 0,
                  },
                  {
                    variant: "moveDown",
                    onClick: () => testimonial.moveDown(index),
                    disabled: index === testimonials.length - 1,
                  },
                  {
                    variant: "toggle",
                    onClick: () => testimonial.toggle(index, "isActive"),
                    active: t.isActive,
                  },
                  {
                    variant: "edit",
                    onClick: () => setEditingIndex(index),
                  },
                  {
                    variant: "delete",
                    onClick: () => testimonial.delete(index),
                  },
                ]}
                entityName="Testimonial"
              />

              <div
                className={cn(
                  "relative flex flex-col gap-4 p-5",
                  !t.isActive && "opacity-50",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          weight={i < t.rating ? "fill" : "regular"}
                          className={cn(
                            "transition-colors duration-150",
                            i < t.rating
                              ? "text-warning"
                              : "text-foreground/15",
                          )}
                        />
                      ))}
                    </div>
                    <span className="font-mono text-sm font-medium tracking-wider text-muted-foreground/70 uppercase tabular-nums">
                      {t.rating.toFixed(1)}
                    </span>
                  </div>
                  {t.displaySlot !== "none" && (
                    <Badge tone="info">{SLOT_LABEL[t.displaySlot]}</Badge>
                  )}
                </div>

                <p className="line-clamp-5 border-l-2 border-foreground/10 pl-3.5 text-[13px] leading-relaxed text-foreground/80 italic">
                  {t.text}
                </p>

                <div className="flex items-center gap-3 border-t border-foreground/6 pt-4">
                  <Avatar src={t.avatar} name={t.name} size="sm" />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium tracking-tight text-foreground">
                      {t.name}
                    </span>
                    {(t.company || t.period) && (
                      <span className="truncate font-mono text-sm font-medium tracking-wider tracking-wider text-muted-foreground uppercase">
                        {[t.company, t.period].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </div>
                  {t.video.length > 0 && (
                    <Badge tone="neutral" className="flex items-center gap-1">
                      <VideoCamera size={12} />
                      Video
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        <AddCard
          title="Add testimonial"
          description="Add a new client review"
          onClick={() => setEditingIndex("new")}
        />
      </div>

      <TestimonialDialog
        open={editingIndex !== null}
        onOpenChange={(open) => !open && setEditingIndex(null)}
        testimonialIndex={
          typeof editingIndex === "number" ? editingIndex : null
        }
        testimonial={
          typeof editingIndex === "number"
            ? testimonials[editingIndex]
            : undefined
        }
      />
    </div>
  );
}

