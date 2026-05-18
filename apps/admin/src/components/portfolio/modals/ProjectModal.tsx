import { useEffect, useRef, useState } from "react";
import { X, Image as ImageIcon, Plus, Code } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Img from "@/components/ui/image";
import { ConfigMultiSelect } from "@/components/ui/configMultiSelect";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FormField } from "@/components/ui/FormField";

import { usePortfolioStore } from "@/stores/PortfolioStore";
import { useCustomSWR } from "@/hooks/useCustomSwr";
import {
  addPortfolioSkill,
  type PortfolioCatalog,
} from "@/actions/configActions";
import { PageData } from "@tabsircg/schemas/portfolio";
import { cn } from "@/lib/utils";

import {
  ModalSection,
  PortfolioModalActions,
  PortfolioModalFrame,
} from "./_shared";

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
  { value: "live", label: "Live", placeholder: "Live demo" },
  { value: "repo", label: "Repo", placeholder: "GitHub" },
  { value: "case-study", label: "Case Study", placeholder: "Case study" },
  { value: "video", label: "Video", placeholder: "Watch video" },
  { value: "other", label: "Other", placeholder: "Visit" },
];

const defaultFormData: PageData["projects"][number] = {
  image: "",
  title: "",
  dek: "",
  type: "Personal",
  status: "shipped",
  video: "",
  gallery: [],
  links: [],
  skills: [],
  visible: true,
  featured: false,
  order: 0,
  metrics: [],
  year: "",
  role: "",
};

const emptyNewLink: ProjectLink = { text: "", url: "", type: "other" };

export default function ProjectDialog({
  children,
  project: existingProject,
  open,
  onOpenChange,
  projectIndex,
}: ProjectDialogProps) {
  const [formData, setFormData] = useState(existingProject || defaultFormData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [metricLabel, setMetricLabel] = useState("");
  const [metricValue, setMetricValue] = useState("");
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newLink, setNewLink] = useState<ProjectLink>(emptyNewLink);

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

  const project = usePortfolioStore().projects;
  const {
    data: catalog,
    mutate: mutateCatalog,
    isLoading: catalogLoading,
  } = useCustomSWR<PortfolioCatalog>("/api/config/portfolio");

  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleCommitNewLink = () => {
    if (!newLink.text.trim() && !newLink.url.trim()) return;
    setFormData({ ...formData, links: [...formData.links, newLink] });
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
    if (!metricLabel.trim() || !metricValue.trim()) return;
    if (formData.metrics.length >= 2) return;
    setFormData({
      ...formData,
      metrics: [
        ...formData.metrics,
        { label: metricLabel.trim(), value: metricValue.trim() },
      ],
    });
    setMetricLabel("");
    setMetricValue("");
  };

  const handleSubmit = () => {
    if (isUpdating) project.update(projectIndex!, formData);
    else project.add(formData);
  };

  return (
    <PortfolioModalFrame
      open={open}
      onOpenChange={onOpenChange}
      {...(children ? { trigger: children } : {})}
      size="lg"
      title={isUpdating ? formData.title || "Edit project" : "Add project"}
      description="Image, links, skills, metrics — everything that appears on the project card."
      footer={
        <PortfolioModalActions
          onSubmit={handleSubmit}
          submitDisabled={!formData.title || !formData.dek}
          submitLabel="Add project"
          updateLabel="Update project"
          isUpdating={isUpdating}
          submitIcon={<Plus className="h-3.5 w-3.5" />}
        />
      }
    >
      <ModalSection title="Basics">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <FormField label="Title">
                <Input
                  placeholder="E-commerce platform"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Type">
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
              </FormField>
            </div>
            <FormField label="Description">
              <Textarea
                placeholder="A full-featured e-commerce platform with payment integration…"
                value={formData.dek}
                onChange={(e) =>
                  setFormData({ ...formData, dek: e.target.value })
                }
              />
            </FormField>
          </ModalSection>

          <ModalSection title="Media">
            <FormField label="Project image">
              <div
                onClick={() => imageInputRef.current?.click()}
                className="flex min-h-40 w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border border-foreground/6 bg-foreground/2 transition-colors hover:bg-foreground/4"
              >
                {formData.image ? (
                  <Img
                    src={formData.image}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <ImageIcon className="h-5 w-5 text-muted-foreground/60" />
                    <Eyebrow tone="muted" family="mono">
                      Click to upload
                    </Eyebrow>
                  </div>
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
            </FormField>
          </ModalSection>

          <ModalSection title="Links">
            {formData.links.map((link, i) => {
              const placeholder =
                LINK_TYPE_OPTIONS.find((o) => o.value === link.type)
                  ?.placeholder ?? "Link text";
              return (
                <div
                  key={i}
                  className="group/link grid grid-cols-[120px_1fr_1fr_auto] items-end gap-2"
                >
                  <FormField label="Type">
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
                  </FormField>
                  <FormField label="Text">
                    <Input
                      placeholder={placeholder}
                      value={link.text}
                      onChange={(e) =>
                        handleUpdateLink(i, { text: e.target.value })
                      }
                    />
                  </FormField>
                  <FormField label="URL">
                    <Input
                      placeholder="https://…"
                      value={link.url}
                      onChange={(e) =>
                        handleUpdateLink(i, { url: e.target.value })
                      }
                      className="font-mono text-xs"
                    />
                  </FormField>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemoveLink(i)}
                    className="text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/8 hover:text-destructive group-hover/link:opacity-100 focus-visible:opacity-100"
                    aria-label="Remove link"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}

            <div
              className={cn(
                "overflow-hidden rounded-md border bg-foreground/2 transition-all duration-300",
                isAddingLink
                  ? "max-h-72 border-foreground/6 p-3"
                  : "max-h-0 border-transparent p-0",
              )}
            >
              <div className="mb-2 grid grid-cols-[120px_1fr_1fr] gap-2">
                <FormField label="Type">
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
                </FormField>
                <FormField label="Text">
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
                </FormField>
                <FormField label="URL">
                  <Input
                    placeholder="https://…"
                    value={newLink.url}
                    onChange={(e) =>
                      setNewLink({ ...newLink, url: e.target.value })
                    }
                    className="font-mono text-xs"
                  />
                </FormField>
              </div>
              <div className="flex justify-end gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelNewLink}
                  className="text-muted-foreground"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCommitNewLink}
                  disabled={!newLink.text.trim() && !newLink.url.trim()}
                >
                  <Plus className="h-3 w-3" />
                  Add link
                </Button>
              </div>
            </div>

            {!isAddingLink && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddingLink(true)}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
                Add link
              </Button>
            )}
          </ModalSection>

          <ModalSection title="Tech & outcomes">
            <FormField label="Skills">
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
                        : { skillCatalog: values, clientTypeCatalog: [] },
                    false,
                  )
                }
                onAfterCreate={(values) =>
                  mutateCatalog(
                    (prev) =>
                      prev
                        ? { ...prev, skillCatalog: values }
                        : { skillCatalog: values, clientTypeCatalog: [] },
                    false,
                  )
                }
                placeholder="Select or create skills…"
                searchPlaceholder="Search or create a skill…"
                selectedLabel={(s) =>
                  s.length
                    ? `${s.length} skill${s.length > 1 ? "s" : ""} selected`
                    : "Select or create skills…"
                }
                itemIcon={Code}
                toastMessages={{
                  loading: "Creating skill…",
                  success: "Skill added to catalog",
                  err: "Failed to create skill",
                }}
              />
            </FormField>

            <FormField
              label="Metrics"
              hint="Up to two results worth showcasing (10K users, 0.8s load time)."
            >
              {formData.metrics.length < 2 && (
                <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <Input
                    placeholder="Label"
                    value={metricLabel}
                    onChange={(e) => setMetricLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddMetric();
                      }
                    }}
                  />
                  <Input
                    placeholder="Value"
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
                    size="default"
                    onClick={handleAddMetric}
                    aria-label="Add metric"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              {formData.metrics.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {formData.metrics.map((metric, i) => (
                    <div
                      key={i}
                      className="group/metric relative flex flex-col gap-1 rounded-md border border-foreground/6 bg-foreground/2 px-3 py-2.5"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            metrics: formData.metrics.filter(
                              (_, idx) => idx !== i,
                            ),
                          })
                        }
                        aria-label={`Remove ${metric.label}`}
                        className="absolute right-1.5 top-1.5 rounded-sm p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/8 hover:text-destructive group-hover/metric:opacity-100 focus-visible:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <Eyebrow tone="muted">{metric.label}</Eyebrow>
                      <span className="font-mono text-base font-semibold tabular-nums text-foreground">
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {formData.metrics.length >= 2 && (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Two metrics max — remove one to add another.
                </p>
              )}
            </FormField>
          </ModalSection>

          <ModalSection title="Engagement">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <FormField label="Year">
                <Input
                  placeholder="2024"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Role">
                <Input
                  placeholder="Full stack developer"
                  value={formData.role || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                />
              </FormField>
            </div>

            <label className="flex items-center gap-3 rounded-md border border-foreground/6 bg-foreground/2 px-4 py-3">
              <Checkbox
                id="featured"
                checked={formData.featured || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, featured: checked as boolean })
                }
              />
              <span className="flex flex-col gap-0.5">
                <Eyebrow tone="foreground" family="mono">
                  Featured
                </Eyebrow>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  Pin this project at the top of the grid.
                </span>
              </span>
            </label>
          </ModalSection>
    </PortfolioModalFrame>
  );
}
