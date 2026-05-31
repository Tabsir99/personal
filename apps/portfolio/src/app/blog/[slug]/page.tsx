import "@open-notion/assets/doc.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocRenderer } from "@open-notion/serializers/react";
import { docToToc } from "@open-notion/serializers/toc";
import { getAllBlogs, getPost } from "@/lib/posts";
import PostHeader from "@/components/Blog/post/PostHeader";
import PostFooter from "@/components/Blog/post/PostFooter";
import Toc from "@/components/Blog/post/Toc";
import FeltMeter from "@/components/Blog/post/FeltMeter";
import Share from "@/components/Blog/post/Share";
import BlogPostJsonLd from "@/components/Blog/post/BlogPostJsonLd";
import Script from "next/script";
import TocIsland from "@/components/Blog/post/TocIsland";

type RouteParams = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const blogs = await getAllBlogs();
  return blogs.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not found" };
  const url = `/blog/${post.slug}`;
  return {
    title: `${post.title} — tabsircg.com`,
    description: post.dek,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.dek,
      type: "article",
      url,
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.dek,
    },
    keywords: post.tags,
  };
}

export default async function PostPage({ params }: { params: RouteParams }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const toc = docToToc(post.body);
  const url = `https://tabsircg.com/blog/${post.slug}`;

  return (
    <article className="bg-ink-2 text-cream min-h-full w-full py-8 px-8">
      <Script
        src="https://cdn.jsdelivr.net/npm/@open-notion/assets@latest/hydration.js/+esm"
        type="module"
        strategy="afterInteractive"
      />

      <BlogPostJsonLd post={post} />

      <div className="max-w-7xl mx-auto grid grid-cols-[220px_minmax(0,1fr)_80px] max-lg:grid-cols-[220px_minmax(0,1fr)] max-md:grid-cols-1 gap-x-10 gap-y-6 items-start">
        <aside
          className="sticky top-8 max-md:static"
          aria-label="Table of contents"
        >
          <Toc items={toc} />
        </aside>

        <div className="min-w-0 max-w-3xl justify-self-center w-full">
          <PostHeader post={post} />

          <div className="dark pb-14">
            <DocRenderer doc={post.body} />
          </div>
        </div>

        <aside
          className="sticky top-8 flex flex-col gap-8 max-md:flex-row"
          aria-label="Article actions"
        >
          <FeltMeter slug={post.slug} />
          <Share url={url} title={post.title} />
        </aside>
      </div>

      <PostFooter prev={post.prev ?? null} next={post.next ?? null} />

      <TocIsland />
    </article>
  );
}
