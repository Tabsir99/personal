/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Plus, Star } from "@phosphor-icons/react";

import { TextField } from "premium-ds/text-field";
import { Textarea } from "premium-ds/textarea";
import { Select } from "premium-ds/select";

import { usePortfolioStore } from "@/stores/PortfolioStore";
import { PageData } from "@tabsircg/schemas/portfolio";
import { cn } from "@/lib/utils";

import {
  ModalSection,
  PortfolioModalActions,
  PortfolioModalFrame,
} from "./_shared";
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
  const [formData, setFormData] = useState(
    existingTestimonial || defaultFormData,
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
     
    if (existingTestimonial && typeof testimonialIndex === "number") {
      setFormData(existingTestimonial);
      setIsUpdating(true);
    } else {
      setFormData(defaultFormData);
      setIsUpdating(false);
    }
  }, [existingTestimonial, testimonialIndex]);

  const testimonial = usePortfolioStore().testimonials;

  const handleSubmit = () => {
    if (isUpdating) testimonial.update(testimonialIndex!, formData);
    else testimonial.add(formData);
  };

  return (
    <PortfolioModalFrame
      open={open}
      onOpenChange={onOpenChange}
      {...(children ? { trigger: children } : {})}
      size="lg"
      title={
        isUpdating ? formData.name || "Edit testimonial" : "Add testimonial"
      }
      description="Client quote, optional video, and where it surfaces on the home page."
      footer={(close) => (
        <PortfolioModalActions
          onSubmit={handleSubmit}
          submitDisabled={
            !formData.name || (!formData.text && !formData.video.length)
          }
          submitLabel="Add testimonial"
          updateLabel="Update testimonial"
          isUpdating={isUpdating}
          submitIcon={<Plus size={14} />}
          close={close}
        />
      )}
    >
      <ModalSection title="Client">
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
            className="font-mono text-xs"
          />
        </div>
      </ModalSection>

      <ModalSection title="Placement">
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
      </ModalSection>

      <ModalSection title="Rating & quote">
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
      </ModalSection>

      <ModalSection title="Video">
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
      </ModalSection>
    </PortfolioModalFrame>
  );
}

