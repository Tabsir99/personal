"use client";
import { useState } from "react";
import { useShallow } from "zustand/shallow";
import { Star, Video } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Img from "@/components/ui/image";
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

      <div className="stagger-cascade-tight grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, index) => (
          <div
            key={t.name + index}
            style={{ ["--stagger-index" as string]: index }}
          >
            <Card className="group/card relative tactile-lift">
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
                          className={cn(
                            "h-3.5 w-3.5",
                            i < t.rating
                              ? "fill-star text-star"
                              : "text-foreground/15",
                          )}
                        />
                      ))}
                    </div>
                    <span className="font-mono text-eyebrow tabular-nums text-muted-foreground/70">
                      {t.rating.toFixed(1)}
                    </span>
                  </div>
                  {t.displaySlot !== "none" && (
                    <Badge variant="accent">{SLOT_LABEL[t.displaySlot]}</Badge>
                  )}
                </div>

                <p className="line-clamp-5 border-l-2 border-foreground/10 pl-3.5 text-[13px] leading-relaxed text-foreground/80 italic">
                  {t.text}
                </p>

                <div className="flex items-center gap-3 border-t border-foreground/6 pt-4">
                  <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-foreground/6 text-kbd font-medium text-muted-foreground">
                    {t.avatar ? (
                      <Img
                        src={t.avatar}
                        alt={t.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      t.name
                        .split(/\s+/)
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium tracking-tight text-foreground">
                      {t.name}
                    </span>
                    {(t.company || t.period) && (
                      <span className="truncate font-mono text-eyebrow tracking-wider text-muted-foreground">
                        {[t.company, t.period].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </div>
                  {t.video && (
                    <Badge variant="neutral" className="gap-1">
                      <Video />
                      Video
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
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
