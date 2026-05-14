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
import { X, Image as ImageIcon, Plus, Code, Briefcase } from "lucide-react";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import { Button } from "@/components/ui/button";
import Img from "@/components/ui/image";
import { PageData } from "@tabsircg/schemas/portfolio";
import { ConfigMultiSelect } from "@/components/ui/configMultiSelect";
import { useCustomSWR } from "@/hooks/useCustomSwr";
import {
  addPortfolioSkill,
  addPortfolioClientType,
  type PortfolioCatalog,
} from "@/actions/configActions";

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

  const [metricLabel, setMetricLabel] = useState("");
  const [metricValue, setMetricValue] = useState("");

  const [isAddingLink, setIsAddingLink] = useState(false);
  const emptyNewLink: ProjectLink = { text: "", url: "", type: "other" };
  const [newLink, setNewLink] = useState<ProjectLink>(emptyNewLink);

  const project = usePortfolioStore().projects;

  const {
    data: catalog,
    mutate: mutateCatalog,
    isLoading: catalogLoading,
  } = useCustomSWR<PortfolioCatalog>("/api/config/portfolio");

  const handleCommitNewLink = () => {
    if (!newLink.text.trim() && !newLink.url.trim()) return;
    setFormData({
      ...formData,
      links: [...formData.links, newLink],
    });
    setNewLink(emptyNewLink);
    setIsAddingLink(false);
  };

  const handleCancelNewLink = () => {
    setNewLink(emptyNewLink);
    setIsAddingLink(false);
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl pb-0">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isUpdating ? "Edit Project" : "Add New Project"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill in the details for your project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basics */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Basics
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Title</Label>
                <Input
                  placeholder="E-commerce Platform"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="mb-2 block">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "Personal" | "Demo" | "Freelance") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
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

            <div>
              <Label className="mb-2 block">Description</Label>
              <Textarea
                placeholder="A full-featured e-commerce platform with payment integration..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>

          {/* Media */}
          <div className="pt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">
              Media
            </h3>

            <div>
              <Label className="mb-2 block">Project Image</Label>
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
          </div>

          {/* Links */}
          <div className="pt-4 space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Links
            </h3>

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

            <div
              className={`${
                isAddingLink
                  ? "max-h-120 border-border p-4"
                  : "max-h-0 border-transparent p-0"
              } mt-2 overflow-hidden rounded-lg border-2 border-dashed transition-all duration-300`}
            >
              <div className="grid grid-cols-[140px_1fr_1fr] gap-2 mb-3">
                <div>
                  <Label className="mb-1.5 block text-xs text-muted-foreground">
                    Type
                  </Label>
                  <Select
                    value={newLink.type}
                    onValueChange={(value: LinkType) =>
                      setNewLink({ ...newLink, type: value })
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
                    placeholder={
                      LINK_TYPE_OPTIONS.find((o) => o.value === newLink.type)
                        ?.placeholder ?? "Link text"
                    }
                    value={newLink.text}
                    onChange={(e) =>
                      setNewLink({ ...newLink, text: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs text-muted-foreground">
                    URL
                  </Label>
                  <Input
                    placeholder="https://..."
                    value={newLink.url}
                    onChange={(e) =>
                      setNewLink({ ...newLink, url: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelNewLink}
                  className="h-8 text-muted-foreground"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCommitNewLink}
                  className="h-8"
                  disabled={!newLink.text.trim() && !newLink.url.trim()}
                >
                  <Plus size={14} /> Add Link
                </Button>
              </div>
            </div>

            {isAddingLink || (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddingLink(true)}
                className="w-full border-dashed border-border hover:bg-accent"
              >
                <Plus size={14} /> Add Link
              </Button>
            )}
          </div>

          {/* Tech & Outcomes */}
          <div className="pt-4 space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Tech & Outcomes
            </h3>

            <div>
              <Label className="mb-2 block">Skills</Label>
              <ConfigMultiSelect
                value={formData.skills}
                onChange={(next) => setFormData({ ...formData, skills: next })}
                available={catalog?.skillCatalog ?? []}
                loading={catalogLoading}
                onCreate={addPortfolioSkill}
                onOptimisticCreate={(values) =>
                  mutateCatalog(
                    (prev) =>
                      prev
                        ? { ...prev, skillCatalog: values }
                        : {
                            skillCatalog: values,
                            clientTypeCatalog: [],
                          },
                    false,
                  )
                }
                onAfterCreate={(values) =>
                  mutateCatalog(
                    (prev) =>
                      prev
                        ? { ...prev, skillCatalog: values }
                        : {
                            skillCatalog: values,
                            clientTypeCatalog: [],
                          },
                    false,
                  )
                }
                placeholder="Select or create skills..."
                searchPlaceholder="Search or create a skill..."
                selectedLabel={(s) =>
                  s.length
                    ? `${s.length} skill${s.length > 1 ? "s" : ""} selected`
                    : "Select or create skills..."
                }
                itemIcon={Code}
                toastMessages={{
                  loading: "Creating skill...",
                  success: "Skill added to catalog",
                  err: "Failed to create skill",
                }}
              />
            </div>

            <div>
              <Label className="mb-2 block">Metrics</Label>
              <p className="mb-3 text-xs text-muted-foreground">
                Add up to 2 metrics to showcase results (e.g., "10K users",
                "0.8s load time")
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
          </div>

          {/* Engagement */}
          <div className="pt-4 space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Engagement
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Year</Label>
                <Input
                  placeholder="2024"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="mb-2 block">Duration</Label>
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
                <Label className="mb-2 block">Role</Label>
                <Input
                  placeholder="Full Stack Developer"
                  value={formData.role || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="mb-2 block">Client Type</Label>
                <ConfigMultiSelect
                  mode="single"
                  value={formData.clientType ? [formData.clientType] : []}
                  onChange={(next) =>
                    setFormData({ ...formData, clientType: next[0] ?? "" })
                  }
                  available={catalog?.clientTypeCatalog ?? []}
                  loading={catalogLoading}
                  onCreate={addPortfolioClientType}
                  onOptimisticCreate={(values) =>
                    mutateCatalog(
                      (prev) =>
                        prev
                          ? { ...prev, clientTypeCatalog: values }
                          : {
                              skillCatalog: [],
                              clientTypeCatalog: values,
                            },
                      false,
                    )
                  }
                  onAfterCreate={(values) =>
                    mutateCatalog(
                      (prev) =>
                        prev
                          ? { ...prev, clientTypeCatalog: values }
                          : {
                              skillCatalog: [],
                              clientTypeCatalog: values,
                            },
                      false,
                    )
                  }
                  placeholder="Pick or create a client type..."
                  searchPlaceholder="Search or create..."
                  itemIcon={Briefcase}
                  toastMessages={{
                    loading: "Creating client type...",
                    success: "Client type added to catalog",
                    err: "Failed to create client type",
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <Checkbox
                id="featured"
                checked={formData.featured || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, featured: checked as boolean })
                }
              />
              <Label htmlFor="featured" className="cursor-pointer">
                Highlight this project with a featured badge
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 bg-inherit">
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
