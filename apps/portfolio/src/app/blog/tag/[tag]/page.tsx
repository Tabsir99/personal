import type { Metadata } from "next";
import { getBlogTags, getRecentBlogs, getSiteConfig } from "@/lib/posts";
import PageTitle from "@/components/Blog/PageTitle";
import BlogArchive from "@/components/Blog/BlogArchive";

type RouteParams = Promise<{ tag: string }>;

export async function generateStaticParams() {
  const tags = await getBlogTags();
  return tags.filter((t) => t !== "all").map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const { tag } = await params;
  const active = decodeURIComponent(tag);
  return {
    title: `#${active} — Writing`,
    alternates: { canonical: `/blog/tag/${tag}` },
  };
}

export default async function BlogTagPage({ params }: { params: RouteParams }) {
  const { tag } = await params;
  const active = decodeURIComponent(tag);

  const [page, site, tags] = await Promise.all([
    getRecentBlogs(),
    getSiteConfig(),
    getBlogTags(),
  ]);
  const filtered = page.items.filter((b) => b.tags.includes(active));

  const landing = site?.blogLanding;
  const heading = landing?.heroHeading || "Writing";
  const tagline =
    landing?.heroTagline || "Field notes from a software engineer.";

  return (
    <div className="page-shell pb-20">
      <PageTitle heading={heading} tagline={tagline} />
      <BlogArchive posts={filtered} tags={tags} active={active} />
    </div>
  );
}
