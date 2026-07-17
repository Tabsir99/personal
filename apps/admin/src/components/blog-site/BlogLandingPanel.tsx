"use client";

import { useShallow } from "zustand/react/shallow";
import { useSiteConfigStore } from "@/stores/SiteConfigStore";
import Panel from "./Panel";

import { TextField } from "premium-ds/text-field";
import { Textarea } from "premium-ds/textarea";

export default function BlogLandingPanel() {
  const { draft } = useSiteConfigStore(
    useShallow((s) => ({
      draft: s.draft.blogLanding,
    })),
  );

  const setBlogLanding = (patch: Partial<typeof draft>) =>
    useSiteConfigStore.getState().setBlogLanding(patch);

  return (
    <Panel
      title="Hero & metadata"
      description="The headline, tagline, and SEO fields that wrap /blog."
    >
      <div className="grid gap-6">
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
          <TextField
            label="Hero heading"
            helper={`${draft.heroHeading.length}/60`}
            value={draft.heroHeading}
            onChange={(e) => setBlogLanding({ heroHeading: e.target.value })}
            placeholder="Writing"
            maxLength={60}
          />
          <TextField
            label="Meta title"
            helper={`${draft.metaTitle.length}/60`}
            value={draft.metaTitle}
            onChange={(e) => setBlogLanding({ metaTitle: e.target.value })}
            placeholder="Writing — yourdomain.com"
            maxLength={60}
          />
        </div>

        <Textarea
          label="Hero tagline"
          value={draft.heroTagline}
          onChange={(e) => setBlogLanding({ heroTagline: e.target.value })}
          placeholder="What you cover, in one breath."
          minRows={2}
          maxRows={4}
          max={160}
        />

        <Textarea
          label="Meta description"
          value={draft.metaDescription}
          onChange={(e) => setBlogLanding({ metaDescription: e.target.value })}
          placeholder="Used for browser tab, search results, and social cards."
          minRows={3}
          maxRows={6}
          max={160}
        />
      </div>
    </Panel>
  );
}
