"use client";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import { useShallow } from "zustand/shallow";
import TestimonialDialog from "@/components/portfolio/modals/Testimonial";
import { AddCard } from "@/components/ui/add-card";
import { ActionButtonGroup } from "@/components/ui/actionButtonGroup";
import { useState } from "react";

export default function Testimonials() {
  const testimonials = usePortfolioStore(
    useShallow((state) => state.pageData.testimonials)
  );

  const testimonial = usePortfolioStore().testimonials;

  // null = closed, number = editing that index, "new" = adding new
  const [editingIndex, setEditingIndex] = useState<number | "new" | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Testimonials</h2>
          <p className="text-muted-foreground">
            Manage client testimonials and reviews
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonialItem, index) => (
          <Card
            key={testimonialItem.name}
            className={`group relative overflow-hidden rounded-xl border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:border-border hover:bg-card ${
              testimonialItem.size === "large"
                ? "md:col-span-2 lg:col-span-2"
                : testimonialItem.size === "medium"
                  ? "md:col-span-2 lg:col-span-1"
                  : ""
            }`}
          >
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
                  active: testimonialItem.isActive,
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

            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative p-6">
              <div className="mb-4 flex gap-1">
                {[...Array(testimonialItem.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-primary text-primary transition-transform duration-300 group-hover:scale-110"
                    style={{ transitionDelay: `${i * 50}ms` }}
                  />
                ))}
              </div>

              <p className="mb-6 text-base leading-relaxed text-foreground/80">
                "{testimonialItem.text}"
              </p>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-foreground">
                    {testimonialItem.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonialItem.role}, {testimonialItem.company}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {testimonialItem.location}
                  </p>
                </div>

                <div className="shrink-0">
                  <div className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/20">
                    Upwork
                  </div>
                </div>
              </div>

              <div className="mt-4 inline-block rounded-lg border border-border/60 bg-muted/60 px-3 py-1 text-xs text-muted-foreground">
                Project: {testimonialItem.project}
              </div>
            </div>
          </Card>
        ))}

        <AddCard
          title="Add Testimonial"
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
