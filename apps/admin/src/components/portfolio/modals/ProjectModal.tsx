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
      setFormData(existingProject);
      setIsUpdating(true);
    } else {
      setFormData(defaultFormData);
      setIsUpdating(false);
    }
  }, [existingProject, projectIndex]);

  const [currentSkill, setCurrentSkill] = useState("");

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
      <DialogContent className="bg-zinc-900 border-white/10 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add New Project</DialogTitle>
          <DialogDescription className="text-white/50">
            Fill in the details for your new project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 text-white">
          {/* Image Upload */}
          <div>
            <Label className="text-white/70 mb-2 block">Project Image</Label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => imageInputRef.current?.click()}
                className="w-full min-h-40 cursor-pointer bg-zinc-800/50 border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center overflow-hidden"
              >
                {formData.image ? (
                  <Img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
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
              <Label className="text-white/70 mb-2 block">Project Title</Label>
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
              <Label className="text-white/70 mb-2 block">Project Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "Personal" | "Demo" | "Freelance") =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Demo">Demo</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-white/70 mb-2 block">Description</Label>
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
            <Label className="text-white/70 block">Links</Label>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/50 text-xs mb-2 block">
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
                <Label className="text-white/50 text-xs mb-2 block">
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
                <Label className="text-white/50 text-xs mb-2 block">
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
                <Label className="text-white/50 text-xs mb-2 block">
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
            <Label className="text-white/70 mb-2 block">
              Technologies & Skills
            </Label>
            <div className="flex gap-2 mb-3">
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
              <div className="flex gap-2 flex-wrap p-4 bg-zinc-800/30 border border-white/10 rounded-lg">
                {formData.skills.map((skill, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="bg-blue-500/20 border-blue-500/30 text-blue-400 pl-3 pr-1 py-1"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 hover:bg-blue-500/30 rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
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
