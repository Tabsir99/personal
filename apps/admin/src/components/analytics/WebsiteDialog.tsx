/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Dialog } from "premium-ds/dialog";
import { TextField } from "premium-ds/text-field";
import { Button } from "premium-ds/button";
import { Tag, TagGroup } from "premium-ds/tag";
import { toast } from "premium-ds/toast";
import {
  addAnalyticsWebsite,
  updateAnalyticsWebsite,
  type AnalyticsWebsite,
} from "@/actions/analyticsActions";

interface WebsiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: AnalyticsWebsite | null;
  onSuccess: () => void;
}

export function WebsiteDialog({
  open,
  onOpenChange,
  editing,
  onSuccess,
}: WebsiteDialogProps) {
  const [name, setName] = useState("");
  const [originInput, setOriginInput] = useState("");
  const [origins, setOrigins] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [originError, setOriginError] = useState<string | null>(null);

  useEffect(() => {
    if (open && editing) {
      setName(editing.name);
      setOrigins([...editing.origins]);
    } else if (open && !editing) {
      setName("");
      setOrigins([]);
    }
    setOriginInput("");
    setOriginError(null);
  }, [open, editing]);

  const commitOrigin = () => {
    const raw = originInput.trim();
    if (!raw) return;

    if (raw !== "*") {
      try {
        const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
        const normalized = url.origin;
        if (origins.includes(normalized)) {
          setOriginError("Already added");
          return;
        }
        setOrigins((prev) => [...prev, normalized]);
      } catch {
        setOriginError("Not a valid URL");
        return;
      }
    } else {
      if (origins.includes("*")) {
        setOriginError("Already added");
        return;
      }
      setOrigins((prev) => [...prev, "*"]);
    }

    setOriginInput("");
    setOriginError(null);
  };

  const removeOrigin = (origin: string) => {
    setOrigins((prev) => prev.filter((o) => o !== origin));
  };

  const canSubmit = name.trim().length > 0 && origins.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);

    const res = editing
      ? await updateAnalyticsWebsite(editing.id, { name: name.trim(), origins })
      : await addAnalyticsWebsite({ name: name.trim(), origins });

    setSaving(false);

    if (res.status === "error") {
      toast.error(res.message);
      return;
    }

    toast.success(
      editing ? `"${name.trim()}" updated` : `"${name.trim()}" added`,
    );
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Edit website" : "Add website"}
      description={
        editing
          ? "Update the display name or allowed origins."
          : "Register a domain to start collecting analytics."
      }
      size="md"
      footer={(close) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={saving} disabled={!canSubmit}>
            {editing ? "Save" : "Add website"}
          </Button>
        </div>
      )}
    >
      <div className="space-y-5">
        <TextField
          id="ws-name"
          label="Display name"
          placeholder="My Portfolio"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div>
          <div className="flex items-center gap-2">
            <TextField
              id="ws-origin"
              label="Allowed origins"
              helper="Domains that can send events. Enter to add."
              placeholder="https://tabsircg.com"
              value={originInput}
              onChange={(e) => {
                setOriginInput(e.target.value);
                setOriginError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitOrigin();
                }
              }}
              error={originError ?? undefined}
              className="flex-1"
            />
            <Button
              variant="secondary"
              size="md"
              onClick={commitOrigin}
              disabled={!originInput.trim()}
              className="-mt-1.5"
            >
              Add
            </Button>
          </div>

          <TagGroup label="Origins" className="mt-3">
            {origins.map((origin) => (
              <Tag key={origin} size="md" onRemove={() => removeOrigin(origin)}>
                {origin}
              </Tag>
            ))}
          </TagGroup>
        </div>
      </div>
    </Dialog>
  );
}
