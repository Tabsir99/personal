import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import Section from "../ui/section";
import { getPageData } from "@/app/layout";
import Img from "../ui/image";

export default async function About() {
  const pageData = await getPageData();

  return (
    <Section
      className="bg-zinc-950/40 scroll-mt-16"
      id="about"
      data-navlink="#about"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-4xl max-sm:text-3xl font-bold text-white/95 mb-3">
            About Me
          </h2>
          <p className="text-white/50 text-lg">
            Full-stack developer passionate about backend systems
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
          <div className="space-y-8">
            {pageData.about.map((card, index) => (
              <Card
                key={index}
                className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm text-zinc-100 opacity-0"
                data-fadein
                style={{ animationDelay: `${300 + index * 400}ms` }}
              >
                <CardContent
                  className="p-8 max-sm:p-6"
                  dangerouslySetInnerHTML={{ __html: card }}
                />
              </Card>
            ))}
          </div>

          <div className="space-y-6 lg:sticky lg:top-8">
            <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden relative group">
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  <Img
                    src={pageData.profilePicture}
                    alt="Tabsir - Full Stack Developer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    draggable="false"
                    loading="lazy"
                    fetchPriority="low"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h4 className="text-2xl font-bold text-white mb-1">
                      Tabsir
                    </h4>
                    <p className="text-white/70">Full Stack Developer</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/[0.08] bg-zinc-900/40 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <p className="text-white/80 mb-4 leading-relaxed">
                  Passionate about Tech, Data, or AI? Working on something
                  exciting?
                </p>
                <a
                  href="#contact"
                  className="inline-block px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 rounded-lg text-emerald-400 font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20"
                >
                  Let's Connect
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Section>
  );
}

{
  // const interests = [
  //   "Dashboards & Visualizations",
  //   "Microservices Architecture",
  //   "E-commerce Platforms",
  //   "Social Media Systems",
  // ];
  /* <h3 className="text-2xl font-semibold text-white/95 mb-4">
                    Who I Am
                  </h3>
                  <div className="space-y-4 text-white/70 leading-relaxed">
                    <p>
                      I'm{" "}
                      <span className="text-white/90 font-medium">Tabsir</span>,
                      a full-stack developer based in Bangladesh, passionate
                      about building dynamic web frontends and robust backend
                      systems.
                    </p>
                    <p>
                      You can call me{" "}
                      <span className="text-white/90 font-medium">CG</span>
                      —whether it stands for
                      <span className="text-white/90 font-medium">
                        {" "}
                        CatGuy
                      </span>{" "}
                      or
                      <span className="text-white/90 font-medium">
                        {" "}
                        Computer Guy
                      </span>
                      , both fit me well!
                    </p>
                  </div>

<Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm">
<CardContent className="p-8 max-sm:p-6">
  <h3 className="text-2xl font-semibold text-white/95 mb-4">
    What Drives Me
  </h3>
  <div className="space-y-4 text-white/70 leading-relaxed">
    <p>
      While I work across the full stack, my passion lies in
      backend development—especially working with
      <span className="text-white/90 font-medium">
        {" "}
        APIs, data
      </span>
      , and
      <span className="text-white/90 font-medium">
        {" "}
        algorithms
      </span>
      .
    </p>
    <p>
      There's something satisfying about seeing how APIs interact
      with databases, how they manipulate data, and how everything
      comes together.
    </p>

    <div className="pt-4">
      <p className="text-white/60 text-sm mb-3">
        I enjoy building:
      </p>
      <ul>
        {interests.map((interest) => (
          <li key={interest}>{interest}</li>
        ))}
      </ul>
    </div>
  </div>
</CardContent>
</Card>

<Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm">
<CardContent className="p-8 max-sm:p-6">
  <h3 className="text-2xl font-semibold text-white/95 mb-4">
    Beyond Code
  </h3>
  <p className="text-white/70 leading-relaxed">
    When I'm not coding, I'm probably reading a book, learning
    about AI, or refining my skills. I also enjoy spending time
    with my cat and occasionally catching up with friends.
  </p>
</CardContent>
</Card> */
}
