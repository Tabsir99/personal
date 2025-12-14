// PortfolioMetadata.tsx (main component - now just layout)
"use client";
import KeywordsSection from "@/components/portfolio/metadata/KeyWords";
import SocialLinksSection from "@/components/portfolio/metadata/SocialLinkSection";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input, NumericInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import { useShallow } from "zustand/shallow";

export default function PortfolioMetadata() {
  const { title, description, stats } = usePortfolioStore(
    useShallow((state) => ({
      title: state.pageData.title,
      description: state.pageData.description,
      stats: state.pageData.stats,
    }))
  );

  const updatePageData = usePortfolioStore.getState().updatePageData;

  const handleUpdateField = (field: string, value: string) => {
    updatePageData({ [field]: value });
  };

  return (
    <div>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Site Metadata</h2>
          <p className="text-white/50">
            Manage your portfolio's SEO and social media presence
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="bg-zinc-900 text-zinc-100 border-zinc-800">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl">Basic Information</CardTitle>
            <CardDescription>
              Core details about your portfolio site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Site Title */}
            <div className="space-y-2">
              <Label htmlFor="site-title" className="text-sm font-medium">
                Site Title
              </Label>
              <Input
                id="site-title"
                value={title}
                onChange={(e) => handleUpdateField("title", e.target.value)}
                placeholder="Enter your site title"
              />
              <p className="text-xs">
                This appears in browser tabs and search results
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Site Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) =>
                  handleUpdateField("description", e.target.value)
                }
                rows={4}
                placeholder="Describe your portfolio in a few sentences"
              />
              <p className="text-xs">
                {description.length} / 160 characters (recommended for SEO)
              </p>
            </div>
          </CardContent>
        </Card>

        <KeywordsSection />
        <SocialLinksSection />

        <Card className="bg-zinc-900 text-zinc-100 border-zinc-800">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl">Portfolio Statistics</CardTitle>
            <CardDescription>
              Key metrics displayed on your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="years-exp" className="text-sm font-medium">
                  Years of Experience
                </Label>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="projects" className="text-sm font-medium">
                  Projects Completed
                </Label>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="success-rate" className="text-sm font-medium">
                  Job Success Rate (%)
                </Label>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="response-time" className="text-sm font-medium">
                  Response Time
                </Label>
                <Input
                  id="response-time"
                  placeholder="e.g., <2h, 24h"
                  value={stats.responseTime}
                  onChange={(e) =>
                    updatePageData({
                      stats: { ...stats, responseTime: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="happy-clients" className="text-sm font-medium">
                  Happy Clients
                </Label>
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
