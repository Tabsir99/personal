import {
  ExternalLink,
  Github,
  Calendar,
  Clock,
  User,
  Building2,
  Rocket,
  UserCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Section from "../ui/section";
import { getPageData } from "@/app/layout";
import Img from "../ui/image";
import { PageData } from "@/app/page.type";

type ClientType = PageData["projects"][0]["clientType"];
const getClientIcon = (type: ClientType) => {
  const iconMap: Record<ClientType, React.ElementType> = {
    Startup: Rocket,
    Enterprise: Building2,
    Personal: UserCircle,
  };
  const Icon = iconMap[type] || Building2;
  return Icon;
};

export default async function PortfolioSection() {
  const pageData = await getPageData();
  const projects = pageData.projects
    .filter((project) => project.isActive)
    .sort((_a, b) => (b.featured ? 1 : -1));

  return (
    <Section
      id="portfolio"
      data-navlink="#portfolio"
      className="relative scroll-mt-16 bg-zinc-950/40"
      headerText="Things I've Built"
      headerDescription="Client products and full-featured side projects—all live"
    >
      <div className="px-10 max-sm:px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {projects.map((project, index) => {
            const ClientIcon = getClientIcon(project.clientType);

            return (
              <Card
                key={index}
                className={`group relative opacity-0 pt-0 pb-1 overflow-hidden border bg-zinc-900/50 backdrop-blur-sm transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_0_40px_rgba(96,165,250,0.15)]
                  border-white/10 hover:border-white/20`}
                data-fadein
                style={{
                  animationDelay: `${index * 400}ms`,
                }}
              >
                {project.featured && (
                  <div className="absolute -right-12 top-6 z-10 rotate-45 bg-linear-to-r from-blue-600 to-purple-600 px-12 py-1 text-xs font-semibold text-white shadow-lg">
                    Featured
                  </div>
                )}

                <div className="relative aspect-video overflow-hidden bg-zinc-950 group/image">
                  <Img
                    src={project.image}
                    alt={project.title}
                    className="h-full object-cover transition-transform duration-700 group-hover/image:scale-110"
                    fetchPriority="low"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent opacity-60 transition-opacity duration-500 group-hover/image:opacity-80" />
                </div>

                <CardContent className="p-6">
                  <div className="mb-3">
                    <h3 className="mb-2 text-xl font-semibold text-white transition-colors group-hover:text-blue-400">
                      {project.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{project.year}</span>
                      </div>{" "}
                      |
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{project.duration}</span>
                      </div>{" "}
                      |
                      {project.role && (
                        <div className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          <span>{project.role}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="mb-3 line-clamp-2 text-[15px] leading-normal text-zinc-300">
                    {project.description}
                  </p>

                  {project.metrics && project.metrics.length > 0 ? (
                    <div className="mb-4 flex gap-4 text-xs border-l-2 border-blue-500/30 pl-3 py-1">
                      {project.metrics.slice(0, 2).map((metric, i) => (
                        <div key={i} className="flex items-baseline gap-1.5">
                          <span className="font-bold text-white">
                            {metric.value}
                          </span>
                          <span className="text-zinc-500">{metric.label}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mb-4 py-3" />
                  )}

                  <div className="mb-4">
                    <Badge
                      variant="outline"
                      className="border-blue-500/30 bg-blue-500/10 text-xs"
                      style={{ color: "#93c5fd" }}
                    >
                      <ClientIcon className="mr-1.5 h-3 w-3" />
                      {project.clientType}
                    </Badge>
                  </div>

                  <div className="mb-6 flex flex-wrap gap-2">
                    {project.skills.slice(0, 4).map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="border-zinc-700/50 bg-zinc-800/50 text-xs text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-700/50"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {project.skills.length > 4 && (
                      <Badge
                        variant="outline"
                        className="border-zinc-700/50 bg-zinc-800/50 text-xs text-zinc-200"
                      >
                        +{project.skills.length - 4}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      asChild
                      className="flex-[1.2] rounded-xl bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:shadow-blue-500/30 sm:flex-[1.5]"
                    >
                      <a
                        href={project.link1.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {project.link1.text}
                      </a>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      className="flex-1 rounded-xl border-zinc-700 bg-zinc-800/50 text-zinc-200 hover:text-white transition-all hover:border-zinc-600 hover:bg-zinc-700/50"
                    >
                      <a
                        href={project.link2.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="mr-2 h-4 w-4" />
                        {project.link2.text}
                      </a>
                    </Button>
                  </div>
                </CardContent>

                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-white/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </Card>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
