/* eslint-disable react-hooks/set-state-in-effect */
import { useState } from "react";
import { Plus, Star } from "@phosphor-icons/react";

import { TextField } from "premium-ds/text-field";
import { Textarea } from "premium-ds/textarea";
import { Select } from "premium-ds/select";

import { usePortfolioStore } from "@/stores/PortfolioStore";
import { PageData } from "@tabsircg/schemas/portfolio";
import { cn } from "@/lib/utils";

import { Dialog } from "premium-ds/dialog";
import { Button } from "premium-ds/button";
import { VideoSourcesEditor } from "./VideoSourcesEditor";

interface TestimonialDialogProps {
  children?: React.ReactNode;
  testimonial?: PageData["testimonials"][number] | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonialIndex?: number | null;
}

type Testimonial = PageData["testimonials"][number];
type DisplaySlot = Testimonial["displaySlot"];

const DISPLAY_SLOT_OPTIONS = [
  { value: "none", label: "Hidden" },
  { value: "endorsement", label: "Endorsement" },
  { value: "voices", label: "Voices" },
];

const defaultFormData: Testimonial = {
  name: "",
  company: "",
  period: "",
  rating: 5,
  text: "",
  video: [],
  avatar: "",
  displaySlot: "none",
  isActive: true,
  order: 0,
};

export default function TestimonialDialog({
  children,
  testimonial: existingTestimonial,
  open,
  onOpenChange,
  testimonialIndex,
}: TestimonialDialogProps) {
  const isUpdating =
    existingTestimonial !== undefined && typeof testimonialIndex === "number";

  const [formData, setFormData] = useState(existingTestimonial || defaultFormData);
  const [hoverRating, setHoverRating] = useState(0);

  // Synchronously adjust state during render when dialog opens
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevTestimonial, setPrevTestimonial] = useState(existingTestimonial);

  if (open !== prevOpen || existingTestimonial !== prevTestimonial) {
    setPrevOpen(open);
    setPrevTestimonial(existingTestimonial);
    if (open) {
      setFormData(existingTestimonial || defaultFormData);
    }
  }

  const testimonial = usePortfolioStore().testimonials;

  const handleSubmit = () => {
    if (isUpdating) testimonial.update(testimonialIndex!, formData);
    else testimonial.add(formData);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange?.(nextOpen);
        if (nextOpen) {
          setFormData(existingTestimonial || defaultFormData);
        }
      }}
      trigger={children as React.ReactElement | null}
      size="lg"
      title={
        isUpdating ? formData.name || "Edit testimonial" : "Add testimonial"
      }
      description="Client quote, optional video, and where it surfaces on the home page."
      footer={(close) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button 
            variant="primary" 
            onClick={() => {
              handleSubmit();
              close();
            }} 
            disabled={
              !formData.name || (!formData.text && !formData.video.length)
            }
            iconLeft={<Plus size={14} />}
          >
            {isUpdating ? "Update testimonial" : "Add testimonial"}
          </Button>
        </div>
      )}
    >
      <div className="space-y-5">
        <section title="Client" className="space-y-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <TextField
              id="testimonial-name"
              label="Name"
              placeholder="Zohaib"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <TextField
              id="testimonial-company"
              label="Company"
              placeholder="DataZoro"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
            />
            <TextField
              id="testimonial-period"
              label="Period"
              helper="e.g. Mar — Jul 2025"
              placeholder="Mar — Jul 2025"
              value={formData.period}
              onChange={(e) =>
                setFormData({ ...formData, period: e.target.value })
              }
            />
            <TextField
              id="testimonial-avatar"
              label="Avatar URL"
              placeholder="https://…"
              value={formData.avatar}
              onChange={(e) =>
                setFormData({ ...formData, avatar: e.target.value })
              }
              size="sm"
              className="font-mono"
            />
          </div>
        </section>

        <section title="Placement" className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Display slot</label>
            <Select
              options={DISPLAY_SLOT_OPTIONS}
              value={formData.displaySlot}
              onChange={(value) =>
                setFormData({ ...formData, displaySlot: value as DisplaySlot })
              }
              placeholder="Choose placement"
              ariaLabel="Display slot"
            />
            <p className="text-[13px] text-muted-foreground mt-1">
              Endorsement = quote-only card. Voices = video testimonial slot.
            </p>
          </div>
        </section>

        <section title="Rating & quote" className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">
              Rating
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-colors"
                  aria-label={`Set rating to ${star}`}
                >
                  <Star
                    size={24}
                    weight={star <= (hoverRating || formData.rating) ? "fill" : "regular"}
                    className={cn(
                      "transition-colors duration-150",
                      star <= (hoverRating || formData.rating)
                        ? "text-warning"
                        : "text-foreground/15",
                    )}
                  />
                </button>
              ))}
              <span className="ml-3 font-mono text-xs text-muted-foreground tabular-nums">
                {formData.rating} / 5
              </span>
            </div>
          </div>

          <Textarea
            id="testimonial-quote"
            label="Quote"
            helper="Optional — leave blank if using a video testimonial."
            placeholder="Excellent work — professional and delivered on time…"
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            minRows={5}
          />
        </section>

        <section title="Video" className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">
              Video sources
            </label>
            <VideoSourcesEditor
              value={formData.video}
              onChange={(video) => setFormData({ ...formData, video })}
            />
            <p className="text-xs text-muted-foreground">
              Upload or paste one or more encoded files (webm/mp4/…). The browser plays the most efficient codec it supports.
            </p>
          </div>
        </section>
      </div>
    </Dialog>
  );
}

