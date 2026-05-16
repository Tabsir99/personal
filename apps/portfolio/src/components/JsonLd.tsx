import { getPageData } from "@/lib/pageData";

export default async function JsonLd() {
  const pageData = await getPageData();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Tabsir CG",
    jobTitle: "Full Stack Developer",
    url: "https://tabsircg.com",
    image: pageData.profilePicture,
    description: pageData.description,
    email: pageData.contact.email,
    sameAs: pageData.contact.social.map((s) => s.url),
    knowsAbout: pageData.skills.flatMap((category) =>
      category.skills.map((skill) => skill.name),
    ),
    worksFor: {
      "@type": "Organization",
      name: "Freelance",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: (
        pageData.testimonials.reduce((sum, t) => sum + t.rating, 0) /
        pageData.testimonials.length
      ).toFixed(1),
      reviewCount: pageData.testimonials.length,
      bestRating: 5,
    },
  };

  const serviceSchemas = pageData.services
    .filter((s) => s.isActive)
    .map((service) => ({
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.title,
      description: service.content,
      provider: {
        "@type": "Person",
        name: "Tabsir CG",
        url: "https://tabsircg.com",
      },
      serviceType: service.title,
      areaServed: {
        "@type": "Place",
        name: "Worldwide",
      },
    }));

  const projectSchemas = pageData.projects
    .filter((p) => p.visible)
    .map((project) => {
      const primaryUrl =
        project.links.find((l) => l.type === "live")?.url ||
        project.links[0]?.url ||
        "";
      return {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: project.title,
        description: project.dek,
        image: project.image,
        url: primaryUrl,
        creator: {
          "@type": "Person",
          name: "Tabsir CG",
          url: "https://tabsircg.com",
        },
        dateCreated: project.year,
        keywords: project.skills.join(", "),
      };
    });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {serviceSchemas.map((schema, index) => (
        <script
          key={`service-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}

      {projectSchemas.map((schema, index) => (
        <script
          key={`project-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}
    </>
  );
}
