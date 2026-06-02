import type { Metadata } from "next";
import {
  getBlogTags,
  getFeaturedBlog,
  getRecentBlogs,
  getSiteConfig,
} from "@/lib/posts";
import PageTitle from "@/components/Blog/PageTitle";
import FeaturedCard from "@/components/Blog/FeaturedCard";
import BlogArchive from "@/components/Blog/BlogArchive";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  const landing = site?.blogLanding;
  const title = landing?.metaTitle || "Writing — tabsircg.com";
  const description =
    landing?.metaDescription || "Field notes from a software engineer.";
  return {
    title,
    description,
    alternates: { canonical: "/blog" },
    openGraph: {
      title,
      description,
      type: "website",
      url: "/blog",
    },
  };
}

export default async function BlogIndexPage() {
  const [featured, page, site, tags] = await Promise.all([
    getFeaturedBlog(),
    getRecentBlogs(),
    getSiteConfig(),
    getBlogTags(),
  ]);
  const rest = page.items.filter((b) => b.slug !== featured?.slug);

  const landing = site?.blogLanding;
  const heading = landing?.heroHeading || "Writing";
  const tagline =
    landing?.heroTagline || "Field notes from a software engineer.";

  return (
    <div className="page-shell pb-20">
      <PageTitle heading={heading} tagline={tagline} />
      <div className="flex gap-20">
        {featured && <FeaturedCard post={featured} />}
      </div>

      <BlogArchive posts={rest} tags={tags} active="all" />
    </div>
  );
}
