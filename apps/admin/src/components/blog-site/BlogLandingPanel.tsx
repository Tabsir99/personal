"use client";

import { useShallow } from "zustand/react/shallow";
import { useSiteConfigStore } from "@/stores/SiteConfigStore";
import Panel from "./Panel";
import Field from "./Field";
import { TextField } from "premium-ds/text-field";
import { Textarea } from "premium-ds/textarea";

export default function BlogLandingPanel() {
  const { draft, initial } = useSiteConfigStore(
    useShallow((s) => ({
      draft: s.draft.blogLanding,
      initial: s.initial.blogLanding,
    })),
  );

  const setBlogLanding = (patch: Partial<typeof draft>) =>
    useSiteConfigStore.getState().setBlogLanding(patch);
  const edited = (k: keyof typeof draft) => draft[k] !== initial[k];

  return (
    <Panel
      title="Hero & metadata"
      description="The headline, tagline, and SEO fields that wrap /blog."
    >
      <div className="grid gap-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field
            label="Hero heading"
            hint={`${draft.heroHeading.length}`}
            edited={edited("heroHeading")}
          >
            <TextField
              value={draft.heroHeading}
              onChange={(e) => setBlogLanding({ heroHeading: e.target.value })}
              placeholder="Writing"
              className="font-sans"
            />
          </Field>
          <Field
            label="Meta title"
            hint={`${draft.metaTitle.length}`}
            edited={edited("metaTitle")}
          >
            <TextField
              value={draft.metaTitle}
              onChange={(e) => setBlogLanding({ metaTitle: e.target.value })}
              placeholder="Writing — yourdomain.com"
            />
          </Field>
        </div>

        <Field
          label="Hero tagline"
          hint={`${draft.heroTagline.length}`}
          edited={edited("heroTagline")}
        >
          <Textarea
            value={draft.heroTagline}
            onChange={(e) => setBlogLanding({ heroTagline: e.target.value })}
            placeholder="What you cover, in one breath."
            minRows={2}
            maxRows={4}
          />
        </Field>

        <Field
          label="Meta description"
          hint={`${draft.metaDescription.length}`}
          edited={edited("metaDescription")}
        >
          <Textarea
            value={draft.metaDescription}
            onChange={(e) =>
              setBlogLanding({ metaDescription: e.target.value })
            }
            placeholder="Used for browser tab, search results, and social cards."
            minRows={3}
            maxRows={6}
          />
        </Field>
      </div>
    </Panel>
  );
}
