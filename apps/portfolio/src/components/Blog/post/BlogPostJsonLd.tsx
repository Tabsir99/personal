import type { Post } from "@/lib/posts";

export default function BlogPostJsonLd({ post }: { post: Post }) {
  const url = `https://tabsircg.com/blog/${post.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.dek,
    datePublished: post.date,
    dateModified: post.updatedAtIso,
    author: {
      "@type": "Person",
      name: "Tabsir CG",
      url: "https://tabsircg.com",
    },
    publisher: {
      "@type": "Person",
      name: "Tabsir CG",
      url: "https://tabsircg.com",
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    keywords: post.tags.join(", "),
    articleSection: post.kind,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
