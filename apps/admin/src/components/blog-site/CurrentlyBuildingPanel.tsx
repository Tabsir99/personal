"use client";

import { useShallow } from "zustand/react/shallow";
import { useSiteConfigStore } from "@/stores/SiteConfigStore";
import Panel from "./Panel";
import { Collapse } from "premium-ds/collapse";
import { TextField } from "premium-ds/text-field";
import { Textarea } from "premium-ds/textarea";

export default function CurrentlyBuildingPanel() {
  const { draft } = useSiteConfigStore(
    useShallow((s) => ({
      draft: s.draft.currentlyBuilding,
    })),
  );

  const setCurrentlyBuilding = (patch: Partial<typeof draft>) =>
    useSiteConfigStore.getState().setCurrentlyBuilding(patch);

  const previewVisible = !!draft.code || !!draft.body;

  return (
    <Panel
      title="Currently building"
      description="The small card under the now-reading sticker. Leave code or body empty to hide it."
    >
      <div className="grid gap-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[140px_minmax(0,1fr)]">
            <TextField
              label="Code"
              value={draft.code}
              onChange={(e) => setCurrentlyBuilding({ code: e.target.value })}
              placeholder="tinypg"
            />
            <Textarea
              label="Body"
              value={draft.body}
              onChange={(e) => setCurrentlyBuilding({ body: e.target.value })}
              placeholder="One-line description shown beside the code."
              minRows={2}
              maxRows={4}
            />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_1fr]">
            <TextField
              label="Link label"
              value={draft.linkLabel}
              onChange={(e) =>
                setCurrentlyBuilding({ linkLabel: e.target.value })
              }
              placeholder="→ /lab"
            />
            <TextField
              label="Link href"
              value={draft.linkHref}
              onChange={(e) =>
                setCurrentlyBuilding({ linkHref: e.target.value })
              }
              placeholder="/lab"
            />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Preview
          </p>
          <div className="rounded-md border border-foreground/6 bg-background/60 p-4">
            <Collapse open={previewVisible} fade>
              <div className="mt-3 text-sm leading-relaxed text-foreground/85">
                {draft.code && (
                  <span className="rounded-sm bg-foreground/4 px-1.5 py-0.5 font-mono text-xs text-foreground/80">
                    {draft.code}
                  </span>
                )}
                {draft.code && draft.body && " "}
                {draft.body}
              </div>
              {draft.linkHref && (
                <div className="mt-3 inline-block border-b border-foreground/30 pb-px font-mono text-xs text-foreground/80">
                  {draft.linkLabel || draft.linkHref}
                </div>
              )}
            </Collapse>
            <Collapse open={!previewVisible} fade>
              <p className="text-sm text-muted-foreground">
                Hidden — neither code nor body set
              </p>
            </Collapse>
          </div>
        </div>
      </div>
    </Panel>
  );
}
