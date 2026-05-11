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
import Aside from "@/components/Blog/Aside";
import "./blog.css";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  const landing = site?.blogLanding;
  const title = landing?.metaTitle || "Writing — tabsircg.com";
  const description =
    landing?.metaDescription ||
    "Field notes from a software engineer.";
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
    landing?.heroTagline ||
    "Field notes from a software engineer.";

  return (
    <div className="blog page">
      <div className="max-w-6xl mx-auto">
        <PageTitle heading={heading} tagline={tagline} />
        <main className="layout">
          <section className="layout__main">
            {featured && <FeaturedCard post={featured} />}
            <Filters tags={tags} active={activeTag} count={filtered.length} />
            <div className="rows">
              {filtered.length === 0 ? (
                <div className="empty">
                  <div className="empty__big">∅</div>
                  <div>
                    nothing tagged <code>#{activeTag}</code> yet — try another?
                  </div>
                </div>
              ) : (
                filtered.map((p, i) => (
                  <PostRow key={p.slug} post={p} idx={i} />
                ))
              )}
            </div>
          </section>
          <Aside
            nowReading={site?.nowReading ?? []}
            currentlyBuilding={
              site?.currentlyBuilding ?? {
                code: "",
                body: "",
                linkLabel: "",
                linkHref: "",
              }
            }
          />
        </main>
      </div>
    </div>
  );
}
