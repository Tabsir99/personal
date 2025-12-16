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
import { PageData } from "@/types/portfolioTypes";

interface ProjectDialogProps {
  children?: React.ReactNode;
  project?: PageData["projects"][number] | undefined;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  projectIndex?: number | null;
}

const defaultFormData: PageData["projects"][number] = {
  image: "",
  title: "",
  type: "Personal" as "Personal" | "Demo" | "Freelance",
  description: "",
  link1: { text: "Live Demo", url: "" },
  link2: { text: "GitHub", url: "" },
  skills: [],
  isActive: true,
  featured: false,
  metrics: [],
  year: "",
  duration: "",
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
    <Dialog
      {...(open !== undefined && onOpenChange !== undefined
        ? { open, onOpenChange }
        : {})}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-white/10 bg-zinc-900">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isUpdating ? "Edit Project" : "Add New Project"}
          </DialogTitle>
          <DialogDescription className="text-white/50">
            Fill in the details for your project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 text-white">
          {/* Image Upload */}
          <div>
            <Label className="mb-2 block text-white/70">Project Image</Label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => imageInputRef.current?.click()}
                className="flex min-h-40 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-white/10 bg-zinc-800/50"
              >
                {formData.image ? (
                  <Img
                    src={formData.image}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon size={32} className="text-white/30" />
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
              <Label className="mb-2 block text-white/70">Project Title</Label>
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
              <Label className="mb-2 block text-white/70">Project Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "Personal" | "Demo" | "Freelance") =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-zinc-900 text-white">
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Demo">Demo</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="mb-2 block text-white/70">Description</Label>
            <Textarea
              placeholder="A full-featured e-commerce platform with payment integration..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Links */}
          <div className="space-y-4">
            <Label className="block text-white/70">Links</Label>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-xs text-white/50">
                  Link 1 Text
                </Label>
                <Input
                  placeholder="Live Demo"
                  value={formData.link1.text}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      link1: { ...formData.link1, text: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label className="mb-2 block text-xs text-white/50">
                  Link 1 URL
                </Label>
                <Input
                  placeholder="https://demo.com"
                  value={formData.link1.url}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      link1: { ...formData.link1, url: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-xs text-white/50">
                  Link 2 Text
                </Label>
                <Input
                  placeholder="GitHub"
                  value={formData.link2.text}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      link2: { ...formData.link2, text: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label className="mb-2 block text-xs text-white/50">
                  Link 2 URL
                </Label>
                <Input
                  placeholder="https://github.com/..."
                  value={formData.link2.url}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      link2: { ...formData.link2, url: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <Label className="mb-2 block text-white/70">
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
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Plus size={16} />
              </Button>
            </div>

            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 rounded-lg border border-white/10 bg-zinc-800/30 p-4">
                {formData.skills.map((skill, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="border-blue-500/30 bg-blue-500/20 py-1 pl-3 pr-1 text-blue-400"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 rounded-full p-0.5 hover:bg-blue-500/30"
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
            <Label className="mb-2 block text-white/70">Featured Project</Label>
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-zinc-800/30 p-4">
              <Checkbox
                id="featured"
                checked={formData.featured || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, featured: checked as boolean })
                }
              />
              <Label
                htmlFor="featured"
                className="cursor-pointer text-white/70"
              >
                Highlight this project with a featured badge
              </Label>
            </div>
          </div>

          {/* Metrics */}
          <div>
            <Label className="mb-2 block text-white/70">
              Project Metrics (Optional)
            </Label>
            <p className="mb-3 text-xs text-white/50">
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
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
            )}

            {formData.metrics.length > 0 && (
              <div className="flex gap-3 rounded-lg border border-white/10 bg-zinc-800/30 p-4">
                {formData.metrics.map((metric, i) => (
                  <div
                    key={i}
                    className="group relative flex-1 rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-3"
                  >
                    <button
                      onClick={() =>
                        setFormData({
                          ...formData,
                          metrics: formData.metrics.filter(
                            (_, idx) => idx !== i
                          ),
                        })
                      }
                      className="absolute -right-2 -top-2 rounded-full bg-red-500/80 p-1 opacity-0 transition-opacity hover:bg-red-500 group-hover:opacity-100"
                    >
                      <X size={12} className="text-white" />
                    </button>
                    <div className="text-xs text-zinc-400">{metric.label}</div>
                    <div className="text-sm font-bold text-white">
                      {metric.value}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {formData.metrics.length >= 2 && (
              <p className="mt-2 text-xs text-yellow-500/70">
                Maximum 2 metrics reached. Remove one to add another.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block text-white/70">Year</Label>
              <Input
                placeholder="2024"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
              />
            </div>

            <div>
              <Label className="mb-2 block text-white/70">Duration</Label>
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
              <Label className="mb-2 block text-white/70">
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
            <Label className="mb-2 block text-white/70">Client Type</Label>
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
          <DialogClose asChild>
            <Button variant="outline" className="border-white/10 text-white">
              Cancel
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              onClick={handleSubmit}
              className="bg-blue-500 hover:bg-blue-600"
              disabled={!formData.title || !formData.description}
            >
              {isUpdating ? "Update Project" : "Add Project"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
