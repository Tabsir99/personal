import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, Upload, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import { useEffect, useState } from "react";
import { PageData } from "@/types/portfolioTypes";
import { Checkbox } from "@/components/ui/checkbox";

interface TestimonialDialogProps {
  children?: React.ReactNode;
  testimonial?: PageData["testimonials"][number] | undefined;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  testimonialIndex?: number | null;
}

const defaultFormData: PageData["testimonials"][number] = {
  name: "",
  company: "",
  location: "",
  role: "",
  project: "",
  size: "medium" as "large" | "medium" | "small",
  rating: 5,
  text: "",
  video: "",
  isActive: true,
  projectDuration: "",
  projectBudget: "",
  featured: false,
  avatar: "",
  date: "",
} as const;

export default function TestimonialDialog({
  children,
  testimonial: existingTestimonial,
  open,
  onOpenChange,
  testimonialIndex,
}: TestimonialDialogProps) {
  const [formData, setFormData] = useState(
    existingTestimonial || defaultFormData
  );
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (existingTestimonial && typeof testimonialIndex === "number") {
      setFormData(existingTestimonial);
      setIsUpdating(true);
    } else {
      setFormData(defaultFormData);
      setIsUpdating(false);
    }
  }, [existingTestimonial, testimonialIndex]);

  const [hoverRating, setHoverRating] = useState(0);
  const testimonial = usePortfolioStore().testimonials;

  const handleSubmit = () => {
    const testimonialData = {
      ...formData,
      text: formData.text || "",
      video: formData.video || "",
    };

    if (isUpdating) testimonial.update(testimonialIndex!, testimonialData);
    else testimonial.add(testimonialData);
  };

  return (
    <Dialog {...(open && onOpenChange ? { open, onOpenChange } : {})}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col pb-0 overflow-y-auto bg-zinc-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isUpdating ? "Edit Testimonial" : "Add New Testimonial"}
          </DialogTitle>
          <DialogDescription>
            Fill in the client testimonial information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Client Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Client Name</Label>
                <Input
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="mb-2 block">Company</Label>
                <Input
                  placeholder="Tech Corp"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Role</Label>
                <Input
                  placeholder="CTO"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="mb-2 block">Location</Label>
                <Input
                  placeholder="USA"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Avatar URL</Label>
                <Input
                  placeholder="https://..."
                  value={formData.avatar}
                  onChange={(e) =>
                    setFormData({ ...formData, avatar: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="mb-2 block">Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="pt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">
              Project Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Project Name</Label>
                <Input
                  placeholder="E-commerce Platform"
                  value={formData.project}
                  onChange={(e) =>
                    setFormData({ ...formData, project: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="mb-2 block">Project Size</Label>
                <Select
                  value={formData.size}
                  onValueChange={(value: "large" | "medium" | "small") =>
                    setFormData({ ...formData, size: value })
                  }
                >
                  <SelectTrigger className="bg-zinc-800/50 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-white">
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label className="mb-2 block">Project Duration</Label>
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
              </div>

              <div>
                <Label className="mb-2 block">Project Budget</Label>
                <Input
                  placeholder="$10,000 - $20,000"
                  value={formData.projectBudget}
                  onChange={(e) =>
                    setFormData({ ...formData, projectBudget: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Checkbox
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, featured: checked as boolean })
                }
              />
              <Label htmlFor="featured" className="cursor-pointer">
                Featured testimonial
              </Label>
            </div>
          </div>

          {/* Rating */}
          <div className="pt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">
              Rating & Review
            </h3>

            <div>
              <Label className="mb-2 block">Rating</Label>
              <div className="flex gap-2 items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={32}
                      className={`${
                        star <= (hoverRating || formData.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-4 text-sm text-muted-foreground">
                  {formData.rating} / 5
                </span>
              </div>
            </div>

            <div className="mt-4">
              <Label className="mb-2 block">Testimonial Text</Label>
              <Textarea
                placeholder="Excellent work! Very professional and delivered on time..."
                value={formData.text}
                onChange={(e) =>
                  setFormData({ ...formData, text: e.target.value })
                }
                rows={5}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Optional: Leave blank if using video testimonial
              </p>
            </div>
          </div>

          {/* Video Testimonial */}
          <div className="pt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">
              Video Testimonial (Optional)
            </h3>

            <div>
              <Label className="mb-2 block">Video URL</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://youtube.com/..."
                  value={formData.video}
                  onChange={(e) =>
                    setFormData({ ...formData, video: e.target.value })
                  }
                  className="flex-1"
                />
                <Button variant="outline" size="icon">
                  <Upload size={16} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                YouTube, Vimeo, or direct video URL
              </p>
            </div>

            {formData.video && (
              <div className="mt-4 p-3 bg-muted rounded-lg border flex items-center gap-3">
                <Video size={20} className="text-muted-foreground" />
                <span className="text-sm flex-1 truncate">
                  {formData.video}
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sticky bottom-0 py-4 bg-zinc-900">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.name ||
                !formData.company ||
                !formData.role ||
                !formData.project ||
                (!formData.text && !formData.video)
              }
            >
              {isUpdating ? "Update Testimonial" : "Add Testimonial"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
