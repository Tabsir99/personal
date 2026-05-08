import { PublishedBlogDB } from "../../../types/blogtypes";

type JsonLDProps = Pick<
  PublishedBlogDB,
  | "title"
  | "dek"
  | "publishedAt"
  | "updatedAt"
  | "schemaType"
  | "coverImageUrl"
  | "slug"
  | "tags"
>;

export default function JsonLD({
  title,
  dek,
  publishedAt,
  updatedAt,
  schemaType,
  coverImageUrl,
  slug,
  tags,
}: JsonLDProps) {
  const url = `https://tabsircg.com/blog/${slug}`;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": schemaType,
          headline: title,
          description: dek,
          image: coverImageUrl,
          datePublished: new Date(publishedAt).toISOString(),
          dateModified: new Date(updatedAt).toISOString(),
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
          url,
          keywords: tags?.join(", "),
          author: [
            {
              "@type": "Person",
              name: "Tabsir CG",
              url: "https://tabsircg.com",
            },
          ],
          publisher: {
            "@type": "Person",
            name: "Tabsir CG",
            url: "https://tabsircg.com",
          },
        }),
      }}
    />
  );
}
