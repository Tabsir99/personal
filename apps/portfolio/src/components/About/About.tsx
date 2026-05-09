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
      headerText="About Me"
      headerDescription="Developer, problem-solver, and lifelong learner"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
          <div className="space-y-8">
            {pageData.about.map((card, index) => (
              <Card
                key={index}
                className="border-white/8 bg-white/2 backdrop-blur-sm text-zinc-100 opacity-0"
                data-fadein
                style={{ animationDelay: `${300 + index * 400}ms` }}
              >
                <CardContent
                  className="px-8 py-3"
                  dangerouslySetInnerHTML={{ __html: card }}
                />
              </Card>
            ))}
          </div>

          <div className="space-y-6 lg:sticky lg:top-8">
            <Card className="border-white/8 bg-white/2 backdrop-blur-sm overflow-hidden relative group">
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

                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h4 className="text-2xl font-bold text-white mb-1">
                      Tabsir
                    </h4>
                    <p className="text-white/70">Full Stack Developer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Section>
  );
}
