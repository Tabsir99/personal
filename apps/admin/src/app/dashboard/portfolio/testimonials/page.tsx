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
          <p className="text-white/50">
            Manage client testimonials and reviews
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonialItem, index) => (
          <Card
            key={testimonialItem.name}
            className={`group relative overflow-hidden border-white/8 bg-white/2 backdrop-blur-sm transition-all duration-300 hover:border-white/12 hover:bg-white/4 rounded-xl ${
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

            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative p-6">
              <div className="mb-4 flex gap-1">
                {[...Array(testimonialItem.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400 transition-transform duration-300 group-hover:scale-110"
                    style={{ transitionDelay: `${i * 50}ms` }}
                  />
                ))}
              </div>

              <p className="mb-6 text-base leading-relaxed text-white/80">
                "{testimonialItem.text}"
              </p>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-white/95">
                    {testimonialItem.name}
                  </h4>
                  <p className="text-sm text-white/60">
                    {testimonialItem.role}, {testimonialItem.company}
                  </p>
                  <p className="mt-1 text-xs text-white/50">
                    {testimonialItem.location}
                  </p>
                </div>

                <div className="shrink-0">
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400 transition-all duration-300 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30">
                    Upwork
                  </div>
                </div>
              </div>

              <div className="mt-4 inline-block rounded-lg bg-white/5 border border-white/10 px-3 py-1 text-xs text-white/60">
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
