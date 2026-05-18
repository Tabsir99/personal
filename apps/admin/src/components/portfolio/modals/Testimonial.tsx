import { useEffect, useState } from "react";
import { Plus, Star, Video } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FormField } from "@/components/ui/FormField";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import { PageData } from "@tabsircg/schemas/portfolio";
import { cn } from "@/lib/utils";

import {
  ModalSection,
  PortfolioModalActions,
  PortfolioModalFrame,
} from "./_shared";

interface TestimonialDialogProps {
  children?: React.ReactNode;
  testimonial?: PageData["testimonials"][number] | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonialIndex?: number | null;
}

const defaultFormData: PageData["testimonials"][number] = {
  name: "",
  company: "",
  location: "",
  role: "",
  project: "",
  size: "medium",
  rating: 5,
  text: "",
  video: "",
  isActive: true,
  projectDuration: "",
  projectBudget: "",
  featured: false,
  avatar: "",
  date: "",
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
    const data = {
      ...formData,
      text: formData.text || "",
      video: formData.video || "",
    };
    if (isUpdating) testimonial.update(testimonialIndex!, data);
    else testimonial.add(data);
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
      description="Client quote, optional video, and the project it came from."
      footer={
        <PortfolioModalActions
          onSubmit={handleSubmit}
          submitDisabled={
            !formData.name ||
            !formData.company ||
            !formData.role ||
            !formData.project ||
            (!formData.text && !formData.video)
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
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </FormField>
          <FormField label="Company">
            <Input
              placeholder="Tech Corp"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
            />
          </FormField>
          <FormField label="Role">
            <Input
              placeholder="CTO"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            />
          </FormField>
          <FormField label="Location">
            <Input
              placeholder="USA"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
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
          <FormField label="Date">
            <Input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
          </FormField>
        </div>
      </ModalSection>

      <ModalSection title="Project">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <FormField label="Project name">
            <Input
              placeholder="E-commerce platform"
              value={formData.project}
              onChange={(e) =>
                setFormData({ ...formData, project: e.target.value })
              }
            />
          </FormField>
          <FormField label="Size">
            <Select
              value={formData.size}
              onValueChange={(value: "large" | "medium" | "small") =>
                setFormData({ ...formData, size: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Duration">
            <Input
              placeholder="3 months"
              value={formData.projectDuration}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  projectDuration: e.target.value,
                })
              }
            />
          </FormField>
          <FormField label="Budget">
            <Input
              placeholder="$10,000 – $20,000"
              value={formData.projectBudget}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  projectBudget: e.target.value,
                })
              }
            />
          </FormField>
        </div>

        <label className="flex items-center gap-3 rounded-md border border-foreground/6 bg-foreground/2 px-4 py-3">
          <Checkbox
            id="featured"
            checked={formData.featured}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, featured: checked as boolean })
            }
          />
          <span className="flex flex-col gap-0.5">
            <Eyebrow tone="foreground" family="mono">
              Featured
            </Eyebrow>
            <span className="text-xs leading-relaxed text-muted-foreground">
              Pin this testimonial to the top of the page.
            </span>
          </span>
        </label>
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
        <FormField label="Video URL" hint="YouTube, Vimeo, or direct file URL.">
          <div className="flex gap-2">
            <Input
              placeholder="https://youtube.com/…"
              value={formData.video}
              onChange={(e) =>
                setFormData({ ...formData, video: e.target.value })
              }
              className="flex-1 font-mono text-xs"
            />
          </div>
        </FormField>

        {formData.video && (
          <div className="flex items-center gap-3 rounded-md border border-foreground/6 bg-foreground/2 px-3 py-2">
            <Video className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate font-mono text-xs">
              {formData.video}
            </span>
          </div>
        )}
      </ModalSection>
    </PortfolioModalFrame>
  );
}
