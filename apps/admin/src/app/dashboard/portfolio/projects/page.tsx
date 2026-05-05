"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Github from "@devicon/react/github/original";
import { Badge } from "@/components/ui/badge";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import { useShallow } from "zustand/shallow";
import ProjectDialog from "@/components/portfolio/modals/ProjectModal";
import Img from "@/components/ui/image";
import { AddCard } from "@/components/ui/add-card";
import { ActionButtonGroup } from "@/components/ui/actionButtonGroup";
import { useState } from "react";

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
          <p className="text-white/50">Manage your portfolio projects</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {projects.map((projectItem, index) => (
          <Card
            key={index}
            className="group pt-0 relative overflow-hidden border-white/8 bg-white/2 backdrop-blur-sm hover:border-white/15 transition-all duration-500"
          >
            <div className="relative aspect-video overflow-hidden bg-white/2">
              <Img
                src={projectItem.image}
                alt={projectItem.title}
                className="h-full transition-transform duration-700 group-hover:scale-105"
                fetchPriority="low"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <Badge
                variant="secondary"
                className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border-white/20 text-white"
              >
                {projectItem.type}
              </Badge>
            </div>

            <CardContent className="p-6">
              <h3 className="text-2xl font-semibold text-white/95 mb-2 group-hover:text-white transition-colors">
                {projectItem.title}
              </h3>

              <p className="text-white/60 text-[15px] leading-relaxed mb-4 line-clamp-2">
                {projectItem.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {projectItem.skills.slice(0, 4).map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="bg-white/4 border-white/8 text-white/70 text-xs font-normal hover:bg-white/8 transition-colors"
                  >
                    {skill}
                  </Badge>
                ))}
                {projectItem.skills.length > 4 && (
                  <Badge
                    variant="outline"
                    className="bg-white/4 border-white/8 text-white/70 text-xs font-normal"
                  >
                    +{projectItem.skills.length - 4}
                  </Badge>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  render={
                    <a
                      href={projectItem.link1.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {projectItem.link1.text}
                    </a>
                  }
                  className="flex-1 bg-white/8 hover:bg-white/12 text-white border border-white/8 rounded-xl"
                />

                <Button
                  render={
                    <a
                      href={projectItem.link2.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="w-4 h-4" />
                      {projectItem.link2.text}
                    </a>
                  }
                  variant="outline"
                  className="flex-1 bg-transparent hover:bg-white/8 text-white/80 border-white/8 rounded-xl"
                />
              </div>
            </CardContent>

            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

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
