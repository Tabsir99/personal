import type { Metadata } from "next";
import {
  getBlogTags,
  getFeaturedBlog,
  getRecentBlogs,
  getSiteConfig,
} from "@/lib/posts";
import PageTitle from "@/components/Blog/PageTitle";
import FeaturedCard from "@/components/Blog/FeaturedCard";
import PostRow from "@/components/Blog/PostRow";
import Filters from "@/components/Blog/Filters";

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

type SearchParams = Promise<{ tag?: string }>;

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const activeTag = sp.tag ?? "all";

  const [featured, page, site, tags] = await Promise.all([
    getFeaturedBlog(),
    getRecentBlogs(),
    getSiteConfig(),
    getBlogTags(),
  ]);
  const rest = page.items.filter((b) => b.slug !== featured?.slug);
  const filtered =
    activeTag === "all" ? rest : rest.filter((b) => b.tags.includes(activeTag));

  const landing = site?.blogLanding;
  const heading = landing?.heroHeading || "Writing";
  const tagline =
    landing?.heroTagline || "Field notes from a software engineer.";

  return (
    <div className="page-shell pb-20">
      <PageTitle heading={heading} tagline={tagline} />
      <div className="flex gap-20">
        {featured && <FeaturedCard post={featured} />}
        {/* <Aside
          nowReading={site?.nowReading ?? []}
          currentlyBuilding={site?.currentlyBuilding}
        /> */}
      </div>

      <div className="flex flex-col">
        <Filters tags={tags} active={activeTag} count={filtered.length} />
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-muted grid gap-4 place-items-center">
            <div className="text-[96px] leading-none text-cream/8 font-thin">
              ∅
            </div>
            <div>
              nothing tagged{" "}
              <code className="font-mono text-accent">#{activeTag}</code> yet —
              try another?
            </div>
          </div>
        ) : (
          filtered.map((p, i) => <PostRow key={p.slug} post={p} idx={i} />)
        )}
      </div>
    </div>
  );
}
