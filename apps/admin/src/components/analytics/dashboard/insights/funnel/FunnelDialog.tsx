/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { Dialog } from "premium-ds/dialog";
import { TextField } from "premium-ds/text-field";
import { Button } from "premium-ds/button";
import { Select, type SelectOption } from "premium-ds/select";
import { toast } from "premium-ds/toast";
import { createFunnel, updateFunnel } from "@/actions/funnelActions";
import { useGoalList } from "../useGoalList";
import type {
  FunnelDefinition,
  FunnelStep,
  FunnelStepMatch,
} from "@/lib/analyticsTypes";

const MAX_STEPS = 8;

const TYPE_OPTIONS = [
  {
    value: "pageview",
    label: "Pageview",
    description: "Visitor reached a URL",
  },
  { value: "goal", label: "Goal", description: "Visitor fired a custom event" },
];

const MATCH_OPTIONS = [
  { value: "equals", label: "Equals" },
  { value: "contains", label: "Contains" },
  { value: "startsWith", label: "Starts with" },
  { value: "endsWith", label: "Ends with" },
];

interface DraftStep {
  id: string;
  name: string;
  type: "pageview" | "goal";
  url: string;
  urlMatchType: FunnelStepMatch;
  goalName: string;
}

function emptyStep(): DraftStep {
  return {
    id: crypto.randomUUID(),
    name: "",
    type: "pageview",
    url: "",
    urlMatchType: "equals",
    goalName: "",
  };
}

function toDraft(step: FunnelStep): DraftStep {
  return {
    id: step.id,
    name: step.name,
    type: step.type,
    url: step.type === "pageview" ? step.url : "",
    urlMatchType: step.type === "pageview" ? step.urlMatchType : "equals",
    goalName: step.type === "goal" ? step.goalName : "",
  };
}

function toStep(draft: DraftStep): FunnelStep {
  const base = {
    id: draft.id,
    name: draft.name.trim(),
    goalCompletionType: "completed" as const,
  };
  return draft.type === "pageview"
    ? {
        ...base,
        type: "pageview",
        url: draft.url.trim(),
        urlMatchType: draft.urlMatchType,
      }
    : { ...base, type: "goal", goalName: draft.goalName.trim() };
}

function stepComplete(draft: DraftStep): boolean {
  if (!draft.name.trim()) return false;
  return draft.type === "pageview"
    ? draft.url.trim().length > 0
    : draft.goalName.trim().length > 0;
}

interface FunnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  websiteId: string;
  editing: FunnelDefinition | null;
  onSuccess: (funnelId: string) => void;
}

export function FunnelDialog({
  open,
  onOpenChange,
  websiteId,
  editing,
  onSuccess,
}: FunnelDialogProps) {
  const [name, setName] = useState("");
  const [steps, setSteps] = useState<DraftStep[]>([]);
  const [saving, setSaving] = useState(false);
  const goalList = useGoalList();

  const goalOptions = useMemo<SelectOption[]>(
    () => goalList.map(({ name, label }) => ({ value: name, label })),
    [goalList],
  );

  const optionsFor = (goalName: string): SelectOption[] =>
    !goalName || goalOptions.some((o) => o.value === goalName)
      ? goalOptions
      : [...goalOptions, { value: goalName, label: goalName }];

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setSteps(editing.steps.map(toDraft));
    } else {
      setName("");
      setSteps([emptyStep(), emptyStep()]);
    }
  }, [open, editing]);

  const patchStep = (id: string, patch: Partial<DraftStep>) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const removeStep = (id: string) =>
    setSteps((prev) => prev.filter((s) => s.id !== id));

  const addStep = () =>
    setSteps((prev) =>
      prev.length >= MAX_STEPS ? prev : [...prev, emptyStep()],
    );

  const canSubmit =
    name.trim().length > 0 && steps.length > 0 && steps.every(stepComplete);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);

    const payload = { name: name.trim(), steps: steps.map(toStep) };
    const res = editing
      ? await updateFunnel(editing.id, payload)
      : await createFunnel({ websiteId, ...payload });

    setSaving(false);

    if (res.status === "error") {
      toast.error(res.message);
      return;
    }

    toast.success(
      editing ? `"${name.trim()}" updated` : `"${name.trim()}" created`,
    );
    onOpenChange(false);
    onSuccess(res.data.id);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Edit funnel" : "New funnel"}
      description="Chain pageviews and goals into an ordered conversion flow."
      size="lg"
      footer={(close) => (
        <div className="flex w-full items-center justify-between gap-2">
          <Button
            variant="secondary"
            onClick={addStep}
            disabled={steps.length >= MAX_STEPS}
            iconLeft={<PlusIcon size={15} weight="bold" />}
          >
            Add step
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={saving}
              disabled={!canSubmit}
            >
              {editing ? "Save" : "Create funnel"}
            </Button>
          </div>
        </div>
      )}
    >
      <div className="space-y-5">
        <TextField
          id="funnel-name"
          label="Funnel name"
          placeholder="Signup flow"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Steps</span>
            <span className="font-mono text-xs text-muted-foreground/70 tabular-nums">
              {steps.length}/{MAX_STEPS}
            </span>
          </div>

          {steps.map((step, i) => (
            <div
              key={step.id}
              className="space-y-3 rounded-lg border border-foreground/8 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Step {i + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  htmlProps={{ "aria-label": `Remove step ${i + 1}` }}
                  disabled={steps.length <= 1}
                  onClick={() => removeStep(step.id)}
                  className="hover:text-destructive!"
                >
                  <TrashIcon size={14} />
                </Button>
              </div>

              <div className="flex gap-2">
                <TextField
                  label="Label"
                  placeholder="Visit pricing"
                  value={step.name}
                  onChange={(e) => patchStep(step.id, { name: e.target.value })}
                  className="flex-1"
                />
                <div className="w-40 shrink-0">
                  <span className="field-label">Type</span>
                  <Select
                    ariaLabel={`Step ${i + 1} type`}
                    triggerProps={{
                      variant: "secondary",
                      fullWidth: true,
                      className: "justify-between! px-3! text-left!",
                    }}
                    options={TYPE_OPTIONS}
                    value={step.type}
                    onChange={(v) =>
                      patchStep(step.id, { type: v as DraftStep["type"] })
                    }
                  />
                </div>
              </div>

              {step.type === "pageview" ? (
                <div className="flex gap-2">
                  <TextField
                    label="URL"
                    placeholder="/pricing"
                    value={step.url}
                    onChange={(e) =>
                      patchStep(step.id, { url: e.target.value })
                    }
                    className="flex-1"
                  />
                  <div className="w-40 shrink-0">
                    <span className="field-label">Match</span>
                    <Select
                      ariaLabel={`Step ${i + 1} URL match`}
                      triggerProps={{
                        variant: "secondary",
                        fullWidth: true,
                        className: "justify-between! px-3! text-left!",
                      }}
                      options={MATCH_OPTIONS}
                      value={step.urlMatchType}
                      onChange={(v) =>
                        patchStep(step.id, {
                          urlMatchType: v as FunnelStepMatch,
                        })
                      }
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <span className="field-label">Event name</span>
                  <Select
                    ariaLabel={`Step ${i + 1} event name`}
                    searchable
                    searchPlaceholder="Filter goals"
                    placeholder="Select a goal"
                    triggerProps={{
                      variant: "secondary",
                      fullWidth: true,
                      className: "justify-between! px-3! text-left!",
                    }}
                    options={optionsFor(step.goalName)}
                    value={step.goalName || null}
                    onChange={(v) => patchStep(step.id, { goalName: v })}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
