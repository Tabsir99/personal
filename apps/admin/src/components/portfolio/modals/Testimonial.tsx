import { useEffect, useState } from "react";
import { Plus, Star } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/ui/FormField";
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
      footer={
        <PortfolioModalActions
          onSubmit={handleSubmit}
          submitDisabled={
            !formData.name || (!formData.text && !formData.video.length)
          }
          submitLabel="Add testimonial"
          updateLabel="Update testimonial"
          isUpdating={isUpdating}
          submitIcon={<Plus className="h-3.5 w-3.5" />}
        />
      }
    >
      <ModalSection title="Client">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <FormField label="Name">
            <Input
              placeholder="Zohaib"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </FormField>
          <FormField label="Company">
            <Input
              placeholder="DataZoro"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
            />
          </FormField>
          <FormField label="Period" hint="e.g. Mar — Jul 2025">
            <Input
              placeholder="Mar — Jul 2025"
              value={formData.period}
              onChange={(e) =>
                setFormData({ ...formData, period: e.target.value })
              }
            />
          </FormField>
          <FormField label="Avatar URL">
            <Input
              placeholder="https://…"
              value={formData.avatar}
              onChange={(e) =>
                setFormData({ ...formData, avatar: e.target.value })
              }
              className="font-mono text-xs"
            />
          </FormField>
        </div>
      </ModalSection>

      <ModalSection title="Placement">
        <FormField
          label="Display slot"
          hint="Endorsement = quote-only card. Voices = video testimonial slot."
        >
          <Select
            value={formData.displaySlot}
            onValueChange={(value: DisplaySlot) =>
              setFormData({ ...formData, displaySlot: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Hidden</SelectItem>
              <SelectItem value="endorsement">Endorsement</SelectItem>
              <SelectItem value="voices">Voices</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </ModalSection>

      <ModalSection title="Rating & quote">
        <FormField label="Rating">
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
                  className={cn(
                    "h-6 w-6 transition-colors duration-150",
                    star <= (hoverRating || formData.rating)
                      ? "fill-star text-star"
                      : "text-foreground/15",
                  )}
                />
              </button>
            ))}
            <span className="ml-3 font-mono text-xs tabular-nums text-muted-foreground">
              {formData.rating} / 5
            </span>
          </div>
        </FormField>

        <FormField
          label="Quote"
          hint="Optional — leave blank if using a video testimonial."
        >
          <Textarea
            placeholder="Excellent work — professional and delivered on time…"
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            rows={5}
          />
        </FormField>
      </ModalSection>

      <ModalSection title="Video">
        <FormField
          label="Video sources"
          hint="Upload or paste one or more encoded files (webm/mp4/…). The browser plays the most efficient codec it supports."
        >
          <VideoSourcesEditor
            value={formData.video}
            onChange={(video) => setFormData({ ...formData, video })}
          />
        </FormField>
      </ModalSection>
    </PortfolioModalFrame>
  );
}
