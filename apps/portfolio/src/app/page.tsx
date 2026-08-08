import { Atmosphere } from "@/components/portfolio/atmosphere";
import { CursorGlow } from "@/components/portfolio/cursor-glow";
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
import { Intro } from "@/components/portfolio/intro";
import { Header } from "@/components/portfolio/header";

const SITE_URL = "https://tabsircg.com";
const BRAND_ALIASES = ["tabsircg", "TabsirCG", "Tabsir", "tabsircg.com"];

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

  const personId = `${SITE_URL}/#person`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Tabsir CG",
        alternateName: BRAND_ALIASES,
        description: pageData.description || undefined,
        inLanguage: "en",
        publisher: { "@id": personId },
      },
      {
        "@type": "Person",
        "@id": personId,
        name: "Tabsir CG",
        alternateName: BRAND_ALIASES,
        url: SITE_URL,
        mainEntityOfPage: SITE_URL,
        jobTitle: "Full-Stack Developer",
        description: pageData.description || undefined,
        image: pageData.profilePicture || undefined,
        ...(pageData.contact.email
          ? { email: `mailto:${pageData.contact.email}` }
          : {}),
        sameAs: pageData.contact.social.map((s) => s.url).filter(Boolean),
        knowsAbout: pageData.skills.flatMap((g) => g.skills.map((s) => s.name)),
        ...(pageData.studioName
          ? { worksFor: { "@type": "Organization", name: pageData.studioName } }
          : {}),
      },
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/#profilepage`,
        url: SITE_URL,
        name: pageData.title || "Tabsir CG",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: { "@id": personId },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <Intro />
      <Atmosphere />
      <CursorGlow />

      <Header resume={pageData.resume} />

      <Hero photo={pageData.profilePicture} />
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
