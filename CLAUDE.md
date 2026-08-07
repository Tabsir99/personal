# Project context for Claude

Loaded automatically at the start of every session. Durable decisions and gotchas that aren't obvious from reading the code. Update it when something changes that would surprise a future you.

## Important

Stage and commit after every meaningful change — not once per feature, not once per line. Follow global commit rules.

## Comments — write none

**Do not write comments.** Not `//`, not `/* */`, not JSDoc, not section banners, not "just this one because it's subtle." Express it in the code: name the variable, extract a named function, name the constant. The urge to explain in prose is a signal the code needs a better name or a smaller function — act on that instead.

Banned outright:

- Anything referencing a change, diff, or history: `// switched to X`, `// fixed the bug where…`, `// previously…`. A comment about what the code no longer does is the worst kind.
- JSDoc on exported functions and types. The signature is the documentation.
- Restating what a line does, labelling a section, annotating an obvious guard.

A comment is allowed only when the information genuinely cannot live in code **and** its absence would cause a wrong change later — a measured benchmark number, an external API quirk with no local evidence. That bar is high and is almost never met. The target is zero, not "a few good ones." Everything else goes in this file, a repo `.md`, or the commit message.

Before reporting any work done, grep the changed files for comment markers and delete what you find.

## Layout

```
/personal/
├── apps/
│   ├── admin/             Next.js 16 admin/CMS for the blog + portfolio data. Port 5000.
│   ├── portfolio/         Next.js 16 public site consuming admin's REST API. Port 3001.
│   └── analytics-worker/  CF Worker at analytics.tabsircg.com — ingest + the Tinybird .datasource DDL.
└── packages/
    ├── schemas/       @tabsircg/schemas — shared Zod schemas + ApiResponse/CursorPage, plus
    │                  `@tabsircg/schemas/analytics` (the analytics_events column contract,
    │                  shared by the worker's ingest, admin's Stripe webhook, and admin's `F`).
    ├── analytics/     @tabsircg/analytics — browser tracker SDK + crawler middleware. Published to npm.
    └── analytics-mcp/ @tabsircg/analytics-mcp — MCP server over the analytics contract.
```

The separate `@tabsircg/analytics-contract` package was folded into `@tabsircg/schemas/analytics` and deleted. One shared package, not two.

Single git repo, pnpm workspace. History was merged from two repos via `git filter-repo --to-subdirectory-filter`, so `git log --follow apps/admin/src/...` walks back into pre-monorepo commits. Pre-merge originals are at `/home/tabsir/ap/reactp/personal.old/` — safe to delete.

## Workspace + dev story (easy to mis-design)

`@tabsircg/schemas` exports its TypeScript source directly via the `exports` map — no build step, no `dist`, no `"development"` condition. Both apps set `transpilePackages: ["@tabsircg/schemas"]`, so Turbopack reads the `.ts` files inline and watches them for HMR. A schema edit propagates to both apps with no rebuild.

This only works because the package is internal-only. Publishing it would need a real build plus dual `"development"` / `"production"` exports conditions. Don't add a build step "just in case."

Commands from the workspace root: `pnpm tc`, `pnpm dev`, `pnpm dev:admin`, `pnpm dev:portfolio`, `pnpm build`.

## Wire contracts (admin → portfolio)

Every admin REST response is wrapped by `wrapRoute` ([appUtils.ts](apps/admin/src/lib/appUtils.ts)):

```ts
type ApiResponse<T> =
  | { status: "success"; data: T }
  | { status: "error"; message: string };
```

200 uses the success branch; 400 (Zod) and 500 use the error branch. Portfolio's `fetchJson` unwraps it.

Paginated endpoints (just `/api/blogs`) wrap `data` in `CursorPage<T>`: `{ items: T[], nextCursor: string | null }`.

`nextCursor` is `` `${orderByValue}__${blogId}` `` — the last item's `orderBy` value plus its doc id as a tiebreaker. Pass it back as `?cursor=...`; the route decodes both halves into `startAfter(value, docId)`. `null` means end of stream. The `__${blogId}` suffix is load-bearing — without it, docs sharing an `orderBy` value get skipped or duplicated across pages.

## Featured-blog model

"Featured" is a `featuredAt: number | null` timestamp in `blogSystemMetaSchema`, **not** a boolean. The published post with the highest non-null `featuredAt` wins. Featuring is exclusively an action (`featureBlog(blogId)`, or `GET /api/blogs/featured` for portfolio); the form binds no input to `featuredAt`. There is no `unfeatureBlog` — accept that "there's always a featured post" once anything has been featured.

`formDataToPublishedDB` preserves `featuredAt` on republish (parallel to `publishedAt`). Editing content does not bump or clear it.

Firestore composite index on `(status, featuredAt desc)` is required; it lives in [firestore.indexes.json](apps/admin/firestore.indexes.json) alongside `(status, createdAt desc)` and the `kind`/`schemaType` filter combinations Manage-Posts can produce. **Any new equality filter or `orderBy` on `/api/blogs` needs its own composite index there**, then `firebase deploy --only firestore:indexes` — otherwise the query 500s with `FAILED_PRECONDITION`.

## Blog content storage

`PublishedBlogDB.content` and `BlogDraftDB.content` are stored as `JSON.stringify(DocContent)` strings in Firestore. The form-data type uses raw `DocContent`. [blogUtils.ts](apps/admin/src/lib/blogUtils.ts) handles the parse/stringify at the boundary; portfolio's [posts.ts](apps/portfolio/src/lib/posts.ts) parses it into `Post.body` for `<DocRenderer>`.

## Wire types vs view types

- **Wire types** (`@tabsircg/schemas/blog`): the shapes that travel between admin and portfolio. Source of truth.
- **View types** in [posts.ts](apps/portfolio/src/lib/posts.ts): `Post`, `PostMeta`, `Neighbour`. Presentation concerns — `date` is an ISO string (not ms), `excerpt` falls back to `dek`. Do **not** put view types in the shared package.

## Portfolio data fetching

[posts.ts](apps/portfolio/src/lib/posts.ts):

- `getFeaturedBlog()` — one read via `/api/blogs/featured`, for the `/blog` index featured slot.
- `getRecentBlogs(limit, cursor?)` — one page, for the index list.
- `getBlogNav()` — the `/api/blogs/nav` index (`{slug, title, publishedAt}` for all published), used where a full list is needed.
- `getPost(slug)` — the post plus its `prev`/`next`, both computed server-side by `/api/blogs/[slug]`.

Neighbours are no longer computed by paginating every blog on the portfolio side, so `/blog/:slug` renders don't scale with post count.

## Design system (premium-ds) — read before writing any UI

**Never hand-roll a control that premium-ds ships.** No raw `<button>`, `<input>`, `<select>`, `<textarea>`, or a `<div>` skinned to look like one. Check the `exports` map in `node_modules/premium-ds/package.json` first — it ships button, text-field, number-field, otp-field, textarea, checkbox, toggle, radio-group, select, multi-select, the date/time fields, table, pagination, tabs, popover, sheet, dialog, tooltip, alert, toast, badge/tag/avatar families, collapse.

Known debt: ~17 files still use raw `<button>` (Sidebar, MetricsBar, BotPanel, GoalsTab, JourneyTimeline, the write-post and portfolio modals, …). Pre-existing, not a licence to add more. Convert opportunistically.

**Where it's installed from.** premium-ds is a *registry* dependency pinned to `^0.8.0` (`b5433e5`, which also deleted the root `.pnpmfile.mjs`). It is **no longer** a workspace link to `/home/tabsir/ap/reactp/premium-ds` — editing that sibling does nothing for admin. To change DS behaviour: edit the sibling, build, publish, bump `apps/admin/package.json`, reinstall.

The published tarball ships **both `dist/` and `src/`**, and `withPremiumDS(nextConfig)` aliases every export subpath to the `source` condition — so Turbopack compiles premium-ds from `node_modules/premium-ds/src/**/*.tsx`. That copy is what the app runs; read it (or the `.d.ts` in `dist/`) when checking an API, **not** the sibling checkout, which can be ahead of the release.

**API traps that cost real time** (read the `.d.ts` — these are not guessable):

- `Button` takes `iconLeft` / `iconRight`. An icon inside `children` breaks `.btn`'s flex layout and renders visibly wrong.
- `Button` does **not** forward a top-level `aria-label`. Accessible names and any other DOM attribute go through `htmlProps={{ "aria-label": … }}`. Same pattern on most DS components.
- `Button` sizes: `sm` 28px, `md` 36px (default), `lg` 40px, `icon` = square at `--control-height-sm`.
- `Select` has **no visible-label prop** — only `ariaLabel`. For a visible label next to a `TextField`, use the `field-label` utility in `globals.css`. `TextField` *does* have `label`.
- `Select`'s trigger hardcodes `variant="ghost"`; restyle via `triggerProps={{ variant, fullWidth, className }}`, not on `Select` itself.

**Overriding DS styles needs `!`.** premium-ds's stylesheet is imported before Tailwind in `globals.css`, so its rules win at equal specificity — e.g. `.btn { justify-content: center }` beats a bare `justify-between` utility. Use the `!` suffix (`justify-between!`, `px-2!`). House pattern, not a hack.

**`TabPanel` no longer remounts its children** (premium-ds `222eee4`, in 0.8.0) — it replaced a keyed `motion.div` with an imperative entrance so panels keep content state. Consequence: **a tab's entry animation must be owned by the tab's own component**; anything relying on the remount silently stopped animating. See `funnel-reveal` in `globals.css` / `FunnelRiver` for the pattern.

Any project-owned `@utility` must be added to `tailwindcss.whitelist` in `apps/admin/eslint.config.mjs` or the linter flags it.

## Conventions and gotchas

- Admin's `tsconfig.json` has `exactOptionalPropertyTypes: true`. **Don't** pass `undefined` for optional props — use `{...(x ? { prop: ... } : {})}`. Portfolio doesn't have this flag.
- `pnpm-lock.yaml` lives at the workspace root only. `allowBuilds: sharp: true` moved to the root `pnpm-workspace.yaml`; per-app workspace files were deleted.
- `@open-notion/editor` is a `peerDependency` of `@tabsircg/schemas` (only `DocContent` is referenced). Both apps have it as a direct dep.
- Each app has its own `.env` — Next does not load env files from the workspace root. Shared values like `SERVER_TOKEN` are duplicated.
- The `serverToken` header is portfolio's auth to admin's API. It **is** enforced — in [proxy.ts](apps/admin/src/proxy.ts), not per-route — and scoped to public, portfolio-facing endpoints only (`/api/blogs*`, `/api/config*`, `/api/site-config`, `GET /api/page-data`). It deliberately does **not** reach the analytics dashboard, content writes, or the upload presigner, which need the admin JWT cookie.
- Admin pushes fresh content by POSTing tags to portfolio's `/api/revalidate` (`sendRevalidateRequest` in [blogUtils.ts](apps/admin/src/lib/blogUtils.ts)). Tags portfolio listens on: `blogs` + `blog:${slug}` (via `revalidateBlog`), `page-data`, `site-config`, `blog-config`. Add a portfolio-visible config write and you must emit its tag, or the public site stays stale until a redeploy.
- Route handlers return errors through `wrapRoute`: `ZodError` → 400, `throw new HttpError(status, msg)` → that status, anything else → a generic 500 with the real cause logged server-side. Don't `throw new Error("Not found")` expecting a 404 — use `HttpError`.

## Agent access (MCP)

Admin exposes an MCP server at `POST /api/mcp` ([route.ts](apps/admin/src/app/api/mcp/route.ts), 22 lines) so Claude and other agents get admin-privileged reads and writes. Implementation lives in [src/mcp/](apps/admin/src/mcp/).

**It does not go through the REST routes.** Tools import `src/lib/*` and `src/actions/*` and call them in-process — the same functions the routes call. So a route's params or response shape can change freely without touching MCP, and a change *inside* `lib`/`actions` reaches both callers at once. A signature change breaks `pnpm tc` on the MCP file, which is the intended sync mechanism. Never add a parallel `/api/agent/*` REST surface for this; there'd be a second copy of every schema and nothing to catch drift.

Auth is a bearer token (`MCP_TOKEN`), checked in [proxy.ts](apps/admin/src/proxy.ts) in a branch of its own — deliberately **not** `SERVER_TOKEN`, and portfolio's `serverToken` is rejected on `/api/mcp`. Covered by [proxyAuth.test.ts](apps/admin/src/test/mcp/proxyAuth.test.ts).

⚠️ `BYPASS_AUTH=1` short-circuits proxy.ts *before* the MCP branch, leaving `/api/mcp` fully open. That's fine for local dev, fatal if it ever reaches a public host.

`analytics_query` runs caller-supplied SQL against Tinybird behind [sql.ts](apps/admin/src/mcp/sql.ts): SELECT/WITH only, single statement, forced LIMIT, keyword denylist. It strips comments *and* string literals before scanning, so `WHERE event_name = 'delete'` passes while `SELECT 1; DROP …` does not. Both directions are tested — keep it that way if you touch the guard.

Deletes are registered only when `MCP_ALLOW_DELETES=1`. Everything mutating carries MCP `annotations` (`destructiveHint`, `openWorldHint`) that drive the client's permission prompt.

Resources are **generated, not hand-written**: the analytics schema comes from `@tabsircg/schemas/analytics`, the Firestore doc from `Collections`, the site list from Firestore at request time. Adding a column or collection needs no MCP edit.

Both MCP packages are on the v2 SDK (`@modelcontextprotocol/server@^2.0.0`), which replaced the monolithic `@modelcontextprotocol/sdk@1.x`. v2 requires zod v4 and takes `inputSchema` as a `z.object(...)` — the bare `{ field: z.string() }` raw-shape form is deprecated. `createMcpHandler` returns a Web-standard `fetch(Request) → Response`, so no Next adapter is needed.

## Schema migration policy

Adding an optional field with a Zod `.default(...)` is non-breaking for existing Firestore docs — Zod fills the default on read. No migration needed unless you want existing docs *backfilled* with a meaningful value.

Active backfills go in [migrateBlogSchema.ts](apps/admin/src/scripts/migrateBlogSchema.ts). Run with `dryRun: true` first.

## Open work / future concerns

- **Load-more UX on `/blog`** — the server supports cursor pagination; the index only renders the first 30. UI not wired.
- **No `unfeatureBlog`** — by design; revisit only if you need a "no featured post" state.
- **`serverToken` residual exposure** — scoped to public reads at the proxy, but a token holder can still read draft blog *metadata* via `/api/blogs?status=draft` (portfolio only ever sends `status=published`). Low risk while the token stays server-only; if admin ever gets a public hostname, force `status=published` for token callers. It is also a single static shared secret with no rotation.
- **Analytics ingest has no rate limiting** — the Worker is reachable unauthenticated by anyone who knows a registered `websiteId` and sends a matching `Origin`. A determined caller can inflate counters. Unknown `websiteId`s are negatively cached for 10s per isolate, which is cost control, not rate limiting.
- **Crawler ingest is token-gated, browser ingest is not.** The middleware supplies `bot.ip` / `bot.userAgent` in the body (read from the proxy's forwarding headers on the crawler's own request) rather than the Worker deriving them from `CF-Connecting-IP`, so crawl payloads must send `X-Ingest-Token` matching the Worker's `INGEST_TOKEN` secret. Browser events stay `Origin`-only because a secret shipped in `cgd.js` is public. Deploy order matters: set the secret before the middleware ships, or every crawl event 403s.
- **`CRAWLER_CATEGORIES` is duplicated.** `packages/analytics/src/middleware/signatures.ts` and `BOT_CATEGORY_NAMES` in `packages/schemas/src/analytics.ts` are identical but linked by nothing; drift means the Worker 400s valid crawler events. `@tabsircg/schemas` is already a devDependency of `packages/analytics`, so a type-only `satisfies readonly BotCategory[]` would catch it at build time without adding a runtime dep to the browser SDK.

## Persistent context for a fresh session

This file (commit it), plus the per-project memory directory at `~/.claude/projects/-home-tabsir-ap-reactp-personal/memory/`, which auto-loads via `MEMORY.md`. Memory is for things that follow *you* across machines and sessions (preferences, in-progress state); this file is for things that follow the *code* (architecture, conventions, gotchas).
