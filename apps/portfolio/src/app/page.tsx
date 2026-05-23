import { Atmosphere } from "@/components/portfolio/atmosphere";
import { CursorGlow } from "@/components/portfolio/cursor-glow";
import { Rail } from "@/components/portfolio/rail";
import { Hero } from "@/components/portfolio/hero";
import { Endorsement } from "@/components/portfolio/endorsement";
import { About } from "@/components/portfolio/about";
import { Stack } from "@/components/portfolio/stack";
import { Services } from "@/components/portfolio/services";
import { Work } from "@/components/portfolio/work";
import { Voices } from "@/components/portfolio/voices";
import { Writing } from "@/components/portfolio/writing";
import { getPageData } from "@/lib/pageData";
import { getRecentBlogs } from "@/lib/posts";

export default async function Home() {
  const [pageData, recent] = await Promise.all([
    getPageData(),
    getRecentBlogs(4),
  ]);

  const activeProjects = pageData.projects.filter((p) => p.isActive);
  const activeServices = pageData.services.filter((s) => s.isActive);
  const activeSkills = pageData.skills.filter((g) => g.isActive);
  const activeStats = pageData.heroStats
    .slice()
    .sort((a, b) => a.order - b.order);

  const endorsement = pageData.testimonials.find(
    (t) => t.isActive && t.displaySlot === "endorsement",
  );
  const voices = pageData.testimonials.find(
    (t) => t.isActive && t.displaySlot === "voices",
  );

  return (
    <>
      <Atmosphere />
      <CursorGlow />
      <Rail />

      <Hero />
      <Endorsement testimonial={endorsement} />
      <About stats={activeStats} text={pageData.aboutText} />
      <Stack groups={activeSkills} />
      <Services services={activeServices} />
      <Work projects={activeProjects} />
      <Voices testimonial={voices} />
      <Writing posts={recent.items} />
    </>
  );
}
