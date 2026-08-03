# Project context for Claude

This file is loaded automatically at the start of every Claude Code session. It captures durable decisions and gotchas that aren't obvious from reading the code. Update it when something changes that would surprise a future you.

## Important

Stage and commit changes after every meaningful change. Dont wait for the entire feature to be completed. But don't over commit either.
Follow global commit rules.

## Comments — write none

**Do not write comments.** Not `//`, not `/* */`, not JSDoc, not section
banners, not "just this one because it's subtle." Express it in the code:
name the variable, extract a named function, name the constant. The urge to
explain in prose is a signal the code needs a better name or a smaller
function — act on that instead.

Banned outright:

- Anything referencing a change, diff, or history: `// switched to X`,
  `// fixed the bug where…`, `// previously…`. A comment about what the code
  no longer does is the worst kind.
- JSDoc on exported functions and types. The signature is the documentation.
- Restating what a line does, labelling a section, annotating an obvious guard.

A comment is allowed only when the information genuinely cannot live in code
**and** its absence would cause a wrong change later — a measured benchmark
number, an external API quirk with no local evidence. That bar is high and is
almost never met. Do not ration comments down to "a few good ones"; the target
is zero. Everything else goes in this file, a repo `.md`, or the commit
message.

Before reporting any work done, grep the changed files for comment markers and
delete what you find.

## Layout

```
/personal/
├── apps/
│   ├── admin/        Next.js 16 admin/CMS for the blog + portfolio data. Port 5000.
│   └── portfolio/    Next.js 16 public site that consumes admin's REST API. Port 3001.
├── apps/
│   └── analytics-worker/  Cloudflare Worker at analytics.tabsircg.com — the ingest endpoint, plus the Tinybird .datasource DDL.
└── packages/
    ├── schemas/      @tabsircg/schemas — shared Zod schemas + ApiResponse/CursorPage types, plus
    │                 `@tabsircg/schemas/analytics` (the analytics_events column contract, shared by
    │                 the worker's ingest, admin's Stripe webhook, and admin's query builder `F`).
    └── analytics/    @tabsircg/analytics — the browser tracker SDK. Published to npm, unlike the rest.
```

There was a separate `@tabsircg/analytics-contract` package for the column
contract; it was folded into `@tabsircg/schemas/analytics` and deleted. One
shared package, not two.

Single git repo, pnpm workspace. History was merged from the original two repos (`tabsircgadmin/`, `portfolio/`) using `git filter-repo --to-subdirectory-filter`, so `git log --follow apps/admin/src/...` walks back into pre-monorepo commits. The pre-merge originals are at `/home/tabsir/ap/reactp/personal.old/` — safe to delete when comfortable.

## Workspace + dev story (the part that's easy to mis-design)

`@tabsircg/schemas` exports its TypeScript source files directly via the `exports` map — no build step, no `dist`, no `"development"` exports condition. Both apps add `transpilePackages: ["@tabsircg/schemas"]` in `next.config.ts`, so Next/Turbopack reads the `.ts` files inline and watches them for HMR. Editing a schema instantly propagates to both apps without any rebuild.

This is only available because the package is internal-only (never published to npm). If you ever publish it, you'd need a real build + dual `"development"` / `"production"` exports conditions. Don't add a build step "just in case."

Commands from workspace root:

- `pnpm tc` — typecheck both apps in parallel
- `pnpm dev` — both dev servers (admin :5000, portfolio :3001) in parallel
- `pnpm dev:admin` / `pnpm dev:portfolio` — single app
- `pnpm build` — both apps

## Wire contracts (admin → portfolio)

Every admin REST response is wrapped by `wrapRoute` ([apps/admin/src/lib/appUtils.ts](apps/admin/src/lib/appUtils.ts)) into:

```ts
type ApiResponse<T> =
  | { status: "success"; data: T }
  | { status: "error"; message: string };
```

200 responses use the success branch; 400 (Zod errors) and 500 use the error branch. Portfolio's `fetchJson` helper unwraps this envelope.

Paginated list endpoints (just `/api/blogs` for now) wrap the `data` payload in:

```ts
interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}
```

`nextCursor` is the compound string `` `${orderByValue}__${blogId}` `` — the last item's `orderBy` value (`createdAt`/`updatedAt`/`publishedAt`) plus its doc id as a stable tiebreaker. Pass it back as `?cursor=...`; the route decodes both halves into `startAfter(value, docId)`. `null` means end of stream. The `__${blogId}` suffix is load-bearing — without it, docs that share an `orderBy` value get skipped or duplicated across pages.

## Featured-blog model

A blog's "featured" status is a `featuredAt: number | null` timestamp in `blogSystemMetaSchema`, **not** a boolean. The post with the highest non-null `featuredAt` across published blogs wins. Featuring is exclusively an action (`featureBlog(blogId)` server action, or `GET /api/blogs/featured` for the portfolio side); the form does not bind any input to `featuredAt`. There is no `unfeatureBlog` — accept that "there's always a featured post" once anything has ever been featured.

`formDataToPublishedDB` preserves `featuredAt` from the existing published doc on republish (parallel to how `publishedAt` is preserved). Editing content does not bump or clear the timestamp.

Firestore composite index on `(status, featuredAt desc)` is required for the featured endpoint; lives in [apps/admin/firestore.indexes.json](apps/admin/firestore.indexes.json) alongside `(status, createdAt desc)` (portfolio list + default Manage-Posts view) and the `kind`/`schemaType` filter combinations the Manage-Posts UI can produce. **Any new equality filter or `orderBy` option on `/api/blogs` needs its own composite index there**, then `firebase deploy --only firestore:indexes` — otherwise the query 500s with `FAILED_PRECONDITION` (the index can be created via JSON + CLI; no console UI needed).

## Blog content storage

`PublishedBlogDB.content` and `BlogDraftDB.content` are stored as `JSON.stringify(DocContent)` (string) in Firestore. The form-data type uses raw `DocContent` (object). [blogUtils.ts](apps/admin/src/lib/blogUtils.ts) handles `JSON.parse` / `JSON.stringify` at the boundary. Portfolio's [posts.ts](apps/portfolio/src/lib/posts.ts) `JSON.parse`s `blog.content` into `Post.body: DocContent` for `<DocRenderer>`.

## Wire types vs view types

- **Wire types** (`@tabsircg/schemas/blog`): the shapes that travel between admin and portfolio. Source of truth.
- **View types** in [apps/portfolio/src/lib/posts.ts](apps/portfolio/src/lib/posts.ts): `Post`, `PostMeta`, `Neighbour`. These are presentation concerns — `date` is an ISO string (not ms), `excerpt` falls back to `dek`, `prev`/`next` are computed neighbours. Do **not** put view types in the shared package.

## Portfolio data fetching pattern

[apps/portfolio/src/lib/posts.ts](apps/portfolio/src/lib/posts.ts) exposes three list-shaped functions:

- `getFeaturedBlog()` — single Firestore read via `/api/blogs/featured`. Used by the `/blog` index featured slot.
- `getRecentBlogs(limit, cursor?)` — one page. Used by the index regular list.
- `getAllBlogs()` — paginates internally up to a 50-page safety cap. Used by sitemap and `getPost`'s prev/next.

`getPost(slug)` calls `getAllBlogs()` to compute neighbours, which is fine up to ~100 published blogs. Above that, swap in a "navigation index" doc (just `{slug, title, publishedAt}` for all published) before tackling load-more UX, otherwise `/blog/:slug` page renders blow up linearly.

## Design system (premium-ds) — read before writing any UI

**Never hand-roll a control that premium-ds ships.** No raw `<button>`, `<input>`,
`<select>`, `<textarea>`, or a `<div>` skinned to look like one. Check the
`exports` map in `node_modules/premium-ds/package.json` first — it currently
ships button, text-field, number-field, otp-field, textarea, checkbox, toggle,
radio-group, select, multi-select, the date/time fields, table, pagination,
tabs, popover, sheet, dialog, tooltip, alert, toast, badge/tag/avatar families,
collapse.

Known debt: ~17 files still use raw `<button>` (Sidebar, MetricsBar, BotPanel,
GoalsTab, JourneyTimeline, the write-post and portfolio modals, …). That is
pre-existing, not a licence to add more. Convert opportunistically.

**Where it's installed from.** premium-ds is a *registry* dependency pinned to
`^0.8.0` (`b5433e5`, which also deleted the root `.pnpmfile.mjs`). It is **no
longer** a workspace link to `/home/tabsir/ap/reactp/premium-ds` — editing that
sibling repo now does nothing for admin. To change DS behaviour: edit the
sibling, build, publish, bump `apps/admin/package.json`, reinstall.

The published tarball ships **both `dist/` and `src/`**, and
`withPremiumDS(nextConfig)` in `next.config.ts` aliases every export subpath to
the `source` condition — so Turbopack compiles premium-ds from
`node_modules/premium-ds/src/**/*.tsx`. That copy is the source of truth for
what the app actually runs; read it (or the `.d.ts` in `dist/`) when checking
an API, **not** the sibling checkout, which can be ahead of the release.

**API traps that cost real time (read the `.d.ts`, the props are not guessable):**

- `Button` takes `iconLeft` / `iconRight`. Putting an icon inside `children`
  breaks `.btn`'s flex layout and the button renders visibly wrong.
- `Button` does **not** forward a top-level `aria-label`. Accessible names and
  any other DOM attribute go through `htmlProps={{ "aria-label": … }}`. Same
  pattern on most DS components.
- `Button` sizes: `sm` 28px, `md` 36px (default), `lg` 40px, `icon` = square at
  `--control-height-sm`.
- `Select` has **no visible-label prop** — only `ariaLabel`. When a Select needs
  a visible label next to a `TextField`, use the project's `field-label`
  utility in `globals.css` so the two line up. `TextField` *does* have `label`.
- `Select`'s trigger hardcodes `variant="ghost"`; restyle it via
  `triggerProps={{ variant, fullWidth, className }}`, not on `Select` itself.

**Overriding DS styles needs `!`.** premium-ds's stylesheet is imported before
Tailwind in `globals.css`, so its rules win the cascade at equal specificity —
e.g. `.btn { justify-content: center }` beats a bare `justify-between` utility.
Use the `!` suffix (`justify-between!`, `px-2!`, `text-primary!`). This is the
house pattern, not a hack.

**`TabPanel` no longer remounts its children** (premium-ds `222eee4`, shipped in
0.8.0). It replaced a keyed `motion.div` with an imperative entrance so panels
keep their content state. Consequence: **a tab's entry animation must be owned
by the tab's own component** — anything that relied on the remount silently
stopped animating. See `funnel-reveal` in `globals.css` / `FunnelRiver` for the
pattern (a `clip-path` reveal on the component's own root).

Any project-owned `@utility` must be added to the `tailwindcss.whitelist` in
`apps/admin/eslint.config.mjs` or the linter flags it as an unknown class.

## Conventions and gotchas

- Admin's `tsconfig.json` has `exactOptionalPropertyTypes: true`. **Don't** pass `undefined` for optional props — use the spread-only-when-defined pattern: `{...(x ? { prop: ... } : {})}`. Portfolio doesn't have this flag.
- Admin's schemas previously had a per-app `pnpm-workspace.yaml` with `allowBuilds: sharp: true`. That moved to root `pnpm-workspace.yaml` during the migration. Per-app workspace files were deleted.
- `pnpm-lock.yaml` lives at the workspace root only. There is no per-app lockfile.
- `@open-notion/editor` is a `peerDependency` of `@tabsircg/schemas` (only the `DocContent` type is referenced). Both apps have it as a direct dep.
- Each app has its own `.env` (env files are NOT loaded from workspace root by Next). Shared values like `SERVER_TOKEN` are duplicated in both `.env` files.
- The `serverToken` header is portfolio's auth to admin's API. It **is** enforced — in [apps/admin/src/proxy.ts](apps/admin/src/proxy.ts), not per-route — and scoped to the public, portfolio-facing endpoints only (`/api/blogs*`, `/api/config*`, `/api/site-config`, `GET /api/page-data`). It deliberately does **not** reach the analytics dashboard, content writes (`POST /api/page-data`), or the upload presigner — those need the admin JWT cookie. (Earlier notes here and in the README said "not enforced"; that was wrong — see `serverTokenAllowed` in the proxy.)
- Admin pushes fresh content to the portfolio by POSTing tags to its `/api/revalidate` (`sendRevalidateRequest` in [blogUtils.ts](apps/admin/src/lib/blogUtils.ts)). Tags the portfolio actually listens on: `blogs` + `blog:${slug}` (blog mutations, via `revalidateBlog`), `page-data` (portfolio editor save), `site-config` (`updateSiteConfig`), `blog-config` (`addConfigValue`). Add a portfolio-visible config write and you must emit its tag, or the public site stays stale until a redeploy.
- Route handlers return errors through `wrapRoute`: `ZodError` → 400, `throw new HttpError(status, msg)` → that status (e.g. 404 for a missing slug), anything else → a generic 500 (`"Internal server error"`) with the real cause logged server-side only. Don't `throw new Error("Not found")` expecting a 404 — use `HttpError`.

## Schema migration policy

Adding a new optional field with a Zod `.default(...)` is non-breaking for existing Firestore docs: Zod fills the default on read. No migration needed unless you want existing docs _backfilled_ with a meaningful value.

Active backfills go in [apps/admin/src/scripts/migrateBlogSchema.ts](apps/admin/src/scripts/migrateBlogSchema.ts). Run with `dryRun: true` first.

## Open work / future concerns

- **Load-more UX on `/blog`** — server side supports cursor pagination; the index page only renders the first 30. UI pagination not yet wired.
- **Prev/next at scale** — see "Portfolio data fetching pattern" above. ~100 blog ceiling.
- **No `unfeatureBlog`** — by design; revisit only if you actually need a "no featured post" state.
- **`serverToken` residual exposure** — now scoped to public reads at the proxy (`serverTokenAllowed`), but a token holder can still read draft/unpublished blog _metadata_ via `/api/blogs?status=draft` (the portfolio only ever sends `status=published`). Low risk while the token stays server-only; if admin ever gets a public hostname, force `status=published` for token callers. The token is also a single static shared secret with no rotation.
- **Analytics ingest has no rate limiting** — ingest is the Cloudflare Worker at `analytics.tabsircg.com`, reachable unauthenticated by anyone who knows a registered `websiteId` and sends a matching `Origin`. Admin no longer proxies ingest at all (the dead `/api/event` grant was removed from `serverTokenAllowed`). A determined caller can still inflate counters. Unknown `websiteId`s are now negatively cached for 10s per isolate, so they cost one KV read per 10s rather than one per request — but that is cost control, not rate limiting. Add real rate limiting if it becomes a problem.

## Where to keep persistent context for a fresh session

This file (commit it). Plus the per-project memory directory at `~/.claude/projects/-home-tabsir-ap-reactp-personal/memory/` — Claude can write `user`, `feedback`, `project`, `reference` memories there that auto-load via `MEMORY.md` index. The memory store is for things that should follow you across machines/sessions but don't belong in the repo (preferences, in-progress state). This `CLAUDE.md` is for things that should follow the _code_ (architecture, conventions, gotchas).
