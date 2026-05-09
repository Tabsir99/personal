import { randomUUID } from "crypto";
import { BlogKind, BlogStatus, SchemaType } from "@tabsircg/schemas/blog";
import { db, Collections } from "@/config/firebaseAdmin";

type BlogSeedInput = {
  title: string;
  slug: string;
  kind: BlogKind;
  schemaType: SchemaType;
  dek: string;
  excerpt: string;
  tags: string[];
  readTime: number;
  daysAgoPublished: number;
  stats: { views: number; likes: number; comments: number; shares: number };
  featuredAtDaysAgo?: number;
  status?: Exclude<(typeof BlogStatus)[keyof typeof BlogStatus], "draft">;
};

type DailyStat = {
  date: string;
  sessions: number;
  pageViews: number;
  uniqueVisits: number;
  bounces: number;
  portfolioClicks: number;
  totalSessionDuration: number;
};

function timestampDaysAgo(daysAgo: number): number {
  return Date.now() - daysAgo * 24 * 60 * 60 * 1000;
}

function toDateString(ts: number): string {
  return new Date(ts).toISOString().split("T")[0];
}

function blogContent(title: string, dek: string): string {
  const content = {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: title }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: dek }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "This post is seeded with realistic editorial content so local previews, excerpt cards, read-time chips, and analytics views look production-like during development.",
          },
        ],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Clear problem framing and trade-offs" }],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Stepwise implementation strategy" }],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Measurable outcomes and follow-ups" }],
              },
            ],
          },
        ],
      },
    ],
  };

  return JSON.stringify(content);
}

function buildPublishedBlog(input: BlogSeedInput, blogId: string) {
  const publishedAt = timestampDaysAgo(input.daysAgoPublished);
  const createdAt = timestampDaysAgo(input.daysAgoPublished + 8);
  const updatedAt = timestampDaysAgo(Math.max(0, input.daysAgoPublished - 1));
  const featuredAt =
    typeof input.featuredAtDaysAgo === "number"
      ? timestampDaysAgo(input.featuredAtDaysAgo)
      : null;

  return {
    blogId,
    parentBlogId: null,
    kind: input.kind,
    schemaType: input.schemaType,
    slug: input.slug,
    status: input.status ?? BlogStatus.published,
    title: input.title,
    dek: input.dek,
    excerpt: input.excerpt,
    seoTitle: input.title,
    tags: input.tags,
    socialTitle: input.title,
    socialDescription: input.dek,
    coverImageUrl: `https://images.unsplash.com/photo-${1700000000000 + Math.floor(Math.random() * 100000)}?auto=format&fit=crop&w=1600&q=80`,
    content: blogContent(input.title, input.dek),
    readTime: input.readTime,
    metaDescription: input.dek,
    createdAt,
    updatedAt,
    featuredAt,
    publishedAt,
    recommendedBlogIds: [] as string[],
    stats: input.stats,
  };
}

function buildDraft({
  title,
  dek,
  tags,
  parentBlogId,
  daysAgo,
}: {
  title: string;
  dek: string;
  tags: string[];
  parentBlogId: string | null;
  daysAgo: number;
}) {
  const blogId = randomUUID();
  const createdAt = timestampDaysAgo(daysAgo);
  const updatedAt = timestampDaysAgo(Math.max(0, daysAgo - 1));
  return {
    blogId,
    parentBlogId,
    kind: "notes" as BlogKind,
    schemaType: SchemaType.BlogPosting,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    status: BlogStatus.draft,
    title,
    dek,
    excerpt: dek,
    seoTitle: title,
    tags,
    socialTitle: title,
    socialDescription: dek,
    coverImageUrl: "",
    content: blogContent(title, dek),
    readTime: 5,
    metaDescription: dek,
    createdAt,
    updatedAt,
    featuredAt: null,
  };
}

function buildDailyStats(days = 14): DailyStat[] {
  const stats: DailyStat[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const t = timestampDaysAgo(i);
    const weekdayFactor = [0.88, 0.93, 1, 1.04, 1.08, 1.2, 0.95][new Date(t).getDay()];
    const sessions = Math.round((120 + (days - i) * 4) * weekdayFactor);
    const pageViews = Math.round(sessions * (1.65 + (i % 3) * 0.09));
    const uniqueVisits = Math.round(sessions * 0.68);
    const bounces = Math.round(pageViews * 0.18);
    const portfolioClicks = Math.round(sessions * 0.11);
    const totalSessionDuration = sessions * (220 + (i % 4) * 18);

    stats.push({
      date: toDateString(t),
      sessions,
      pageViews,
      uniqueVisits,
      bounces,
      portfolioClicks,
      totalSessionDuration,
    });
  }
  return stats;
}

async function seedBlogs() {
  const blogSeeds: BlogSeedInput[] = [
    {
      title: "Designing a Draft/Publish Flow That Survives Real Edits",
      slug: "draft-publish-flow-real-edits",
      kind: "deep-dive",
      schemaType: SchemaType.Article,
      dek: "How to model drafts, published versions, and editorial confidence without losing data integrity.",
      excerpt:
        "A practical architecture for keeping drafts independent while preserving canonical published IDs.",
      tags: ["cms", "editorial", "architecture"],
      readTime: 9,
      daysAgoPublished: 26,
      featuredAtDaysAgo: 4,
      stats: { views: 1890, likes: 112, comments: 19, shares: 41 },
    },
    {
      title: "Fast Firestore Query Patterns for Blog Index Endpoints",
      slug: "fast-firestore-query-patterns-blog-index",
      kind: "essay",
      schemaType: SchemaType.BlogPosting,
      dek: "Reliable pagination, cursor handling, and index-safe query composition for public blog APIs.",
      excerpt:
        "Patterns that keep `/api/blogs` fast as content volume grows past trivial limits.",
      tags: ["firebase", "firestore", "performance"],
      readTime: 7,
      daysAgoPublished: 19,
      stats: { views: 1462, likes: 87, comments: 13, shares: 28 },
    },
    {
      title: "The Editorial Cost of Ambiguous Slugs",
      slug: "editorial-cost-of-ambiguous-slugs",
      kind: "war-story",
      schemaType: SchemaType.Article,
      dek: "A migration story on why slug ownership and history should be explicit from day one.",
      excerpt:
        "Lessons from conflicting permalink assumptions and late-stage SEO cleanup.",
      tags: ["seo", "content-modeling", "lessons"],
      readTime: 6,
      daysAgoPublished: 11,
      status: BlogStatus.unpublished,
      stats: { views: 632, likes: 35, comments: 7, shares: 9 },
    },
    {
      title: "Shipping Better Meta Tags Without Overfitting",
      slug: "shipping-better-meta-tags-without-overfitting",
      kind: "notes",
      schemaType: SchemaType.NewsArticle,
      dek: "A short checklist for social previews, search snippets, and metadata fallbacks.",
      excerpt:
        "Treat SEO metadata as product UX, not an afterthought attached at publish time.",
      tags: ["seo", "metadata", "frontend"],
      readTime: 5,
      daysAgoPublished: 6,
      stats: { views: 918, likes: 51, comments: 8, shares: 17 },
    },
  ];

  const published = blogSeeds.map((seed) => buildPublishedBlog(seed, randomUUID()));

  if (published.length > 2) {
    published[0].recommendedBlogIds = [published[1].blogId, published[3].blogId];
    published[1].recommendedBlogIds = [published[0].blogId];
    published[3].recommendedBlogIds = [published[1].blogId];
  }

  const drafts = [
    buildDraft({
      title: "Realtime Analytics in Firestore Without Event Backlogs",
      dek: "Draft notes on balancing write frequency with dashboard freshness.",
      tags: ["analytics", "firestore", "ops"],
      parentBlogId: null,
      daysAgo: 2,
    }),
    buildDraft({
      title: "Editing Pass for Draft/Publish Flow",
      dek: "Follow-up edits prepared for the featured deep dive.",
      tags: ["cms", "editorial"],
      parentBlogId: published[0].blogId,
      daysAgo: 1,
    }),
  ];

  const batch = db.batch();
  for (const post of [...published, ...drafts]) {
    const docRef = db.collection(Collections.BLOGS).doc(post.blogId);
    batch.set(docRef, post, { merge: false });
  }

  const tagSet = new Set<string>();
  [...published, ...drafts].forEach((post) => post.tags.forEach((tag) => tagSet.add(tag)));
  batch.set(
    db.collection(Collections.CONFIG).doc("blog"),
    { tags: Array.from(tagSet).sort() },
    { merge: true },
  );

  await batch.commit();
  return { publishedCount: published.length, draftCount: drafts.length };
}

async function seedAnalytics() {
  const daily = buildDailyStats(14);
  const countries = [
    { country: "Bangladesh", ratio: 0.46, mobileRatio: 0.73 },
    { country: "United States", ratio: 0.22, mobileRatio: 0.58 },
    { country: "India", ratio: 0.18, mobileRatio: 0.76 },
    { country: "Germany", ratio: 0.14, mobileRatio: 0.49 },
  ];
  const traffic = [
    { source: "organic", ratio: 0.52 },
    { source: "linkedin", ratio: 0.14 },
    { source: "direct", ratio: 0.2 },
    { source: "twitter", ratio: 0.08 },
    { source: "reddit", ratio: 0.06 },
  ] as const;
  const keyPages = ["/", "/blog", "/blog/draft-publish-flow-real-edits", "/projects"];

  const batch = db.batch();
  for (const day of daily) {
    batch.set(db.collection("daily_stats").doc(day.date), day, { merge: false });

    for (const country of countries) {
      const sessions = Math.round(day.sessions * country.ratio);
      const pageViews = Math.round(day.pageViews * country.ratio);
      const uniqueVisits = Math.round(day.uniqueVisits * country.ratio);
      const mobile = Math.round(sessions * country.mobileRatio);
      const desktop = Math.round(sessions * (1 - country.mobileRatio - 0.05));
      const tablet = Math.max(0, sessions - mobile - desktop);

      batch.set(
        db.collection("geo_stats").doc(`${day.date}_${country.country}`),
        {
          date: day.date,
          country: country.country,
          sessions,
          pageViews,
          uniqueVisits,
          devices: { mobile, desktop, tablet },
          bounces: Math.round(day.bounces * country.ratio),
        },
        { merge: false },
      );
    }

    for (const source of traffic) {
      batch.set(
        db.collection("traffic_sources").doc(`${day.date}_${source.source}`),
        {
          date: day.date,
          source: source.source,
          sessions: Math.round(day.sessions * source.ratio),
          pageViews: Math.round(day.pageViews * source.ratio),
          bounces: Math.round(day.bounces * source.ratio),
        },
        { merge: false },
      );
    }

    keyPages.forEach((path, idx) => {
      const views = Math.round(day.pageViews * (0.4 - idx * 0.08));
      const exitCount = Math.max(1, Math.round(views * 0.44));
      const totalTimeOnPage = exitCount * (45 + idx * 22);
      const bounces = Math.round(exitCount * (0.17 + idx * 0.04));
      batch.set(
        db.collection("page_performance").doc(`${day.date}_${encodeURIComponent(path)}`),
        {
          date: day.date,
          path,
          views,
          totalTimeOnPage,
          exitCount,
          bounces,
        },
        { merge: false },
      );
    });
  }

  await batch.commit();
  return { dailyDocs: daily.length };
}

async function seedFirestore() {
  const blogResult = await seedBlogs();
  const analyticsResult = await seedAnalytics();

  console.info("Seed complete:", {
    ...blogResult,
    ...analyticsResult,
  });
}

seedFirestore().catch((error) => {
  console.error("Seed failed", error);
  process.exitCode = 1;
});
