"use client";
import { useState } from "react";
import { useShallow } from "zustand/shallow";
import {
  ExternalLink,
  FileText,
  Link as LinkIcon,
  Play,
  type LucideIcon,
} from "lucide-react";
import Github from "@devicon/react/github/original";

import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Img from "@/components/ui/image";
import { AddCard } from "@/components/ui/add-card";
import { ActionButtonGroup } from "@/components/ui/actionButtonGroup";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import ProjectDialog from "@/components/portfolio/modals/ProjectModal";
import { PageData, videoSourceType } from "@tabsircg/schemas/portfolio";
import { cn } from "@/lib/utils";

type LinkType = PageData["projects"][number]["links"][number]["type"];

const LINK_ICONS: Record<LinkType, LucideIcon | typeof Github> = {
  live: ExternalLink,
  repo: Github,
  "case-study": FileText,
  video: Play,
  other: LinkIcon,
};

export default function Projects() {
  const projects = usePortfolioStore(
    useShallow((state) => state.pageData.projects),
  );
  const project = usePortfolioStore().projects;
  const [editingIndex, setEditingIndex] = useState<number | "new" | null>(null);

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl leading-tight font-semibold tracking-tight">
          Projects
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The case studies, demos, and freelance work surfaced on the portfolio.
        </p>
      </header>

      <div className="stagger-cascade-tight grid grid-cols-1 gap-4 lg:grid-cols-2">
        {projects.map((p, index) => {
          // Prefer an image still; fall back to a video still so video-only
          // projects still show a thumbnail instead of "No still uploaded".
          const cover =
            p.stills.find((s) => s.kind === "image" && s.url) ??
            p.stills.find((s) => s.kind === "video" && s.sources?.length);
          return (
            <div
              key={p.title + index}
              style={{ ["--stagger-index" as string]: index }}
            >
              <Card className="group/card relative flex h-full flex-col overflow-hidden tactile-lift pt-0">
                <div className="relative aspect-video overflow-hidden bg-foreground/4">
                  {cover ? (
                    cover.kind === "video" ? (
                      <video
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                      >
                        {(cover.sources ?? []).map((s, i) => (
                          <source
                            key={i}
                            src={s.url}
                            type={videoSourceType(s) || undefined}
                          />
                        ))}
                      </video>
                    ) : (
                      <Img
                        src={cover.url}
                        alt={cover.alt || p.title}
                        className="h-full w-full object-cover"
                        fetchPriority="low"
                        loading="lazy"
                      />
                    )
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      No still uploaded
                    </div>
                  )}
                  <Badge
                    variant="neutral"
                    className="absolute top-3 left-3 border-foreground/8 bg-card/85 backdrop-blur-md"
                  >
                    {p.type}
                  </Badge>
                  {p.tag && (
                    <Badge
                      variant="accent"
                      className="absolute top-3 right-3 border-primary/30 bg-primary/12 backdrop-blur-md"
                    >
                      {p.tag}
                    </Badge>
                  )}
                </div>

                <CardContent className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex flex-col gap-1">
                    <h3 className="truncate text-base leading-snug font-semibold tracking-tight text-foreground">
                      {p.title}
                    </h3>
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {p.dek}
                    </p>
                  </div>

                  {p.skills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      {p.skills.slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="neutral">
                          {skill}
                        </Badge>
                      ))}
                      {p.skills.length > 4 && (
                        <Badge variant="ghost">+{p.skills.length - 4}</Badge>
                      )}
                    </div>
                  )}

                  {p.links.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                      {p.links.map((link, i) => {
                        const Icon = LINK_ICONS[link.type] ?? LinkIcon;
                        const isPrimary = i === 0;
                        return (
                          <a
                            key={i}
                            href={link.url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              buttonVariants({
                                variant: isPrimary ? "default" : "outline",
                                size: "sm",
                              }),
                              "min-w-24 gap-1.5",
                            )}
                          >
                            <Icon className="h-3 w-3" />
                            <span className="truncate">
                              {link.text || link.type}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </CardContent>

                <ActionButtonGroup
                  buttons={[
                    {
                      variant: "moveUp",
                      onClick: () => project.moveUp(index),
                      disabled: index === 0,
                    },
                    {
                      variant: "moveDown",
                      onClick: () => project.moveDown(index),
                      disabled: index === projects.length - 1,
                    },
                    {
                      variant: "toggle",
                      onClick: () => project.toggle(index, "isActive"),
                      active: p.isActive,
                    },
                    {
                      variant: "edit",
                      onClick: () => setEditingIndex(index),
                    },
                    {
                      variant: "delete",
                      onClick: () => project.delete(index),
                    },
                  ]}
                  entityName="Project"
                />
              </Card>
            </div>
          );
        })}

        <AddCard
          title="Add project"
          description="Add a new project to your portfolio"
          onClick={() => setEditingIndex("new")}
        />

        <ProjectDialog
          open={editingIndex !== null}
          onOpenChange={(open) => !open && setEditingIndex(null)}
          projectIndex={typeof editingIndex === "number" ? editingIndex : null}
          project={
            typeof editingIndex === "number"
              ? projects[editingIndex]
              : undefined
          }
        />
      </div>
    </div>
  );
}
