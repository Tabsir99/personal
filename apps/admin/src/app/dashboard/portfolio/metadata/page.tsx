"use client";
import { useShallow } from "zustand/shallow";

import KeywordsSection from "@/components/portfolio/metadata/KeyWords";
import SocialLinksSection from "@/components/portfolio/metadata/SocialLinkSection";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/NumericInput";
import { Textarea } from "@/components/ui/textarea";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FormField } from "@/components/ui/FormField";
import { usePortfolioStore } from "@/stores/PortfolioStore";

export default function PortfolioMetadata() {
  const { title, description, stats } = usePortfolioStore(
    useShallow((state) => ({
      title: state.pageData.title,
      description: state.pageData.description,
      stats: state.pageData.stats,
    })),
  );

  const updatePageData = usePortfolioStore.getState().updatePageData;
  const setField = (field: string, value: string) =>
    updatePageData({ [field]: value });

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <Eyebrow tone="muted" family="mono">
          Portfolio · metadata
        </Eyebrow>
        <h1 className="text-2xl leading-tight font-semibold tracking-tight">
          Site metadata
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          SEO surface, contact, and the headline stats shown above the fold.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-col gap-1.5 pt-5 pb-3">
          <Eyebrow tone="muted" family="mono">
            Basics
          </Eyebrow>
          <h2 className="text-base leading-tight font-semibold tracking-tight">
            Title & description
          </h2>
        </CardHeader>
        <CardContent className="space-y-5 pt-1 pb-5">
          <FormField
            label="Site title"
            hint="Appears in browser tabs and search results."
          >
            <Input
              id="site-title"
              value={title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Tabsir CG · Portfolio"
            />
          </FormField>
          <FormField
            label="Site description"
            hint={`${description.length} / 160 characters · recommended for SEO`}
          >
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setField("description", e.target.value)}
              rows={4}
              placeholder="A few sentences on what this portfolio is and who it's for."
            />
          </FormField>
        </CardContent>
      </Card>

      <KeywordsSection />
      <SocialLinksSection />

      <Card>
        <CardHeader className="flex flex-col gap-1.5 pt-5 pb-3">
          <Eyebrow tone="muted" family="mono">
            Headline stats
          </Eyebrow>
          <h2 className="text-base leading-tight font-semibold tracking-tight">
            Numbers shown above the fold
          </h2>
        </CardHeader>
        <CardContent className="pt-1 pb-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Years of experience">
              <NumericInput
                id="years-exp"
                min={0}
                allowDecimal
                value={stats.yearsExperience}
                onChange={(value) =>
                  updatePageData({
                    stats: {
                      ...stats,
                      yearsExperience: Math.max(0, value),
                    },
                  })
                }
              />
            </FormField>
            <FormField label="Projects completed">
              <NumericInput
                id="projects"
                min={0}
                value={stats.projectsCompleted}
                onChange={(value) =>
                  updatePageData({
                    stats: {
                      ...stats,
                      projectsCompleted: Math.max(0, value),
                    },
                  })
                }
              />
            </FormField>
            <FormField label="Job success rate (%)">
              <NumericInput
                id="success-rate"
                min={0}
                max={100}
                value={stats.jobSuccessRate}
                onChange={(value) =>
                  updatePageData({
                    stats: {
                      ...stats,
                      jobSuccessRate: Math.max(0, value),
                    },
                  })
                }
              />
            </FormField>
            <FormField label="Response time">
              <Input
                id="response-time"
                placeholder="<2h, 24h"
                value={stats.responseTime}
                onChange={(e) =>
                  updatePageData({
                    stats: { ...stats, responseTime: e.target.value },
                  })
                }
              />
            </FormField>
            <FormField label="Happy clients">
              <NumericInput
                id="happy-clients"
                min={0}
                value={stats.happyClients}
                onChange={(value) =>
                  updatePageData({
                    stats: {
                      ...stats,
                      happyClients: Math.max(0, value),
                    },
                  })
                }
              />
            </FormField>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
