import "@open-notion/assets/doc.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocRenderer } from "@open-notion/serializers/react";
import { docToToc } from "@open-notion/serializers/toc";
import { getAllBlogs, getPost, getPostScore } from "@/lib/posts";
import PostHeader from "@/components/Blog/post/PostHeader";
import PostFooter from "@/components/Blog/post/PostFooter";
import Toc from "@/components/Blog/post/Toc";
import ScoreMeter from "@/components/Blog/post/ScoreMeter";
import Share from "@/components/Blog/post/Share";
import BlogPostJsonLd from "@/components/Blog/post/BlogPostJsonLd";
import Script from "next/script";

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
  const initialScore = await getPostScore(post.slug);

  return (
    <article className="bg-ink-2 text-cream min-h-full w-full">
      <Script
        src="https://cdn.jsdelivr.net/npm/@open-notion/assets@latest/hydration.js/+esm"
        type="module"
        strategy="afterInteractive"
      />

      <BlogPostJsonLd post={post} />

      <div className="max-w-[1280px] mx-auto pt-14 px-8 pb-24 grid grid-cols-[220px_minmax(0,1fr)_80px] gap-x-14 items-start max-xl:grid-cols-[minmax(0,1fr)] max-xl:gap-x-0 max-xl:px-6 max-xl:pt-8 max-xl:pb-20 max-sm:px-[18px] max-sm:pt-6 max-sm:pb-16">
        <aside
          className="sticky top-8 max-xl:static max-xl:pb-0"
          aria-label="Table of contents"
        >
          <Toc items={toc} />
        </aside>

        <div className="min-w-0 max-w-[720px] justify-self-center w-full">
          <PostHeader post={post} />

          {/* Dark is needed for the Editor */}
          <div className="dark pb-14">
            <DocRenderer doc={post.body} />
          </div>
          <PostFooter prev={post.prev ?? null} next={post.next ?? null} />
        </div>

        <aside className="sticky top-8" aria-label="Article actions">
          <div className="sticky top-8 flex flex-col gap-7 pt-1 max-xl:static max-xl:flex-row max-xl:flex-wrap max-xl:gap-8 max-xl:mt-8 max-xl:pt-6 max-xl:border-t max-xl:border-line max-xl:*:flex-1 max-xl:*:basis-[240px]">
            <ScoreMeter slug={post.slug} initialScore={initialScore} />
            <Share url={url} title={post.title} />
          </div>
        </aside>
      </div>
    </article>
  );
}
