import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocRenderer } from "@open-notion/serializers/react";
import { docToToc } from "@open-notion/serializers";
import { getAllPostSlugs, getPost } from "@/lib/posts";
import PostHeader from "@/components/Blog/post/PostHeader";
import PostFooter from "@/components/Blog/post/PostFooter";
import Toc from "@/components/Blog/post/Toc";
import ReadingProgress from "@/components/Blog/post/ReadingProgress";
import ScoreMeter from "@/components/Blog/post/ScoreMeter";
import Share from "@/components/Blog/post/Share";
import BlogPostJsonLd from "@/components/Blog/post/BlogPostJsonLd";
import "./blog-post.css";

type RouteParams = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
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
    <article className="post">
      <BlogPostJsonLd post={post} />
      <ReadingProgress targetSelector=".post__body" />

      <div className="post__grid">
        <aside className="post__toc" aria-label="Table of contents">
          <Toc items={toc} />
        </aside>

        <div className="post__main">
          <PostHeader post={post} />
          <div className="post__body">
            <DocRenderer doc={post.body} />
          </div>
          <PostFooter prev={post.prev ?? null} next={post.next ?? null} />
        </div>

        <aside className="post__rail" aria-label="Article actions">
          <div className="post__rail-inner">
            <ScoreMeter slug={post.slug} initialGlobal={0} />
            <Share url={url} title={post.title} />
          </div>
        </aside>
      </div>
    </article>
  );
}
