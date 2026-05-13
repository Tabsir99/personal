import { useEffect, useRef, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Image as ImageIcon, Plus } from "lucide-react";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Img from "@/components/ui/image";
import { PageData } from "@tabsircg/schemas/portfolio";

interface ProjectDialogProps {
  children?: React.ReactNode;
  project?: PageData["projects"][number] | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectIndex?: number | null;
}

type ProjectLink = PageData["projects"][number]["links"][number];
type LinkType = ProjectLink["type"];

const LINK_TYPE_OPTIONS: {
  value: LinkType;
  label: string;
  placeholder: string;
}[] = [
  { value: "live", label: "Live", placeholder: "Live Demo" },
  { value: "repo", label: "Repo", placeholder: "GitHub" },
  { value: "case-study", label: "Case Study", placeholder: "Case Study" },
  { value: "video", label: "Video", placeholder: "Watch Video" },
  { value: "other", label: "Other", placeholder: "Visit" },
];

const defaultFormData: PageData["projects"][number] = {
  image: "",
  title: "",
  type: "Personal",
  description: "",
  links: [],
  skills: [],
  isActive: true,
  featured: false,
  metrics: [],
  year: "",
  duration: "",
  role: "",
  clientType: "",
};

export default function ProjectDialog({
  children,
  project: existingProject,
  open,
  onOpenChange,
  projectIndex,
}: ProjectDialogProps) {
  const [formData, setFormData] = useState(existingProject || defaultFormData);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (existingProject && typeof projectIndex === "number") {
      setFormData({
        ...existingProject,
        metrics: existingProject.metrics || [],
      });
      setIsUpdating(true);
    } else {
      setFormData(defaultFormData);
      setIsUpdating(false);
    }
  }, [existingProject, projectIndex]);

  const [currentSkill, setCurrentSkill] = useState("");
  const [metricLabel, setMetricLabel] = useState("");
  const [metricValue, setMetricValue] = useState("");

  const project = usePortfolioStore().projects;

  const handleAddSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, currentSkill.trim()],
      });
      setCurrentSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleAddLink = () => {
    setFormData({
      ...formData,
      links: [...formData.links, { text: "", url: "", type: "other" }],
    });
  };

  const handleUpdateLink = (i: number, patch: Partial<ProjectLink>) => {
    setFormData({
      ...formData,
      links: formData.links.map((l, idx) =>
        idx === i ? { ...l, ...patch } : l,
      ),
    });
  };

  const handleRemoveLink = (i: number) => {
    setFormData({
      ...formData,
      links: formData.links.filter((_, idx) => idx !== i),
    });
  };

  const handleAddMetric = () => {
    if (
      metricLabel.trim() &&
      metricValue.trim() &&
      formData.metrics.length < 2
    ) {
      setFormData({
        ...formData,
        metrics: [
          ...formData.metrics,
          { label: metricLabel.trim(), value: metricValue.trim() },
        ],
      });
      setMetricLabel("");
      setMetricValue("");
    }
  };

  const handleSubmit = async () => {
    if (isUpdating) project.update(projectIndex!, formData);
    else project.add(formData);
  };

  const imageInputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger render={children as React.ReactElement} />}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isUpdating ? "Edit Project" : "Add New Project"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill in the details for your project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Image Upload */}
          <div>
            <Label className="mb-2 block text-foreground/80">
              Project Image
            </Label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => imageInputRef.current?.click()}
                className="flex min-h-40 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/40"
              >
                {formData.image ? (
                  <Img
                    src={formData.image}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon size={32} className="text-muted-foreground" />
                )}
              </div>

              <Input
                type="file"
                ref={imageInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFormData({
                      ...formData,
                      image: URL.createObjectURL(file),
                    });
                  }
                }}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <Label className="mb-2 block text-foreground/80">
                Project Title
              </Label>
              <Input
                placeholder="E-commerce Platform"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* Type */}
            <div>
              <Label className="mb-2 block text-foreground/80">
                Project Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: "Personal" | "Demo" | "Freelance") =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Demo">Demo</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="mb-2 block text-foreground/80">Description</Label>
            <Textarea
              placeholder="A full-featured e-commerce platform with payment integration..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Links */}
          <div className="space-y-3">
            <Label className="block text-foreground/80">Links</Label>

            {formData.links.map((link, i) => {
              const placeholder =
                LINK_TYPE_OPTIONS.find((o) => o.value === link.type)
                  ?.placeholder ?? "Link text";
              return (
                <div
                  key={i}
                  className="grid grid-cols-[140px_1fr_1fr_auto] items-end gap-2"
                >
                  <div>
                    <Label className="mb-1.5 block text-xs text-muted-foreground">
                      Type
                    </Label>
                    <Select
                      value={link.type}
                      onValueChange={(value: LinkType) =>
                        handleUpdateLink(i, { type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LINK_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs text-muted-foreground">
                      Text
                    </Label>
                    <Input
                      placeholder={placeholder}
                      value={link.text}
                      onChange={(e) =>
                        handleUpdateLink(i, { text: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs text-muted-foreground">
                      URL
                    </Label>
                    <Input
                      placeholder="https://..."
                      value={link.url}
                      onChange={(e) =>
                        handleUpdateLink(i, { url: e.target.value })
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveLink(i)}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X size={16} />
                  </Button>
                </div>
              );
            })}

            <Button
              type="button"
              variant="outline"
              onClick={handleAddLink}
              className="w-full border-dashed border-border hover:bg-accent"
            >
              <Plus size={14} /> Add Link
            </Button>
          </div>

          {/* Skills */}
          <div>
            <Label className="mb-2 block text-foreground/80">
              Technologies & Skills
            </Label>
            <div className="mb-3 flex gap-2">
              <Input
                placeholder="Add a skill..."
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAddSkill}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus size={16} />
              </Button>
            </div>

            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-muted/30 p-4">
                {formData.skills.map((skill, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="border-primary/30 bg-primary/20 py-1 pl-3 pr-1 text-primary"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 rounded-full p-0.5 hover:bg-primary/30"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Featured Toggle */}
          <div>
            <Label className="mb-2 block text-foreground/80">
              Featured Project
            </Label>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <Checkbox
                id="featured"
                checked={formData.featured || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, featured: checked as boolean })
                }
              />
              <Label
                htmlFor="featured"
                className="cursor-pointer text-foreground/80"
              >
                Highlight this project with a featured badge
              </Label>
            </div>
          </div>

          {/* Metrics */}
          <div>
            <Label className="mb-2 block text-foreground/80">
              Project Metrics (Optional)
            </Label>
            <p className="mb-3 text-xs text-muted-foreground">
              Add up to 2 metrics to showcase results (e.g., "10K users", "0.8s
              load time")
            </p>

            {formData.metrics.length < 2 && (
              <div className="mb-3 grid grid-cols-2 gap-4">
                <Input
                  placeholder="Metric label (e.g., Users)"
                  value={metricLabel}
                  onChange={(e) => setMetricLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddMetric();
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Value (e.g., 10K+)"
                    value={metricValue}
                    onChange={(e) => setMetricValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddMetric();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddMetric}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
            )}

            {formData.metrics.length > 0 && (
              <div className="flex gap-3 rounded-lg border border-border bg-muted/30 p-4">
                {formData.metrics.map((metric, i) => (
                  <div
                    key={i}
                    className="group relative flex-1 rounded-lg border border-border/70 bg-muted/60 p-3"
                  >
                    <button
                      onClick={() =>
                        setFormData({
                          ...formData,
                          metrics: formData.metrics.filter(
                            (_, idx) => idx !== i,
                          ),
                        })
                      }
                      className="absolute -right-2 -top-2 rounded-full bg-destructive/80 p-1 opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
                    >
                      <X size={12} className="text-destructive-foreground" />
                    </button>
                    <div className="text-xs text-muted-foreground">
                      {metric.label}
                    </div>
                    <div className="text-sm font-bold text-foreground">
                      {metric.value}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {formData.metrics.length >= 2 && (
              <p className="mt-2 text-xs text-destructive/80">
                Maximum 2 metrics reached. Remove one to add another.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block text-foreground/80">Year</Label>
              <Input
                placeholder="2024"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
              />
            </div>

            <div>
              <Label className="mb-2 block text-foreground/80">Duration</Label>
              <Input
                placeholder="3 months"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block text-foreground/80">
                Role (Optional)
              </Label>
              <Input
                placeholder="Full Stack Developer"
                value={formData.role || ""}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label className="mb-2 block text-foreground/80">Client Type</Label>
            <Input
              placeholder="Startup, Enterprise, Personal, etc."
              value={formData.clientType}
              onChange={(e) =>
                setFormData({ ...formData, clientType: e.target.value })
              }
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <DialogClose render={<Button variant="outline">Cancel</Button>} />

          <DialogClose
            render={
              <Button
                onClick={handleSubmit}
                className="bg-primary hover:bg-primary/90"
                disabled={!formData.title || !formData.description}
              >
                {isUpdating ? (
                  "Update Project"
                ) : (
                  <>
                    <Plus /> Add Project
                  </>
                )}
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
