import React from "react";
import { Card, CardContent } from "../ui/card";
import Section from "../ui/section";
import { getPageData } from "@/app/layout";
import Img from "../ui/image";

export default async function Skills() {
  const pageData = await getPageData();

  return (
    <Section
      className="bg-zinc-950/40"
      id="skills"
      data-navlink="#skills"
      headerText="Tech Stack & Expertise"
      headerDescription="Technologies I work with to build modern web applications"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pageData.skills.map((category, index) => (
            <Card
              key={index}
              data-fadein
              className="border-white/8 bg-white/2 backdrop-blur-sm hover:bg-white/4 transition-colors opacity-0"
              style={{ animationDelay: `${index * 400}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Img
                    src={category.icon as string}
                    alt={category.title}
                    className="w-8 h-8"
                    fetchPriority="low"
                    loading="lazy"
                  />
                  <h3 className="text-xl font-semibold text-white/95">
                    {category.title}
                  </h3>
                </div>

                <div className="space-y-4">
                  {category.skills.map((skill) => {
                    return (
                      <div key={skill.name}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Img
                              src={skill.icon as string}
                              alt={skill.name}
                              className="w-4 h-4"
                              fetchPriority="low"
                              loading="lazy"
                            />
                            <span className="text-white/80 text-sm font-medium">
                              {skill.name}
                            </span>
                          </div>
                          <span
                            data-countup={skill.level}
                            data-suffix="%"
                            className="text-white/50 text-xs"
                          />
                        </div>

                        <div className="h-1.5 rounded-full overflow-hidden">
                          <div
                            data-progress={skill.level}
                            className={`h-full bg-linear-to-r from-transparent to-purple-500 rounded-full duration-2200 w-0`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}
