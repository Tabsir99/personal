"use client";

import { useShallow } from "zustand/react/shallow";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSiteConfigStore } from "@/stores/SiteConfigStore";
import Panel from "./Panel";
import Field from "./Field";

export default function BlogLandingPanel() {
  const [draft, initial] = useSiteConfigStore(
    useShallow((s) => [s.draft.blogLanding, s.initial.blogLanding]),
  );
  const setBlogLanding = useSiteConfigStore((s) => s.setBlogLanding);

  const edited = (k: keyof typeof draft) => draft[k] !== initial[k];

  return (
    <Panel
      eyebrow="01 · landing"
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
            <Input
              value={draft.heroHeading}
              onChange={(e) => setBlogLanding({ heroHeading: e.target.value })}
              placeholder="Writing"
              className="font-sans text-base"
            />
          </Field>
          <Field
            label="Meta title"
            hint={`${draft.metaTitle.length}`}
            edited={edited("metaTitle")}
          >
            <Input
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
            rows={2}
            className="resize-none leading-relaxed"
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
            rows={3}
            className="resize-none leading-relaxed"
          />
        </Field>
      </div>
    </Panel>
  );
}
