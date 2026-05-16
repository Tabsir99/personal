"use client";
import { useState } from "react";
import { useShallow } from "zustand/shallow";
import { Star } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import TestimonialDialog from "@/components/portfolio/modals/Testimonial";
import { AddCard } from "@/components/ui/add-card";
import { ActionButtonGroup } from "@/components/ui/actionButtonGroup";
import { cn } from "@/lib/utils";

export default function Testimonials() {
  const testimonials = usePortfolioStore(
    useShallow((state) => state.pageData.testimonials),
  );
  const testimonial = usePortfolioStore().testimonials;
  const [editingIndex, setEditingIndex] = useState<number | "new" | null>(null);

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <Eyebrow tone="muted" family="mono">
          Portfolio · testimonials
        </Eyebrow>
        <h1 className="text-2xl leading-tight font-semibold tracking-tight">
          Client testimonials
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Quotes and reviews displayed on the testimonials page.
        </p>
      </header>

      <div className="stagger-cascade-tight grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, index) => (
          <div
            key={t.name + index}
            style={{ ["--stagger-index" as string]: index }}
            className={cn(
              t.size === "large" && "md:col-span-2 lg:col-span-2",
              t.size === "medium" && "md:col-span-2 lg:col-span-1",
            )}
          >
            <Card className="group/testimonial relative tactile-lift">
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

              <div className="relative flex flex-col gap-4 p-6">
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

                <p className="text-sm leading-relaxed text-foreground/85">
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="flex items-start justify-between gap-4 border-t border-foreground/[0.06] pt-4">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-semibold tracking-tight text-foreground">
                      {t.name}
                    </span>
                    <span className="truncate text-xs leading-relaxed text-muted-foreground">
                      {t.role}
                      {t.company ? `, ${t.company}` : null}
                    </span>
                    {t.location && (
                      <Eyebrow tone="muted" family="mono">
                        {t.location}
                      </Eyebrow>
                    )}
                  </div>
                  <Badge variant="accent">Upwork</Badge>
                </div>

                {t.project && (
                  <Eyebrow tone="muted" family="mono">
                    Project · {t.project}
                  </Eyebrow>
                )}
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
