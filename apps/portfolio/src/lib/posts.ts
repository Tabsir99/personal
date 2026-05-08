import type { DocContent } from "@open-notion/serializers";

export type PostKind = "essay" | "deep-dive" | "war-story" | "notes";
export type RowAccent = "warm" | "ink" | "teal";

export type PostMeta = {
  slug: string;
  title: string;
  dek: string;
  excerpt: string;
  date: string;
  readTime: number;
  kind: PostKind;
  accent: RowAccent;
  tags: string[];
  featured?: boolean;
};

export type Neighbour = { slug: string; title: string };

export type Post = PostMeta & {
  body: DocContent;
  prev?: Neighbour;
  next?: Neighbour;
};

const stub = (text: string): DocContent => ({
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", text }],
    },
  ],
});

const POSTS: Record<string, Post> = {
  "postgres-index-nap": {
    slug: "postgres-index-nap",
    title: "The day my Postgres index decided to take a nap",
    dek: "A 3 a.m. pager incident, a 400ms query that became 40 seconds, and the bloated B-tree that started it all.",
    excerpt:
      "A 3am pager incident, a 400ms query that became 40 seconds, and the bloated B-tree that started it all. Lessons in autovacuum, statistics, and trusting EXPLAIN.",
    date: "2026-05-02",
    readTime: 9,
    kind: "war-story",
    accent: "warm",
    featured: true,
    tags: ["postgres", "performance", "war-story"],
    prev: { slug: "boring-stack", title: "A love letter to the boring stack" },
    next: {
      slug: "tiny-typescript-checker",
      title: "Writing a tiny TypeScript type-checker for fun",
    },
    body: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "It is " },
            { type: "text", marks: [{ type: "italic" }], text: "3:14 a.m." },
            {
              type: "text",
              text: " on a Tuesday. The pager — a small, joyless rectangle that lives on my nightstand — buzzes once, then twice, then a third time as if to say ",
            },
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "I am serious about this.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2, id: "the-symptom" },
          content: [{ type: "text", text: "The symptom" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Our checkout query — normally a sub-400ms creature — had ballooned to 40 seconds. P99 was a flatline at the timeout. Customers were getting nice apologetic 502s. The on-call dashboard looked like a Christmas tree someone had forgotten to take down.",
            },
          ],
        },
        {
          type: "callout",
          attrs: { emoji: "⚠️", hexId: "26a0-fe0f", textAlign: "left" },
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Rule of thumb: if EXPLAIN says " },
                { type: "text", marks: [{ type: "code" }], text: "Seq Scan" },
                {
                  type: "text",
                  text: " on a 40-million-row table, you have already lost. The only question left is how loudly.",
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 3, id: "what-explain-said" },
          content: [{ type: "text", text: "What EXPLAIN said" }],
        },
        {
          type: "codeBlock",
          attrs: { language: "sql" },
          content: [
            {
              type: "text",
              text: "EXPLAIN (ANALYZE, BUFFERS)\nSELECT o.id, o.total\nFROM   orders o\nWHERE  o.user_id = 4207388\n  AND  o.created_at > now() - interval '7 days'\nORDER  BY o.created_at DESC\nLIMIT  20;",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "The plan was returning a sequential scan over 40 million rows where I expected an index lookup over a few hundred. Postgres had decided, for reasons it would not share, that ",
            },
            {
              type: "text",
              marks: [{ type: "code" }],
              text: "idx_orders_user_id_created_at",
            },
            { type: "text", text: " was no longer worth its time." },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2, id: "autovacuum-the-quiet-villain" },
          content: [{ type: "text", text: "Autovacuum, the quiet villain" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "I checked pg_stat_user_tables. The orders table had not been autovacuumed in eleven days. Eleven. The table had grown by a few million rows during a marketing push, and the planner's row estimate was now off by two orders of magnitude.",
            },
          ],
        },
        {
          type: "blockquote",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "The planner is not stupid. It is aggressively, mathematically faithful to the statistics you give it. Stale stats are the entire game.",
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 3, id: "the-fix" },
          content: [{ type: "text", text: "The fix" }],
        },
        {
          type: "orderedList",
          attrs: { start: 1, type: null },
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "code" }],
                      text: "ANALYZE orders;",
                    },
                    {
                      type: "text",
                      text: " — refreshes statistics. Cheap, nearly always safe.",
                    },
                  ],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Lower autovacuum_analyze_scale_factor on the orders table from 0.1 to 0.02.",
                    },
                  ],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "REINDEX the bloated index in the background once the bleeding stopped.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Forty seconds went back to 412 milliseconds the moment ANALYZE finished. I went back to bed at 4:48 a.m. and dreamt of B-trees, gently rebalancing themselves.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2, id: "what-i-changed-permanently" },
          content: [{ type: "text", text: "What I changed permanently" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "A weekly cron that runs " },
                    {
                      type: "text",
                      marks: [{ type: "code" }],
                      text: "VACUUM (ANALYZE)",
                    },
                    { type: "text", text: " on the five busiest tables." },
                  ],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "An alert when n_dead_tup / n_live_tup crosses 0.1 on any table over 1M rows.",
                    },
                  ],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "A small sense of humility about how much I trust the planner without ever checking on it.",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },

  "tiny-typescript-checker": {
    slug: "tiny-typescript-checker",
    title: "Writing a tiny TypeScript type-checker for fun",
    dek: "Structural typing in 400 lines.",
    excerpt:
      "Structural typing in 400 lines. What I learned about variance, narrowing, and why intersections are weirder than they look.",
    date: "2026-04-24",
    readTime: 14,
    kind: "deep-dive",
    accent: "ink",
    tags: ["typescript", "compilers", "deep-dive"],
    prev: { slug: "postgres-index-nap", title: "The day my Postgres index decided to take a nap" },
    next: { slug: "shipping-side-projects", title: "Notes on shipping side projects when you have a job" },
    body: stub(
      "A short post about building a 400-line type-checker for a tiny structural language. Coming soon — this is a fixture stub.",
    ),
  },

  "shipping-side-projects": {
    slug: "shipping-side-projects",
    title: "Notes on shipping side projects when you have a job",
    dek: "A messy, honest field report on energy budgets and weekend cadences.",
    excerpt:
      "A messy, honest field report on energy budgets, weekend cadences, and learning to ship a v0.1 you're a little embarrassed by.",
    date: "2026-04-11",
    readTime: 6,
    kind: "essay",
    accent: "teal",
    tags: ["meta", "habits"],
    prev: { slug: "tiny-typescript-checker", title: "Writing a tiny TypeScript type-checker for fun" },
    next: { slug: "useeffect-not-lifecycle", title: "useEffect is not a lifecycle method" },
    body: stub("A short essay on shipping cadence. Coming soon — fixture stub."),
  },

  "useeffect-not-lifecycle": {
    slug: "useeffect-not-lifecycle",
    title: "useEffect is not a lifecycle method (and other ways I made my React app slow)",
    dek: "Six anti-patterns I hand-rolled into production.",
    excerpt:
      "Six anti-patterns I hand-rolled into production, ranked by how much therapy they required.",
    date: "2026-03-28",
    readTime: 11,
    kind: "essay",
    accent: "warm",
    tags: ["react", "performance"],
    prev: { slug: "shipping-side-projects", title: "Notes on shipping side projects when you have a job" },
    next: { slug: "sqlite-source-tour", title: "I read the SQLite source code so you don't have to" },
    body: stub("Six React performance anti-patterns. Coming soon — fixture stub."),
  },

  "sqlite-source-tour": {
    slug: "sqlite-source-tour",
    title: "I read the SQLite source code so you don't have to",
    dek: "A reading-list tour through the bytecode VM, the pager, and the most thoughtfully boring code I've ever read.",
    excerpt:
      "A reading-list tour through the bytecode VM, the pager, and why SQLite is the most thoughtfully boring code I've ever read.",
    date: "2026-03-14",
    readTime: 22,
    kind: "deep-dive",
    accent: "ink",
    tags: ["sqlite", "internals", "deep-dive"],
    prev: { slug: "useeffect-not-lifecycle", title: "useEffect is not a lifecycle method" },
    next: { slug: "boring-stack", title: "A love letter to the boring stack" },
    body: stub("A guided tour of the SQLite source tree. Coming soon — fixture stub."),
  },

  "boring-stack": {
    slug: "boring-stack",
    title: "A love letter to the boring stack",
    dek: "Postgres, a Rails-shaped monolith, and a single Hetzner box.",
    excerpt:
      "Postgres, a Rails-shaped monolith, and a single Hetzner box. Why I'm gleefully unfashionable.",
    date: "2026-02-27",
    readTime: 5,
    kind: "essay",
    accent: "teal",
    tags: ["meta", "architecture"],
    prev: { slug: "sqlite-source-tour", title: "I read the SQLite source code so you don't have to" },
    next: { slug: "weekend-crdt", title: "Building a CRDT in a weekend (it almost worked)" },
    body: stub("In praise of mature, boring software. Coming soon — fixture stub."),
  },

  "weekend-crdt": {
    slug: "weekend-crdt",
    title: "Building a CRDT in a weekend (it almost worked)",
    dek: "Last-write-wins is a lie I told myself.",
    excerpt:
      "Last-write-wins is a lie I told myself. A short, embarrassing journey through Yjs, Automerge, and rolling my own.",
    date: "2026-02-12",
    readTime: 13,
    kind: "deep-dive",
    accent: "warm",
    tags: ["crdts", "distributed", "war-story"],
    prev: { slug: "boring-stack", title: "A love letter to the boring stack" },
    body: stub("A weekend-long flirtation with CRDTs. Coming soon — fixture stub."),
  },
};

const ORDER: string[] = [
  "postgres-index-nap",
  "tiny-typescript-checker",
  "shipping-side-projects",
  "useeffect-not-lifecycle",
  "sqlite-source-tour",
  "boring-stack",
  "weekend-crdt",
];

export async function getPost(slug: string): Promise<Post | null> {
  return POSTS[slug] ?? null;
}

export async function getAllPostSlugs(): Promise<string[]> {
  return ORDER.filter((s) => s in POSTS);
}

export async function getAllPosts(): Promise<PostMeta[]> {
  return ORDER.filter((s) => s in POSTS).map((s) => {
    const { body: _body, prev: _prev, next: _next, ...meta } = POSTS[s];
    return meta;
  });
}

export const ALL_TAGS: string[] = [
  "all",
  ...Array.from(
    new Set(
      Object.values(POSTS).flatMap((p) => p.tags),
    ),
  ).sort(),
];
