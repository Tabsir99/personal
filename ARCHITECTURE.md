# Architecture

How the two apps wire together. README has the overview and the run instructions. This is the deep-dive.

---

## System map

```
                ┌─────────────────────────────────────────────┐
                │              Cloudflare R2                  │
                │      (presigned uploads, public CDN)        │
                └──────────────▲──────────────────────────────┘
                               │ PUT (signed)
                               │
   ┌─────────────────┐    REST (force-cache, tagged)    ┌─────────────────┐
   │                 │ ◄──────────────────────────────  │                 │
   │  apps/portfolio │                                  │   apps/admin    │
   │   public site   │  ─────────────────────────────►  │     CMS         │
   │   Next 16 :3001 │  POST /api/revalidate (tags)     │  Next 16 :5000  │
   │                 │                                  │                 │
   └────────┬────────┘                                  └────────┬────────┘
            │                                                    │
            │  /api/score (proxy)                                │
            └────────────────────────────────────────────────────┤
                                                                 │
                                                                 ▼
                                                        ┌─────────────────┐
                                                        │    Firestore    │
                                                        │ blogs, config,  │
                                                        │ analytics, …    │
                                                        └─────────────────┘
```

Admin owns Firestore and R2. Nothing else writes to them. Portfolio reads admin's REST API and serves the result through Next's data cache. Cache invalidation is push-based. Admin POSTs tag names to portfolio's `/api/revalidate` after every mutation.

---

## How they talk

### The envelope

Every admin REST handler is wrapped in [`wrapRoute`](apps/admin/src/lib/appUtils.ts). Every server action is wrapped in [`wrap`](apps/admin/src/lib/appUtils.ts). Both produce the same shape, defined in [`packages/schemas/src/api.ts`](packages/schemas/src/api.ts):

```ts
type ApiResponse<T> =
  | { status: "success"; data: T }
  | { status: "error"; message: string };
```

`ZodError` → 400, anything else → 500, success → 200. Portfolio's [`fetchJson`](apps/portfolio/src/lib/posts.ts) and [`getPageData`](apps/portfolio/src/lib/pageData.ts) unwrap it back to `T | null`.

Paginated lists wrap `data` one more time:

```ts
interface CursorPage<T> { items: T[]; nextCursor: string | null }
```

The cursor is `` `${lastItem[orderBy]}__${lastItem.blogId}` ``. The trailing `__blogId` is the stable tiebreaker. Without it, docs that share an `orderBy` value either skip or duplicate across pages. See [`readNDocs`](apps/admin/src/lib/commonQuery.ts).

### Auth

Two callers, two mechanisms, both checked in [`apps/admin/src/proxy.ts`](apps/admin/src/proxy.ts) (Next 16's renamed `middleware.ts`):

| Caller | Mechanism | Unlocks |
|---|---|---|
| Browser session (admin) | `t` HTTP-only cookie holding a `jose` JWT | `/dashboard/*` pages and server actions |
| Portfolio server → admin | `serverToken` header | `/api/*` only, not dashboard pages or actions |

The JWT is minted in [`logInAction`](apps/admin/src/actions/authActions.ts) against `ADMIN_USERNAME` / `ADMIN_PASSWORD` and verified against `JWT_SECRET`. There's no user table. Single tenant.

`serverToken` is checked at the proxy. Route handlers don't re-check it, so don't write code that assumes they will.

### The public API surface

| Endpoint | Source | Used by |
|---|---|---|
| `GET /api/blogs?status,kind,tag,cursor,limit,orderBy` | [`blogs/route.ts`](apps/admin/src/app/api/blogs/route.ts) | `getRecentBlogs`, `getAllBlogs` |
| `GET /api/blogs/featured` | [`featured/route.ts`](apps/admin/src/app/api/blogs/featured/route.ts) | `getFeaturedBlog` |
| `GET /api/blogs/[slug]` | [`[slug]/route.ts`](apps/admin/src/app/api/blogs/[slug]/route.ts) | `getPost` |
| `GET/POST /api/blogs/[slug]/score` | [`score/route.ts`](apps/admin/src/app/api/blogs/[slug]/score/route.ts) | `FeltMeter` via `/api/score` proxy |
| `GET /api/site-config` | [`site-config/route.ts`](apps/admin/src/app/api/site-config/route.ts) | `getSiteConfig` |
| `GET /api/config` | [`config/route.ts`](apps/admin/src/app/api/config/route.ts) | `getBlogTags` |
| `GET/POST /api/page-data` | [`page-data/route.ts`](apps/admin/src/app/api/page-data/route.ts) | `getPageData`; admin write |
| `POST /api/page-data/upload-urls` | [`upload-urls/route.ts`](apps/admin/src/app/api/page-data/upload-urls/route.ts) | Portfolio editor uploads |
| `POST /api/event` | [`event/route.ts`](apps/admin/src/app/api/event/route.ts) | Analytics ingest (no caller wired yet) |
| `GET /api/dashboard/{stats,geo,pages,sources}` | [`dashboard/*`](apps/admin/src/app/api/dashboard) | Admin-only SWR widgets |

`score` is the one public-caller mutation. It goes through portfolio's [`/api/score`](apps/portfolio/src/app/api/score/route.ts) so the `felt-id` cookie stays same-origin.

---

## Write → revalidate

Every mutation in admin takes the same path:

```
client UI
  └─► server action (apps/admin/src/actions/blogActions.ts)
        └─► Firestore Admin SDK (apps/admin/src/lib/commonQuery.ts)
              └─► sendRevalidateRequest({ tags }) (apps/admin/src/lib/blogUtils.ts)
                    └─► POST apps/portfolio/src/app/api/revalidate/route.ts
                          └─► revalidateTag(tag, { expire: 0 })
```

[`revalidateBlog(slug)`](apps/admin/src/lib/blogUtils.ts) busts both `blogs` (every list that surfaces the post: home, index, featured, sitemap) and `blog:${slug}` (just the post page). [Page-data writes](apps/admin/src/app/api/page-data/route.ts) bust `page-data`. Portfolio's fetches are tagged accordingly in [`posts.ts`](apps/portfolio/src/lib/posts.ts) and [`pageData.ts`](apps/portfolio/src/lib/pageData.ts).

`{ expire: 0 }` purges immediately. Without it, Next serves stale once.

Portfolio's revalidate route checks `acs_tkn` against `SERVER_TOKEN` before touching the cache. That's the one place in portfolio that needs the shared secret beyond outbound requests.

---

## Rendering

Next 16 App Router. Cache Components is not opted in. Per-route picks:

### Portfolio (mostly static)

| Route | Strategy | Why |
|---|---|---|
| `/` ([page.tsx](apps/portfolio/src/app/page.tsx)) | ISR: async RSC + `fetch(..., { cache: "force-cache", next: { tags: ["page-data", "blogs"] }})` | Renders once, re-renders only when admin pushes those tags |
| `/blog` ([page.tsx](apps/portfolio/src/app/blog/page.tsx)) | ISR (same pattern), pulls featured + first 30 + site config + tags in parallel | `tag` query string filters in memory, no extra fetch |
| `/blog/[slug]` ([page.tsx](apps/portfolio/src/app/blog/[slug]/page.tsx)) | SSG at build + ISR after: [`generateStaticParams`](apps/portfolio/src/app/blog/[slug]/page.tsx) pre-renders every published slug; runtime fetches use `force-cache` tagged with `blog:${slug}` | All known slugs are prerendered; new ones render on first hit and get cached |
| `/privacy`, `/terms`, `/refund-policy` ([(legal)/](apps/portfolio/src/app/(legal))) | Pure static | Content is in the source file, no fetches |
| `sitemap.xml` ([sitemap.ts](apps/portfolio/src/app/sitemap.ts)) | Hybrid: `export const revalidate = 86400` daily backstop, plus tag invalidation through shared `blogs`/`page-data` tags | Daily floor with instant invalidation on top |
| `robots.txt` ([robots.ts](apps/portfolio/src/app/robots.ts)) | Pure static | Constant |
| `/api/revalidate` ([route.ts](apps/portfolio/src/app/api/revalidate/route.ts)) | Dynamic | Triggers `revalidateTag` / `revalidatePath` |
| `/api/score` ([route.ts](apps/portfolio/src/app/api/score/route.ts)) | Dynamic | Per-request cookie, uncached upstream call |

Two caches in play:

- **Data cache** (Next's fetch cache, keyed by URL + headers + tags) — set via `cache: "force-cache"`, busted by `revalidateTag`. Holds admin's JSON responses on portfolio's side.
- **Full-route cache** (the rendered RSC output). For a page whose only async work is tagged fetches, the route stays cached as long as the underlying fetches do. Tag invalidation re-runs the page on the next request.

[`React.cache()`](https://react.dev/reference/react/cache) wraps `getPost`, `getAllBlogs`, and `getPageData` to dedupe within a single request (e.g. `generateMetadata` + page render, or home + footer both calling `getPageData`).

### Admin (mostly dynamic)

| Route | Strategy | Why |
|---|---|---|
| `/` ([page.tsx](apps/admin/src/app/page.tsx)) | Client component (login form) | Submits a server action |
| `/dashboard/*` | Dynamic by default (server actions + cookies) | Auth-gated, never cached |
| `/dashboard/blog-site` ([page.tsx](apps/admin/src/app/dashboard/blog-site/page.tsx)) | `export const dynamic = "force-dynamic"`, explicit | Reads live config; preempts inference |
| `/api/*` | Dynamic — every handler hits Firestore via the Admin SDK, which Next treats as dynamic | No caching on the admin side |
| Dashboard widgets ([useDashboardData.ts](apps/admin/src/hooks/useDashboardData.ts)) | Client + SWR keyed on `/api/dashboard/*` | `revalidateOnFocus: false`, `keepPreviousData: true` |

Admin never sets `force-cache`. Every Firestore read is live.

---

## Read path

Cold render of `/blog/some-slug`:

1. Next looks up the rendered route. Miss (first request).
2. `PostPage` calls `getPost(slug)` ([posts.ts](apps/portfolio/src/lib/posts.ts)). `React.cache` memoizes within the request.
3. `getPost` runs two `fetchJson` calls in parallel: the post itself, plus `getAllBlogs()` for prev/next.
4. Each `fetchJson` checks the data cache. Cold, so it hits admin with `serverToken` and force-caches the response tagged `["blogs", "blog:slug"]` (and `["blogs"]` for the list).
5. Admin's `wrapRoute` runs the handler against Firestore and returns `{ status: "success", data: PublishedBlogDB }`.
6. Portfolio unwraps to `PublishedBlogDB`, maps it to a `PostMeta` view shape, computes `prev`/`next` from the sorted full list.
7. Page renders. Route gets cached. Next request hits at step 1.
8. Admin publishes an edit → POSTs `["blogs", "blog:slug"]` to `/api/revalidate` → `revalidateTag` purges the data-cache entries → next visit re-runs the page.

---

## Write path

Publishing a draft:

1. The `PublishBlog` client component calls [`publishBlog(draftId)`](apps/admin/src/actions/blogActions.ts) via server action.
2. `wrap` catches throws and returns `ApiResponse`.
3. The action reads the draft, runs it through [`formDataToPublishedDB`](apps/admin/src/lib/blogUtils.ts) (which preserves `featuredAt`, `publishedAt`, and `stats` from any existing published doc), and overwrites the doc keyed by `parentBlogId || blogId` in the `blogs` collection.
4. Deletes the draft if it was a side-edit (had a `parentBlogId`).
5. Calls [`revalidateBlog(slug)`](apps/admin/src/lib/blogUtils.ts) → POSTs `["blogs", "blog:${slug}"]` to portfolio.
6. Portfolio purges. Next visitor sees the new post.

---

## Per-app layout

### `apps/admin/src/`

| Dir | Role |
|---|---|
| `app/` | Routes. `dashboard/*` is the CMS UI, `api/*` is the surface listed above plus `/api/event` ingest |
| `actions/` | `"use server"` mutations: blog, auth, config, AI, media. Anything that writes to Firestore or R2 goes through here, never directly from a client component |
| `lib/` | Server-only helpers: `appUtils` (`wrap`/`wrapRoute`), `blogUtils` (DB ↔ form conversion + revalidate trigger), `commonQuery` (Firestore CRUD primitives), `blogQuery`, `requireAuth`, `agentLog`, `finalizeAiDoc` |
| `config/` | `env.server`, `env.client`, `firebaseAdmin` (Firestore client + `Collections` enum), `cloudflareS3` (R2 client + presign helpers), `anthropic` (Claude Agent SDK wrapper for AI metadata + draft generation) |
| `hooks/` | Client SWR wrappers. `useCustomSWR` enforces the `ApiResponse` envelope |
| `stores/` | Zustand: `BlogEditorStore` (editor state), `SiteConfigStore`, `PortfolioStore`, `UIStore` (modals) |
| `components/` | Feature-bucketed: `blog-site/`, `write-post/`, `managePosts/`, `portfolio/`, `dashboard/`, `ui/` |
| `scripts/seed/` | Firestore seeders. Entry: `pnpm seed:firestore` |
| `scripts/migrate*` | One-off backfills. Always run with `dryRun: true` first |
| `proxy.ts` | Next 16 middleware. Gates `/`, `/api/*`, `/dashboard/*` by JWT cookie or `serverToken` header |

### `apps/portfolio/src/`

| Dir | Role |
|---|---|
| `app/page.tsx` | Home. Server component, fetches page data + 4 recent posts |
| `app/blog/page.tsx` | Index. Featured + first 30 + tag filter |
| `app/blog/[slug]/page.tsx` | Post page. `generateStaticParams` + `generateMetadata` |
| `app/(legal)/` | Privacy/terms/refund-policy. Static content, shared layout |
| `app/api/revalidate/route.ts` | Receives admin's tag/path invalidations |
| `app/api/score/route.ts` | Score read/write proxy. Injects the `felt-id` device cookie before forwarding |
| `app/sitemap.ts`, `robots.ts` | SEO files |
| `lib/posts.ts` | All blog reads: `getRecentBlogs`, `getFeaturedBlog`, `getPost`, `getAllBlogs`. Plus the `Post` / `PostMeta` / `Neighbour` view types |
| `lib/pageData.ts` | Portfolio content read (`getPageData`) |
| `config/env.ts` | `ADMIN_ORIGIN`, `SERVER_TOKEN`. The only two values portfolio needs |
| `components/Blog/*` | Blog-page and post components (`Toc`, `FeltMeter`, `Share`, `BlogPostJsonLd`, …) |
| `components/portfolio/*` | Home-page sections (`Hero`, `Atmosphere`, `Services`, `Work`, `Voices`, `Writing`, …) |
| `components/ui/*` | Shared primitives (`scroll-island`, `nav-link`, `H2`, …) |

### `packages/schemas/src/`

| File | Exports |
|---|---|
| `blog.ts` | `BlogStatus`, `PublishedBlogDB`, `BlogDraftDB`, `BlogFormData` plus zod schemas. Source of truth for the blog wire shape |
| `portfolio.ts` | `PageData`, `Project`, `Testimonial`, `Service`, `SkillGroup`, `Credential`, `Contact`, … |
| `site.ts` | `SiteConfig` (blog landing copy, "now reading", "currently building") |
| `dashboard.ts` | `AnalyticsEvent` discriminated union + per-day/source aggregate shapes |
| `api.ts` | `ApiResponse<T>`, `CursorPage<T>` |
| `ai.ts` | Loose AI-output schemas (`aiBlogMetadataSchema`, `aiBlogDraftSchema`) and a re-exported strict `DocContent` |
| `user.ts` | Single-user shape, mostly unused |
| `index.ts` | Barrel re-export (apps actually import from `@tabsircg/schemas/blog`, not the barrel) |

No build step. The `exports` map points at `.ts` source. Both apps `transpilePackages: ["@tabsircg/schemas"]`, so Turbopack reads source and HMR is instant.

---

## Cross-cutting flows

### Media uploads (portfolio editor)

```
client → POST /api/page-data/upload-urls (filename, size, type)
       ← { presignedUrl, key, path }[]
client → PUT <presignedUrl> file body  (direct to R2, public-read, max-age=31536000 immutable)
client → POST /api/page-data with the new pageData JSON (URLs embedded)
admin  → diffs old vs new URLs, calls deleteObjects(R2_PUBLIC, removedUrls)
admin  → writePortfolioPageData → sendRevalidateRequest({ tag: "page-data" })
```

The file goes browser → R2 directly. Only the resulting URL ever touches Firestore.

### AI authoring

[`generateBlogMetadata`](apps/admin/src/actions/aiActions.ts) and [`generateBlogDraft`](apps/admin/src/actions/aiActions.ts) call [`sendPrompt`](apps/admin/src/config/anthropic.ts), which streams the `@anthropic-ai/claude-agent-sdk` `query()`. The SDK is locked down: `WebSearch` and `WebFetch` only, no filesystem, no hooks, no MCP. Output is forced through a Zod schema (`outputFormat: { type: "json_schema", … }`), parsed, and saved as a normal draft.

### Analytics (half-wired)

`POST /api/event` ([route.ts](apps/admin/src/app/api/event/route.ts)) accepts the discriminated union from [`dashboard.ts`](packages/schemas/src/dashboard.ts) and fans out batched `FieldValue.increment` writes to `daily_stats`, `geo_stats`, `page_performance`, `traffic_sources`. The dashboard widgets read those via [`/api/dashboard/*`](apps/admin/src/app/api/dashboard) and aggregate over a configurable day window. Portfolio doesn't currently emit any events. The schema and endpoint are there, the client emitter isn't.

### Felt meter (per-device reactions)

Client sets a `felt-id` UUID cookie, debounces taps (600 ms), POSTs `{ slug, count }` to portfolio's `/api/score`. The proxy reads `felt-id` from the cookie and forwards it as `id` to admin. Admin runs a Firestore transaction against `blogs/{id}/felt/{deviceId}`, clamps per-device count at 50, and only credits the delta to `stats.score`.

---

## Stuff that isn't in the README

The big-ticket gotchas (content stored as a string, no-build trick, prev/next ceiling, featured-not-boolean) are in [README.md](README.md) and [CLAUDE.local.md](CLAUDE.local.md). Not duplicating them here.

What's only here:

- **Admin doesn't cache anything.** It never sets `force-cache`. Every Firestore read is live. Portfolio is the side that caches.
- **`revalidateTag` uses `{ expire: 0 }`.** The default behaviour serves stale once. `expire: 0` purges. Keep it that way unless you specifically want soft revalidation.
- **`startAfter(value, docId)` cursor.** The `__blogId` tail is a stable tiebreaker. If you change the cursor format, fix [`readNDocs`](apps/admin/src/lib/commonQuery.ts) too — it splits on `__` and coerces numeric prefixes back to numbers.
- **`serverToken` is enforced at the proxy, not per route.** Don't trust a handler to reject a missing token.
- **`/api/event` has no caller.** The endpoint and the aggregations exist. The portfolio-side emitter doesn't.
