import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocRenderer } from "@open-notion/serializers/react";
import { docToToc } from "@open-notion/serializers";
import { getAllBlogs, getPost, getPostScore } from "@/lib/posts";
import PostHeader from "@/components/Blog/post/PostHeader";
import PostFooter from "@/components/Blog/post/PostFooter";
import Toc from "@/components/Blog/post/Toc";
import ReadingProgress from "@/components/Blog/post/ReadingProgress";
import ScoreMeter from "@/components/Blog/post/ScoreMeter";
import Share from "@/components/Blog/post/Share";
import BlogPostJsonLd from "@/components/Blog/post/BlogPostJsonLd";

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
    <article className="bg-ink text-cream font-sans min-h-full w-full block">
      <BlogPostJsonLd post={post} />
      <ReadingProgress />

      <div className="max-w-[1280px] mx-auto pt-14 px-8 pb-24 grid grid-cols-[220px_minmax(0,1fr)_80px] gap-x-14 items-start max-[1100px]:grid-cols-[minmax(0,1fr)] max-[1100px]:gap-x-0 max-[1100px]:px-6 max-[1100px]:pt-8 max-[1100px]:pb-20 max-[640px]:px-[18px] max-[640px]:pt-6 max-[640px]:pb-16">
        <aside
          className="sticky top-8 max-[1100px]:static max-[1100px]:pb-0"
          aria-label="Table of contents"
        >
          <Toc items={toc} />
        </aside>

        <div className="min-w-0 max-w-[720px] justify-self-center w-full">
          <PostHeader post={post} />
          <div className="pb-14" data-post-body>
            <DocRenderer doc={post.body} />
          </div>
          <PostFooter prev={post.prev ?? null} next={post.next ?? null} />
        </div>

        <aside className="sticky top-8" aria-label="Article actions">
          <div className="sticky top-8 flex flex-col gap-7 pt-1 max-[1100px]:static max-[1100px]:flex-row max-[1100px]:flex-wrap max-[1100px]:gap-8 max-[1100px]:mt-8 max-[1100px]:pt-6 max-[1100px]:border-t max-[1100px]:border-line max-[1100px]:[&>*]:flex-1 max-[1100px]:[&>*]:basis-[240px]">
            <ScoreMeter slug={post.slug} initialScore={initialScore} />
            <Share url={url} title={post.title} />
          </div>
        </aside>
      </div>
    </article>
  );
}
