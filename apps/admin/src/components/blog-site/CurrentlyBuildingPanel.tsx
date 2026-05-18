"use client";

import { useShallow } from "zustand/react/shallow";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSiteConfigStore } from "@/stores/SiteConfigStore";
import Panel from "./Panel";
import Field from "./Field";
import HeightTransition from "./HeightTransition";

export default function CurrentlyBuildingPanel() {
  const { draft, initial } = useSiteConfigStore(
    useShallow((s) => ({
      draft: s.draft.currentlyBuilding,
      initial: s.initial.currentlyBuilding,
    })),
  );

  const setCurrentlyBuilding = (patch: Partial<typeof draft>) =>
    useSiteConfigStore.getState().setCurrentlyBuilding(patch);
  const edited = (k: keyof typeof draft) => draft[k] !== initial[k];
  const previewVisible = !!draft.code || !!draft.body;

  return (
    <Panel
      title="Currently building"
      description="The small card under the now-reading sticker. Leave code or body empty to hide it."
    >
      <div className="grid gap-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[140px_minmax(0,1fr)]">
          <Field label="Code" edited={edited("code")}>
            <Input
              value={draft.code}
              onChange={(e) => setCurrentlyBuilding({ code: e.target.value })}
              placeholder="tinypg"
            />
          </Field>
          <Field label="Body" edited={edited("body")}>
            <Textarea
              value={draft.body}
              onChange={(e) => setCurrentlyBuilding({ body: e.target.value })}
              placeholder="One-line description shown beside the code."
              rows={2}
              className="resize-none leading-relaxed"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_1fr]">
          <Field label="Link label" edited={edited("linkLabel")}>
            <Input
              value={draft.linkLabel}
              onChange={(e) =>
                setCurrentlyBuilding({ linkLabel: e.target.value })
              }
              placeholder="→ /lab"
            />
          </Field>
          <Field label="Link href" edited={edited("linkHref")}>
            <Input
              value={draft.linkHref}
              onChange={(e) =>
                setCurrentlyBuilding({ linkHref: e.target.value })
              }
              placeholder="/lab"
            />
          </Field>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Preview
          </p>
          <div className="rounded-md border border-foreground/6 bg-background/60 p-4">
            <HeightTransition show={previewVisible}>
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
            </HeightTransition>
            <HeightTransition show={!previewVisible}>
              <p className="text-sm text-muted-foreground">
                Hidden — neither code nor body set
              </p>
            </HeightTransition>
          </div>
        </div>
      </div>
    </Panel>
  );
}
