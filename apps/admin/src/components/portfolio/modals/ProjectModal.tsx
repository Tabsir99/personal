import { useEffect, useRef, useState } from "react";
import { X, Image as ImageIcon, Plus, Code, Film } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

type Project = PageData["projects"][number];
type ProjectLink = Project["links"][number];
type LinkType = ProjectLink["type"];
type ProjectStill = Project["stills"][number];

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

const defaultFormData: Project = {
  title: "",
  dek: "",
  type: "Personal",
  status: "shipped",
  role: "",
  year: "",
  tag: "",
  metrics: [],
  skills: [],
  links: [],
  stills: [],
  order: 0,
  isActive: true,
};

const emptyNewLink: ProjectLink = { text: "", url: "", type: "other" };
const emptyNewStill: ProjectStill = {
  url: "",
  alt: "",
  label: "",
  kind: "image",
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
  const [metricLabel, setMetricLabel] = useState("");
  const [metricValue, setMetricValue] = useState("");
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newLink, setNewLink] = useState<ProjectLink>(emptyNewLink);
  const stillFileRef = useRef<HTMLInputElement>(null);
  const stillFileTargetRef = useRef<number | null>(null);

  useEffect(() => {
    if (existingProject && typeof projectIndex === "number") {
      setFormData({
        ...existingProject,
        metrics: existingProject.metrics || [],
        stills: existingProject.stills || [],
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

  const handleAddStill = () => {
    setFormData({
      ...formData,
      stills: [...formData.stills, { ...emptyNewStill }],
    });
  };

  const handleUpdateStill = (i: number, patch: Partial<ProjectStill>) => {
    setFormData({
      ...formData,
      stills: formData.stills.map((s, idx) =>
        idx === i ? { ...s, ...patch } : s,
      ),
    });
  };

  const handleRemoveStill = (i: number) => {
    setFormData({
      ...formData,
      stills: formData.stills.filter((_, idx) => idx !== i),
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
      description="Links, skills, stills, metrics — everything that appears on the project card."
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
          <FormField label="Status">
            <Select
              value={formData.status}
              onValueChange={(
                value: "shipped" | "in-progress" | "archived" | "discontinued",
              ) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="in-progress">In progress</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Tag" hint="e.g. Operations · Tooling · Platform">
            <Input
              placeholder="Operations"
              value={formData.tag}
              onChange={(e) =>
                setFormData({ ...formData, tag: e.target.value })
              }
            />
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

      <ModalSection title="Stills">
        {formData.stills.map((still, i) => (
          <div
            key={i}
            className="group/still grid grid-cols-[80px_1fr] items-start gap-3 rounded-md border border-foreground/6 bg-foreground/2 p-3"
          >
            <button
              type="button"
              onClick={() => {
                stillFileTargetRef.current = i;
                stillFileRef.current?.click();
              }}
              className="aspect-video w-20 overflow-hidden rounded border border-foreground/8 bg-foreground/4 hover:bg-foreground/6 flex items-center justify-center"
              aria-label={`Upload still ${i + 1}`}
            >
              {still.url ? (
                still.kind === "video" ? (
                  <Film className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Img
                    src={still.url}
                    alt={still.alt || still.label}
                    className="h-full w-full object-cover"
                  />
                )
              ) : (
                <ImageIcon className="h-5 w-5 text-muted-foreground/60" />
              )}
            </button>
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-[1fr_120px_auto] gap-2">
                <FormField label="Label">
                  <Input
                    placeholder="Dashboard hero"
                    value={still.label}
                    onChange={(e) =>
                      handleUpdateStill(i, { label: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Kind">
                  <Select
                    value={still.kind}
                    onValueChange={(value: "image" | "video") =>
                      handleUpdateStill(i, { kind: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemoveStill(i)}
                  className="self-end text-muted-foreground hover:bg-destructive/8 hover:text-destructive"
                  aria-label="Remove still"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="grid grid-cols-[1fr_1fr] gap-2">
                <FormField label="URL">
                  <Input
                    placeholder="https://… or upload"
                    value={still.url}
                    onChange={(e) =>
                      handleUpdateStill(i, { url: e.target.value })
                    }
                    className="font-mono text-xs"
                  />
                </FormField>
                <FormField label="Alt text">
                  <Input
                    placeholder="Description for screen readers"
                    value={still.alt}
                    onChange={(e) =>
                      handleUpdateStill(i, { alt: e.target.value })
                    }
                  />
                </FormField>
              </div>
            </div>
          </div>
        ))}

        <Input
          type="file"
          ref={stillFileRef}
          accept="image/*,video/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            const idx = stillFileTargetRef.current;
            if (file && idx !== null) {
              const url = URL.createObjectURL(file);
              const kind: "image" | "video" = file.type.startsWith("video/")
                ? "video"
                : "image";
              handleUpdateStill(idx, { url, kind });
            }
            stillFileTargetRef.current = null;
            if (stillFileRef.current) stillFileRef.current.value = "";
          }}
          className="hidden"
        />

        <Button
          type="button"
          variant="outline"
          onClick={handleAddStill}
          className="w-full text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Add still
        </Button>
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
                  onChange={(e) => handleUpdateLink(i, { url: e.target.value })}
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
                  prev ? { ...prev, skillCatalog: values } : { skillCatalog: values },
                false,
              )
            }
            onAfterCreate={(values) =>
              mutateCatalog(
                (prev) =>
                  prev ? { ...prev, skillCatalog: values } : { skillCatalog: values },
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
              placeholder="Sole engineer"
              value={formData.role || ""}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            />
          </FormField>
        </div>
      </ModalSection>
    </PortfolioModalFrame>
  );
}
