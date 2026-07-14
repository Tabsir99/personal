import { useCallback, useEffect, useRef, useState } from "react";
import {
  X,
  Image as ImageIcon,
  Plus,
  Code,
  Upload,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";

import { TextField } from "premium-ds/text-field";
import { Textarea } from "premium-ds/textarea";
import { Select } from "premium-ds/select";
import { Button } from "premium-ds/button";
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

import { ModalSection, PortfolioModalFrame } from "./_shared";
import { VideoSourcesEditor } from "./VideoSourcesEditor";

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

const TYPE_OPTIONS = [
  { value: "Personal", label: "Personal" },
  { value: "Demo", label: "Demo" },
  { value: "Freelance", label: "Freelance" }
];

const STATUS_OPTIONS = [
  { value: "shipped", label: "Shipped" },
  { value: "in-progress", label: "In progress" },
  { value: "archived", label: "Archived" },
  { value: "discontinued", label: "Discontinued" }
];

const KIND_OPTIONS = [
  { value: "image", label: "Image" },
  { value: "video", label: "Video" }
];

const LINK_TYPE_SELECT_OPTIONS = LINK_TYPE_OPTIONS.map((opt) => ({
  value: opt.value,
  label: opt.label,
}));

const STEPS = ["Basics", "Stills", "Links", "Tech & outcomes", "Engagement"];

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
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const next = () => {
    setDir(1);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const back = () => {
    setDir(-1);
    setStep((s) => Math.max(0, s - 1));
  };

  // Animate the modal's height between steps: `height: auto` can't transition,
  // so we measure the active step's content and drive an explicit px height.
  // The synchronous measure on mount makes the first open instant; later
  // ResizeObserver fires are async, so step changes animate old→new px.
  const [stepsHeight, setStepsHeight] = useState<number>();
  const roRef = useRef<ResizeObserver | null>(null);
  const measureRef = useCallback((node: HTMLDivElement | null) => {
    roRef.current?.disconnect();
    if (!node) return;
    // Ignore 0-height reads (e.g. while the dialog is hidden during its close
    // animation) so the wrapper doesn't collapse and flash.
    const measure = () => {
      const h = node.offsetHeight;
      if (h > 0) setStepsHeight(h);
    };
    measure();
    roRef.current = new ResizeObserver(measure);
    roRef.current.observe(node);
  }, []);

  useEffect(() => {
    if (!open) return; // re-init (incl. step) every time the modal opens
    setStep(0);
    setDir(1);
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
  }, [open, existingProject, projectIndex]);

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
      footer={(close) => (
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === step ? "w-6 bg-primary" : "w-1.5 bg-foreground/15",
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {step > 0 ? (
              <Button type="button" variant="secondary" onClick={back} iconLeft={<CaretLeft size={14} />}>
                Back
              </Button>
            ) : (
              <Button variant="secondary" onClick={close}>Cancel</Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={next}
                disabled={step === 0 && (!formData.title || !formData.dek)}
                iconRight={<CaretRight size={14} />}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => {
                  handleSubmit();
                  close();
                }}
                disabled={!formData.title || !formData.dek}
                iconLeft={<Plus size={14} />}
              >
                {isUpdating ? "Update project" : "Add project"}
              </Button>
            )}
          </div>
        </div>
      )}
    >
      <div
        className="overflow-hidden transition-[height] duration-300 ease-out"
        style={stepsHeight !== undefined ? { height: stepsHeight } : undefined}
      >
        <div ref={measureRef}>
          <div
            key={step}
            className={cn(
              "animate-in fade-in-0 duration-300",
              dir === 1 ? "slide-in-from-right-4" : "slide-in-from-left-4",
            )}
          >
        {step === 0 && (
          <ModalSection title="Basics">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <TextField
                id="project-title"
                label="Title"
                placeholder="E-commerce platform"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              <FormField label="Type">
                <Select
                  options={TYPE_OPTIONS}
                  value={formData.type}
                  onChange={(value) =>
                    setFormData({ ...formData, type: value as any })
                  }
                  placeholder="Choose type"
                  ariaLabel="Type"
                />
              </FormField>
              <FormField label="Status">
                <Select
                  options={STATUS_OPTIONS}
                  value={formData.status}
                  onChange={(value) =>
                    setFormData({ ...formData, status: value as any })
                  }
                  placeholder="Choose status"
                  ariaLabel="Status"
                />
              </FormField>
              <TextField
                id="project-tag"
                label="Tag"
                helper="e.g. Operations · Tooling · Platform"
                placeholder="Operations"
                value={formData.tag}
                onChange={(e) =>
                  setFormData({ ...formData, tag: e.target.value })
                }
              />
            </div>
            <Textarea
              id="project-dek"
              label="Description"
              placeholder="A full-featured e-commerce platform with payment integration…"
              value={formData.dek}
              onChange={(e) =>
                setFormData({ ...formData, dek: e.target.value })
              }
              minRows={3}
            />
          </ModalSection>
        )}
        {step === 1 && (
          <ModalSection title="Stills">
        {formData.stills.map((still, i) => (
          <div
            key={i}
            className="space-y-3 rounded-md border border-foreground/6 bg-foreground/2 p-3"
          >
            <div className="grid grid-cols-[1fr_120px_auto] items-end gap-2">
              <TextField
                id={`still-label-${i}`}
                label="Label"
                placeholder="Dashboard hero"
                value={still.label}
                onChange={(e) =>
                  handleUpdateStill(i, { label: e.target.value })
                }
              />
              <FormField label="Kind">
                <Select
                  options={KIND_OPTIONS}
                  value={still.kind}
                  onChange={(value) =>
                    handleUpdateStill(i, { kind: value as any })
                  }
                  placeholder="Choose kind"
                  ariaLabel="Kind"
                />
              </FormField>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveStill(i)}
                className="text-muted-foreground hover:bg-destructive/8 hover:text-destructive self-end"
                aria-label="Remove still"
                iconLeft={<X size={14} />}
              />
            </div>
            {still.kind === "video" ? (
              <FormField label="Video sources">
                <VideoSourcesEditor
                  value={still.sources ?? []}
                  onChange={(sources) => handleUpdateStill(i, { sources })}
                />
              </FormField>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[220px_1fr] items-end">
                <button
                  type="button"
                  onClick={() => {
                    stillFileTargetRef.current = i;
                    stillFileRef.current?.click();
                  }}
                  className="group/thumb relative aspect-video w-full overflow-hidden rounded-md border border-dashed border-foreground/15 bg-foreground/4 transition-colors hover:border-foreground/30 hover:bg-foreground/6"
                  aria-label={
                    still.url ? `Replace still ${i + 1}` : `Upload still ${i + 1}`
                  }
                >
                  {still.url ? (
                    <>
                      <Img
                        src={still.url}
                        alt={still.alt || still.label}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute inset-0 flex items-center justify-center gap-1.5 bg-background/65 text-xs font-medium text-foreground opacity-0 backdrop-blur-[1px] transition-opacity group-hover/thumb:opacity-100">
                        <Upload size={14} />
                        Replace
                      </span>
                    </>
                  ) : (
                    <span className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
                      <ImageIcon size={24} className="opacity-60" />
                      <span className="text-xs">Click to upload</span>
                    </span>
                  )}
                </button>
                <div className="flex flex-col gap-2">
                  <TextField
                    id={`still-url-${i}`}
                    label="URL"
                    placeholder="https://… or upload"
                    value={still.url}
                    onChange={(e) =>
                      handleUpdateStill(i, { url: e.target.value })
                    }
                    className="font-mono text-xs"
                  />
                  <TextField
                    id={`still-alt-${i}`}
                    label="Alt text"
                    placeholder="Description for screen readers"
                    value={still.alt}
                    onChange={(e) =>
                      handleUpdateStill(i, { alt: e.target.value })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        <input
          type="file"
          ref={stillFileRef}
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            const idx = stillFileTargetRef.current;
            if (file && idx !== null) {
              const url = URL.createObjectURL(file);
              handleUpdateStill(idx, { url, kind: "image" });
            }
            stillFileTargetRef.current = null;
            if (stillFileRef.current) stillFileRef.current.value = "";
          }}
          className="hidden"
        />

        <Button
          type="button"
          variant="secondary"
          onClick={handleAddStill}
          className="w-full text-muted-foreground hover:text-foreground"
          iconLeft={<Plus size={14} />}
        >
          Add still
        </Button>
      </ModalSection>
        )}
        {step === 2 && (
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
                  options={LINK_TYPE_SELECT_OPTIONS}
                  value={link.type}
                  onChange={(value) =>
                    handleUpdateLink(i, { type: value as LinkType })
                  }
                  placeholder="Type"
                  ariaLabel="Link type"
                />
              </FormField>
              <TextField
                id={`link-text-${i}`}
                label="Text"
                placeholder={placeholder}
                value={link.text}
                onChange={(e) =>
                  handleUpdateLink(i, { text: e.target.value })
                }
              />
              <TextField
                id={`link-url-${i}`}
                label="URL"
                placeholder="https://…"
                value={link.url}
                onChange={(e) => handleUpdateLink(i, { url: e.target.value })}
                className="font-mono text-xs"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveLink(i)}
                className="text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/8 hover:text-destructive group-hover/link:opacity-100 focus-visible:opacity-100"
                aria-label="Remove link"
                iconLeft={<X size={14} />}
              />
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
          <div className="mb-2 grid grid-cols-[120px_1fr_1fr] gap-2 items-end">
            <FormField label="Type">
              <Select
                options={LINK_TYPE_SELECT_OPTIONS}
                value={newLink.type}
                onChange={(value) =>
                  setNewLink({ ...newLink, type: value as LinkType })
                }
                placeholder="Type"
                ariaLabel="New link type"
              />
            </FormField>
            <TextField
              id="new-link-text"
              label="Text"
              placeholder={
                LINK_TYPE_OPTIONS.find((o) => o.value === newLink.type)
                  ?.placeholder ?? "Link text"
              }
              value={newLink.text}
              onChange={(e) =>
                setNewLink({ ...newLink, text: e.target.value })
              }
            />
            <TextField
              id="new-link-url"
              label="URL"
              placeholder="https://…"
              value={newLink.url}
              onChange={(e) =>
                setNewLink({ ...newLink, url: e.target.value })
              }
              className="font-mono text-xs"
            />
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
              iconLeft={<Plus size={14} />}
            >
              Add link
            </Button>
          </div>
        </div>

        {!isAddingLink && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsAddingLink(true)}
            className="w-full text-muted-foreground hover:text-foreground"
            iconLeft={<Plus size={14} />}
          >
            Add link
          </Button>
        )}
      </ModalSection>
        )}
        {step === 3 && (
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
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
              <TextField
                id="metric-label"
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
              <TextField
                id="metric-value"
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
                onClick={handleAddMetric}
                aria-label="Add metric"
                iconLeft={<Plus size={14} />}
                variant="secondary"
              />
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
                    className="absolute right-1.5 top-1.5 rounded-sm p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/8 hover:text-destructive group-hover/metric:opacity-100 focus-visible:opacity-100 cursor-pointer"
                  >
                    <X size={12} />
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
        )}
        {step === 4 && (
          <ModalSection title="Engagement">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <TextField
                id="engagement-year"
                label="Year"
                placeholder="2024"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
              />
              <TextField
                id="engagement-role"
                label="Role"
                placeholder="Sole engineer"
                value={formData.role || ""}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              />
            </div>
          </ModalSection>
        )}
          </div>
        </div>
      </div>
    </PortfolioModalFrame>
  );
}
