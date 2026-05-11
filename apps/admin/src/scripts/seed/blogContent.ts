import type { DocContent } from "@open-notion/editor";

// Source-of-truth blog content for the seed script. Each `body` is a full
// editor document (`DocContent`) — written as a literal JSON tree so the seed
// stays close to what the editor itself stores. The article title and dek live
// in the metadata fields beside `body`; the body itself starts at H2 because
// the page renders the title as the top-level H1.

export interface BlogSeed {
  slug: string;
  title: string;
  dek: string;
  excerpt: string;
  tags: string[];
  kind: string;
  schemaType: string;
  readTime: number;
  coverImageUrl: string;
  publishedDaysAgo: number;
  featured: boolean;
  body: DocContent;
}

export const BLOG_SEEDS: BlogSeed[] = [
  {
    slug: "shipping-faster-with-zod-and-server-actions",
    title: "Shipping Faster with Zod and Server Actions",
    dek: "How a small validation layer at the boundary removed a whole class of bugs from our admin app.",
    excerpt:
      "Zod schemas at the boundary turn brittle form-handlers into single-source validators that the server, the client, and the editor all agree on.",
    tags: ["typescript", "nextjs", "react"],
    kind: "essay",
    schemaType: "BlogPosting",
    readTime: 7,
    coverImageUrl: "",
    publishedDaysAgo: 86,
    featured: false,
    body: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2, id: "the-drift-problem" },
          content: [{ type: "text", text: "The Drift Problem" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "When we rebuilt the admin CMS on top of Next.js Server Actions, the first thing we kept tripping over was data drift between client form state and what the server expected. Every route grew its own ad-hoc parser. Every parser had a slightly different idea of what ",
            },
            { type: "text", text: "optional", marks: [{ type: "code" }] },
            { type: "text", text: " meant." },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "By the third route, the bug pattern was obvious: the form was happy with ",
            },
            {
              type: "text",
              text: "string | undefined",
              marks: [{ type: "code" }],
            },
            { type: "text", text: ", the action coerced it to " },
            { type: "text", text: '""', marks: [{ type: "code" }] },
            {
              type: "text",
              text: ", and somewhere between them a featured-image field would silently end up as the literal string ",
            },
            {
              type: "text",
              text: '"undefined"',
              marks: [{ type: "code" }],
            },
            {
              type: "text",
              text: ". That bug shipped to staging twice before we stopped patching symptoms.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2, id: "one-schema-three-consumers" },
          content: [{ type: "text", text: "One Schema, Three Consumers" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "The fix was to make a single Zod schema the source of truth — the form binds to it, the server action validates with it, and the Firestore reader trusts the same shape on the way out:",
            },
          ],
        },
        {
          type: "codeBlock",
          attrs: { language: "ts" },
          content: [
            {
              type: "text",
              text: `export const blogFormDataSchema = z.object({
  ...baseBlogPropertiesSchema.shape,
  parentBlogId: z.string().nullable(),
  content: docContentSchema,
  hasDraftChanges: z.boolean().default(true),
});

export type BlogFormData = z.infer<typeof blogFormDataSchema>;`,
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "After that, every new field became a five-minute change instead of a half-day audit. Add it to the schema, the type updates everywhere, the form picks it up, the server validates it, the database trusts it.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2, id: "what-we-stopped-doing" },
          content: [{ type: "text", text: "What We Stopped Doing" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Three things came out of the codebase the same week:",
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
                  content: [
                    {
                      type: "text",
                      text: "Middleware layers that existed only to coerce slightly-wrong inputs into the shape the next handler wanted.",
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
                    { type: "text", text: "A manual " },
                    {
                      type: "text",
                      text: "zodToFormFields",
                      marks: [{ type: "code" }],
                    },
                    {
                      type: "text",
                      text: " converter that drifted from the real schema every time someone added a field.",
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
                    { type: "text", text: "An old " },
                    {
                      type: "text",
                      text: "validateBlog()",
                      marks: [{ type: "code" }],
                    },
                    {
                      type: "text",
                      text: " utility that pre-dated server actions and overlapped with the schema entirely.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2, id: "the-trade-off" },
          content: [{ type: "text", text: "The Trade-Off" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Schema-first parsing is not free. Every boundary now does real work, and at first that felt heavyweight for a trusted internal admin. But the first time a deploy caught a typo in a Firestore field name at parse time instead of in production, the trade was already worth it.",
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
                  text: "If the schema doesn't know about it, the app doesn't know about it. ",
                },
                {
                  type: "text",
                  text: "That rule fits in a sentence and answers nine out of ten design questions.",
                  marks: [{ type: "italic" }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    slug: "the-featured-flag-that-wasnt-a-flag",
    title: "The Featured Flag That Wasn't a Flag",
    dek: "Replacing a boolean `featured` field with a `featuredAt` timestamp solved more problems than we expected.",
    excerpt:
      "Booleans answer one question. Timestamps answer it plus 'when' plus 'what about the previous one' — and that turned out to matter more than we expected.",
    tags: ["design", "web-dev"],
    kind: "case-study",
    schemaType: "Article",
    readTime: 5,
    coverImageUrl: "",
    publishedDaysAgo: 54,
    featured: false,
    body: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2, id: "how-it-started" },
          content: [{ type: "text", text: "How It Started" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "The original design had a " },
            {
              type: "text",
              text: "featured: boolean",
              marks: [{ type: "code" }],
            },
            {
              type: "text",
              text: " field on every blog post. Toggling one on meant remembering to toggle the others off. It worked, but it leaked into UI everywhere: confirmation dialogs, batch helpers, an ",
            },
            {
              type: "text",
              text: "unfeatureBlog",
              marks: [{ type: "code" }],
            },
            {
              type: "text",
              text: " endpoint we never quite finished.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2, id: "why-a-boolean-felt-wrong" },
          content: [{ type: "text", text: "Why a Boolean Felt Wrong" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "The symptoms looked unrelated at first. Then they all turned out to be the same root cause:",
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
                  content: [
                    {
                      type: "text",
                      text: "Featuring a new post required a transaction across all published docs, just to flip the old one off.",
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
                      text: "Two writers could race and produce two featured posts. We added an alert. The alert fired.",
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
                      text: "There was no way to ask 'what was featured last week?' — the field had no history.",
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
                      text: "The empty state ('no featured post') was visually distinct from 'a featured post', which doubled the layout work.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2, id: "time-as-the-tiebreaker" },
          content: [{ type: "text", text: "Time as the Tiebreaker" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Switching to " },
            {
              type: "text",
              text: "featuredAt: number | null",
              marks: [{ type: "code" }],
            },
            {
              type: "text",
              text: " collapsed all of that. The featured post is just the published one with the highest non-null ",
            },
            {
              type: "text",
              text: "featuredAt",
              marks: [{ type: "code" }],
            },
            {
              type: "text",
              text: ". Featuring a new post no longer requires unfeaturing anything else; the query handles it:",
            },
          ],
        },
        {
          type: "codeBlock",
          attrs: { language: "ts" },
          content: [
            {
              type: "text",
              text: `db.collection("blogs")
  .where("status", "==", "published")
  .where("featuredAt", "!=", null)
  .orderBy("featuredAt", "desc")
  .limit(1);`,
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "There's no " },
            {
              type: "text",
              text: "unfeatureBlog",
              marks: [{ type: "code" }],
            },
            {
              type: "text",
              text: " action either, and that's by design. Once anything has ever been featured, there's always a featured post. For a blog with a steady cadence, that's the right default.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2, id: "index-cost" },
          content: [{ type: "text", text: "Index Cost" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "The trade-off is a composite Firestore index on ",
            },
            {
              type: "text",
              text: "(status, featuredAt desc)",
              marks: [{ type: "code" }],
            },
            {
              type: "text",
              text: ". Adding it took a minute. Removing three branches of conditional UI took an afternoon and was worth it.",
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
                  text: "Booleans answer one question. Timestamps answer it, plus 'when', plus 'what about the previous one' — and 'when' turned out to be the question we kept needing.",
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    slug: "monorepo-without-a-build-step",
    title: "A Monorepo Where the Shared Package Has No Build Step",
    dek: "We share TypeScript source directly between two Next.js apps. No dist folder, no watch process. Here is why that works and when it would not.",
    excerpt:
      "Skipping the build step on an internal shared package is fine — until it isn't. Here's the exact line where 'fine' stops.",
    tags: ["typescript", "nextjs", "devops"],
    kind: "retrospective",
    schemaType: "Article",
    readTime: 6,
    coverImageUrl: "",
    publishedDaysAgo: 19,
    featured: true,
    body: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2, id: "how-it-works" },
          content: [{ type: "text", text: "How It Works" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Our shared schemas package exports its TypeScript source files directly. There is no compile step, no ",
            },
            { type: "text", text: "dist", marks: [{ type: "code" }] },
            { type: "text", text: " directory, no " },
            {
              type: "text",
              text: "tsc --watch",
              marks: [{ type: "code" }],
            },
            {
              type: "text",
              text: " running in the background. Both Next.js apps add it to ",
            },
            {
              type: "text",
              text: "transpilePackages",
              marks: [{ type: "code" }],
            },
            { type: "text", text: " and Turbopack reads the " },
            { type: "text", text: ".ts", marks: [{ type: "code" }] },
            { type: "text", text: " files inline." },
          ],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "The package.json is the whole trick:" },
          ],
        },
        {
          type: "codeBlock",
          attrs: { language: "json" },
          content: [
            {
              type: "text",
              text: `{
  "name": "@tabsircg/schemas",
  "exports": {
    "./blog": "./src/blog.ts",
    "./dashboard": "./src/dashboard.ts",
    "./portfolio": "./src/portfolio.ts"
  }
}`,
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "And in each app's " },
            {
              type: "text",
              text: "next.config.ts",
              marks: [{ type: "code" }],
            },
            { type: "text", text: ":" },
          ],
        },
        {
          type: "codeBlock",
          attrs: { language: "ts" },
          content: [
            {
              type: "text",
              text: `const nextConfig: NextConfig = {
  transpilePackages: ["@tabsircg/schemas"],
};`,
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2, id: "why-it-works-here" },
          content: [{ type: "text", text: "Why It Works Here" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Three properties make this safe:" },
          ],
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
                      text: "The package is internal.",
                      marks: [{ type: "bold" }],
                    },
                    {
                      type: "text",
                      text: " Never published, never consumed by anything but the two sibling apps in the monorepo.",
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
                      text: "Both consumers are TypeScript.",
                      marks: [{ type: "bold" }],
                    },
                    {
                      type: "text",
                      text: " Same compiler config, same module resolution, same expectations about what 'import a .ts file' means.",
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
                      text: "HMR sees source changes immediately.",
                      marks: [{ type: "bold" }],
                    },
                    {
                      type: "text",
                      text: " Editing a schema reflects in both apps without a manual step or a watcher race.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2, id: "when-it-would-not" },
          content: [{ type: "text", text: "When It Would Not" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Three small changes would each force a real build pipeline. Worth knowing about before they happen:",
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
                  content: [
                    {
                      type: "text",
                      text: "Publishing the package to npm. The ",
                    },
                    {
                      type: "text",
                      text: "exports",
                      marks: [{ type: "code" }],
                    },
                    { type: "text", text: " map would need real " },
                    {
                      type: "text",
                      text: '"development"',
                      marks: [{ type: "code" }],
                    },
                    { type: "text", text: " / " },
                    {
                      type: "text",
                      text: '"production"',
                      marks: [{ type: "code" }],
                    },
                    {
                      type: "text",
                      text: " conditions and dual ESM/CJS outputs.",
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
                      text: "Adding a non-TypeScript consumer — a Node script, a Go binary, anything that can't read .ts directly.",
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
                      text: "Adding runtime side-effects to schema modules (registries, plugin loaders) where import order across apps becomes load-bearing.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2, id: "closing-thought" },
          content: [{ type: "text", text: "Closing Thought" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "It is tempting to " },
            {
              type: "text",
              text: "just in case",
              marks: [{ type: "italic" }],
            },
            {
              type: "text",
              text: " add a build step for hypothetical future requirements. We resisted. Three similar lines is better than a premature abstraction, and a missing build process is also an abstraction you do not have to maintain.",
            },
          ],
        },
      ],
    },
  },
];
