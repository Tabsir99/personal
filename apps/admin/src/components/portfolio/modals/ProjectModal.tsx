import { useCallback, useEffect, useRef, useState } from "react";
import {
  X,
  Image as ImageIcon,
  Plus,
  Code,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
import { DialogClose } from "@/components/ui/dialog";
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
      footer={
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
              <Button type="button" variant="outline" onClick={back}>
                <ChevronLeft className="h-3.5 w-3.5" />
                Back
              </Button>
            ) : (
              <DialogClose render={<Button variant="outline">Cancel</Button>} />
            )}
            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={next}
                disabled={step === 0 && (!formData.title || !formData.dek)}
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <DialogClose
                render={
                  <Button
                    onClick={handleSubmit}
                    disabled={!formData.title || !formData.dek}
                  >
                    {isUpdating ? (
                      "Update project"
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        Add project
                      </>
                    )}
                  </Button>
                }
              />
            )}
          </div>
        </div>
      }
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
        )}
        {step === 1 && (
          <ModalSection title="Stills">
        {formData.stills.map((still, i) => (
          <div
            key={i}
            className="space-y-3 rounded-md border border-foreground/6 bg-foreground/2 p-3"
          >
            <div className="grid grid-cols-[1fr_120px_auto] items-end gap-2">
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
                className="text-muted-foreground hover:bg-destructive/8 hover:text-destructive"
                aria-label="Remove still"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            {still.kind === "video" ? (
              <FormField label="Video sources">
                <VideoSourcesEditor
                  value={still.sources ?? []}
                  onChange={(sources) => handleUpdateStill(i, { sources })}
                />
              </FormField>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[220px_1fr]">
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
                        <Upload className="h-3.5 w-3.5" />
                        Replace
                      </span>
                    </>
                  ) : (
                    <span className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
                      <ImageIcon className="h-6 w-6 opacity-60" />
                      <span className="text-xs">Click to upload</span>
                    </span>
                  )}
                </button>
                <div className="flex flex-col gap-2">
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
            )}
          </div>
        ))}

        <Input
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
          variant="outline"
          onClick={handleAddStill}
          className="w-full text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
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
        )}
        {step === 4 && (
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
        )}
          </div>
        </div>
      </div>
    </PortfolioModalFrame>
  );
}
