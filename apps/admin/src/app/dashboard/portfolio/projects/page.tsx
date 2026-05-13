"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  FileText,
  Play,
  Link as LinkIcon,
  type LucideIcon,
} from "lucide-react";
import Github from "@devicon/react/github/original";
import { Badge } from "@/components/ui/badge";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import { useShallow } from "zustand/shallow";
import ProjectDialog from "@/components/portfolio/modals/ProjectModal";
import Img from "@/components/ui/image";
import { AddCard } from "@/components/ui/add-card";
import { ActionButtonGroup } from "@/components/ui/actionButtonGroup";
import { useState } from "react";
import { PageData } from "@tabsircg/schemas/portfolio";

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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Projects</h2>
          <p className="text-muted-foreground">Manage your portfolio projects</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {projects.map((projectItem, index) => (
          <Card
            key={index}
            className="group relative overflow-hidden border-border/50 bg-card/60 pt-0 backdrop-blur-sm transition-all duration-500 hover:border-border"
          >
            <div className="relative aspect-video overflow-hidden bg-muted/30">
              <Img
                src={projectItem.image}
                alt={projectItem.title}
                className="h-full transition-transform duration-700 group-hover:scale-105"
                fetchPriority="low"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-linear-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <Badge
                variant="secondary"
                className="absolute left-4 top-4 border-border/60 bg-background/70 text-foreground backdrop-blur-md"
              >
                {projectItem.type}
              </Badge>
            </div>

            <CardContent className="p-6">
              <h3 className="mb-2 text-2xl font-semibold text-foreground transition-colors group-hover:text-foreground">
                {projectItem.title}
              </h3>

              <p className="mb-4 line-clamp-2 text-[15px] leading-relaxed text-muted-foreground">
                {projectItem.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {projectItem.skills.slice(0, 4).map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="border-border/60 bg-muted/60 text-xs font-normal text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {skill}
                  </Badge>
                ))}
                {projectItem.skills.length > 4 && (
                  <Badge
                    variant="outline"
                    className="border-border/60 bg-muted/60 text-xs font-normal text-muted-foreground"
                  >
                    +{projectItem.skills.length - 4}
                  </Badge>
                )}
              </div>

              {projectItem.links.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {projectItem.links.map((link, i) => {
                    const Icon = LINK_ICONS[link.type] ?? LinkIcon;
                    const isPrimary = i === 0;
                    return (
                      <Button
                        key={i}
                        render={
                          <a
                            href={link.url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Icon className="w-4 h-4" />
                            {link.text || link.type}
                          </a>
                        }
                        variant={isPrimary ? "default" : "outline"}
                        className={
                          isPrimary
                            ? "min-w-32 flex-1 rounded-xl border border-border/60 bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            : "min-w-32 flex-1 rounded-xl border-border/60 bg-transparent text-foreground/80 hover:bg-accent"
                        }
                      />
                    );
                  })}
                </div>
              )}
            </CardContent>

            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-border to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

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
                  active: projectItem.isActive,
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
        ))}

        <AddCard
          title="Add Project"
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
