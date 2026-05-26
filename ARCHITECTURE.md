# Architecture

How the two apps talk to each other, where state lives, and how the public site stays fast while admin stays fresh.

For the elevator pitch, the stack table, and `pnpm dev`, see [README.md](README.md). This document is the deep-dive.

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

- **Admin** owns Firestore and R2. Nothing else writes there.
- **Portfolio** reads admin's REST API and serves the result through Next's data cache.
- Cache invalidation is push-based: admin POSTs tag names to portfolio's `/api/revalidate` after every mutation.

---

## How the apps talk

### Request envelope

Every admin REST handler is wrapped in [`wrapRoute`](apps/admin/src/lib/appUtils.ts) and every server action in [`wrap`](apps/admin/src/lib/appUtils.ts). Both yield the same envelope, defined once in [`packages/schemas/src/api.ts`](packages/schemas/src/api.ts):

```ts
type ApiResponse<T> =
  | { status: "success"; data: T }
  | { status: "error"; message: string };
```

`ZodError` → 400, anything else → 500, success → 200. Portfolio's [`fetchJson`](apps/portfolio/src/lib/posts.ts) (and [`getPageData`](apps/portfolio/src/lib/pageData.ts)) unwrap it, returning `T | null`.

Paginated lists wrap `data` once more:

```ts
interface CursorPage<T> { items: T[]; nextCursor: string | null }
```

The cursor is `` `${lastItem[orderBy]}__${lastItem.blogId}` ``. The `__blogId` tail is the stable tiebreaker — without it, docs with equal `orderBy` values skip or duplicate across pages (see [`readNDocs`](apps/admin/src/lib/commonQuery.ts)).

### Authentication

Two distinct mechanisms, both enforced by [`apps/admin/src/proxy.ts`](apps/admin/src/proxy.ts) (Next 16's renamed `middleware.ts`):

| Caller | Mechanism | What it unlocks |
|---|---|---|
| Browser session (admin) | `t` HTTP-only cookie holding a `jose` JWT | `/dashboard/*` pages and server actions |
| Portfolio server → admin | `serverToken` header | `/api/*` only — explicitly not dashboard pages or actions |

The JWT is minted in [`logInAction`](apps/admin/src/actions/authActions.ts) against `ADMIN_USERNAME` / `ADMIN_PASSWORD` and verified against `JWT_SECRET`. There's no user table — this is single-tenant.

`serverToken` is enforced at the proxy boundary today. There's no per-route check yet, so don't rely on the route handler to gate it.

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
| `GET /api/dashboard/{stats,geo,pages,sources}` | [`dashboard/*`](apps/admin/src/app/api/dashboard) | Admin-only — SWR widgets |

Score is the only endpoint that mutates from a public caller, and it goes through portfolio's [`/api/score`](apps/portfolio/src/app/api/score/route.ts) so the `felt-id` cookie never leaks across origins.

---

## The write → revalidate loop

Every mutation in admin flows through the same shape:

```
client UI
  └─► server action (apps/admin/src/actions/blogActions.ts)
        └─► Firestore Admin SDK (apps/admin/src/lib/commonQuery.ts)
              └─► sendRevalidateRequest({ tags }) (apps/admin/src/lib/blogUtils.ts)
                    └─► POST apps/portfolio/src/app/api/revalidate/route.ts
                          └─► revalidateTag(tag, { expire: 0 })
```

[`revalidateBlog(slug)`](apps/admin/src/lib/blogUtils.ts) always invalidates both `blogs` (every list that surfaces the post: home, index, featured, sitemap) and `blog:${slug}` (just the post page). [Page-data writes](apps/admin/src/app/api/page-data/route.ts) send `page-data`. The portfolio routes are tagged accordingly in [`posts.ts`](apps/portfolio/src/lib/posts.ts) and [`pageData.ts`](apps/portfolio/src/lib/pageData.ts).

`{ expire: 0 }` purges immediately instead of serving stale once.

The portfolio route checks `acs_tkn` against `SERVER_TOKEN` before touching the cache — it's the one place in portfolio that needs the shared secret beyond outbound requests.

---

## Rendering strategies

Next 16 App Router, no opt-in to Cache Components. Per-route picks:

### Portfolio — public, mostly static

| Route | Strategy | Why |
|---|---|---|
| `/` ([page.tsx](apps/portfolio/src/app/page.tsx)) | **ISR**: async RSC + `fetch(..., { cache: "force-cache", next: { tags: ["page-data", "blogs"] }})` | Renders once, regenerates only when admin pushes those tags |
| `/blog` ([page.tsx](apps/portfolio/src/app/blog/page.tsx)) | **ISR** (same pattern), reads featured + first 30 + site config + tags in parallel | `tag` query string filters in memory — no extra fetch |
| `/blog/[slug]` ([page.tsx](apps/portfolio/src/app/blog/[slug]/page.tsx)) | **SSG at build + ISR after**: [`generateStaticParams`](apps/portfolio/src/app/blog/[slug]/page.tsx) pre-renders every published slug; runtime fetches are still `force-cache` tagged with `blog:${slug}` | Prerenders all known slugs; new slugs render on first hit and get cached too |
| `/privacy`, `/terms`, `/refund-policy` ([(legal)/](apps/portfolio/src/app/(legal))) | **Pure static** | Content is in the source file, no fetches |
| `sitemap.xml` ([sitemap.ts](apps/portfolio/src/app/sitemap.ts)) | **Hybrid**: `export const revalidate = 86400` daily backstop + tag-invalidated since its fetches share `blogs`/`page-data` tags | Daily floor; mutations push fresh entries immediately |
| `robots.txt` ([robots.ts](apps/portfolio/src/app/robots.ts)) | **Pure static** | Constant |
| `/api/revalidate` ([route.ts](apps/portfolio/src/app/api/revalidate/route.ts)) | **Dynamic** route handler | Triggers `revalidateTag`/`revalidatePath` |
| `/api/score` ([route.ts](apps/portfolio/src/app/api/score/route.ts)) | **Dynamic** route handler | Per-request cookie + uncached upstream call |

Two layers of caching to keep straight:

- **Data cache** (Next's fetch cache, keyed by URL+headers+tags) — set by `cache: "force-cache"`, busted by `revalidateTag`. This is what holds admin's JSON responses on the portfolio side.
- **Full-route cache** — the rendered RSC output. For pages whose only async work is tagged fetches, the route stays cached as long as the underlying fetches do; once a tag is invalidated, the next request re-runs the page.

[`React.cache()`](https://react.dev/reference/react/cache) wraps `getPost`, `getAllBlogs`, and `getPageData` to dedupe across `generateMetadata` + page render (and across home + footer for `getPageData`).

### Admin — private, mostly dynamic

| Route | Strategy | Why |
|---|---|---|
| `/` ([page.tsx](apps/admin/src/app/page.tsx)) | Client component (login form) | Submits a server action |
| `/dashboard/*` | **Dynamic** by default (most use server actions + cookies) | Auth-gated, never cached |
| `/dashboard/blog-site` ([page.tsx](apps/admin/src/app/dashboard/blog-site/page.tsx)) | `export const dynamic = "force-dynamic"` — explicit | Reads live config; preempts any inference |
| `/api/*` | **Dynamic** — every handler hits Firestore via the Admin SDK, which Next treats as dynamic | No caching layer on the admin side |
| Dashboard widgets ([useDashboardData.ts](apps/admin/src/hooks/useDashboardData.ts)) | **Client + SWR** keyed on `/api/dashboard/*` | `revalidateOnFocus: false`, `keepPreviousData: true` |

Admin doesn't use `force-cache` anywhere. Everything is read-through to Firestore.

---

## Read path (portfolio render)

Example: rendering `/blog/some-slug` cold.

1. Next looks up the rendered route — miss (first request).
2. `PostPage` calls `getPost(slug)` ([posts.ts](apps/portfolio/src/lib/posts.ts)). `React.cache` memoizes within the request.
3. `getPost` runs two `fetchJson` calls in parallel — one for the post, one for `getAllBlogs()` (for prev/next).
4. Each `fetchJson` checks the data cache. Cold → fetches admin with `serverToken`, force-caches the result tagged `["blogs", "blog:slug"]` (and just `["blogs"]` for the list).
5. Admin's `wrapRoute` runs the handler against Firestore and returns `{ status: "success", data: PublishedBlogDB }`.
6. Portfolio unwraps to `PublishedBlogDB`, maps to a `PostMeta` view type, computes `prev`/`next` from the sorted full list.
7. Page renders, gets cached. Next request → step 1 hits.
8. Admin publishes an edit → POSTs `tags: ["blogs", "blog:slug"]` to `/api/revalidate` → `revalidateTag` purges the data-cache entries → next visit re-runs the page.

---

## Write path (admin save)

Example: publishing a draft.

1. `PublishBlog` client component invokes [`publishBlog(draftId)`](apps/admin/src/actions/blogActions.ts) via server action.
2. `wrap` catches any throw, returns `ApiResponse`.
3. The action reads the draft, calls [`formDataToPublishedDB`](apps/admin/src/lib/blogUtils.ts) (preserves `featuredAt`, `publishedAt`, `stats` from any existing published doc), and overwrites the doc keyed by `parentBlogId || blogId` in the `blogs` collection.
4. Deletes the draft if it was a side-edit (had a `parentBlogId`).
5. Calls [`revalidateBlog(slug)`](apps/admin/src/lib/blogUtils.ts) → POSTs tags `["blogs", "blog:${slug}"]` to portfolio.
6. Portfolio purges and the next visitor sees the new post.

---

## Per-app layout

### `apps/admin/src/`

| Dir | Role |
|---|---|
| `app/` | Routes. `dashboard/*` = CMS UI, `api/*` = the surface above + `/api/event` ingest |
| `actions/` | `"use server"` mutations — blog/auth/config/AI/media. Anything that writes to Firestore or R2 goes through here, never directly from a client component |
| `lib/` | Server-only helpers. `appUtils` (`wrap`/`wrapRoute`), `blogUtils` (DB↔form conversion + revalidate trigger), `commonQuery` (Firestore CRUD primitives), `blogQuery`, `requireAuth`, `agentLog`, `finalizeAiDoc` |
| `config/` | `env.server`, `env.client`, `firebaseAdmin` (Firestore client + `Collections` enum), `cloudflareS3` (R2 client + presign helpers), `anthropic` (Claude Agent SDK wrapper for AI metadata + draft generation) |
| `hooks/` | Client SWR wrappers. `useCustomSWR` enforces the `ApiResponse` envelope |
| `stores/` | Zustand — `BlogEditorStore` (editor state), `SiteConfigStore`, `PortfolioStore`, `UIStore` (modals) |
| `components/` | Feature-bucketed: `blog-site/`, `write-post/`, `managePosts/`, `portfolio/`, `dashboard/`, `ui/` |
| `scripts/seed/` | Firestore seeders. Entry: `pnpm seed:firestore` |
| `scripts/migrate*` | One-off backfills. Always run with `dryRun: true` first |
| `proxy.ts` | Next 16 middleware. Gates `/`, `/api/*`, `/dashboard/*` by JWT cookie or `serverToken` header |

### `apps/portfolio/src/`

| Dir | Role |
|---|---|
| `app/page.tsx` | Home — server component, fetches page data + 4 recent posts |
| `app/blog/page.tsx` | Index — featured + first 30 + tags filter |
| `app/blog/[slug]/page.tsx` | Post page — `generateStaticParams` + `generateMetadata` |
| `app/(legal)/` | Privacy/terms/refund-policy — static content, shared layout |
| `app/api/revalidate/route.ts` | Receives admin's tag/path invalidation pings |
| `app/api/score/route.ts` | Score read/write proxy — adds the `felt-id` device cookie before forwarding |
| `app/sitemap.ts`, `robots.ts` | SEO files |
| `lib/posts.ts` | All blog reads — `getRecentBlogs`, `getFeaturedBlog`, `getPost`, `getAllBlogs`, plus the `Post`/`PostMeta`/`Neighbour` view types |
| `lib/pageData.ts` | Portfolio content read (`getPageData`) |
| `config/env.ts` | `ADMIN_ORIGIN`, `SERVER_TOKEN` — the only two values the portfolio needs |
| `components/Blog/*` | Blog-page components, post components (`Toc`, `FeltMeter`, `Share`, `BlogPostJsonLd`, …) |
| `components/portfolio/*` | Home-page sections (`Hero`, `Atmosphere`, `Services`, `Work`, `Voices`, `Writing`, …) |
| `components/ui/*` | Shared primitives (`scroll-island`, `nav-link`, `H2`, …) |

### `packages/schemas/src/`

| File | Exports |
|---|---|
| `blog.ts` | `BlogStatus`, `PublishedBlogDB`, `BlogDraftDB`, `BlogFormData` + zod schemas. The single source of truth for the blog wire shape |
| `portfolio.ts` | `PageData`, `Project`, `Testimonial`, `Service`, `SkillGroup`, `Credential`, `Contact`, … |
| `site.ts` | `SiteConfig` (blog landing copy, "now reading", "currently building") |
| `dashboard.ts` | `AnalyticsEvent` discriminated union + per-day/source aggregate shapes |
| `api.ts` | `ApiResponse<T>`, `CursorPage<T>` — the two envelopes |
| `ai.ts` | Loose AI-output schemas (`aiBlogMetadataSchema`, `aiBlogDraftSchema`) and a re-exported strict `DocContent` |
| `user.ts` | Single-user shape, mostly unused |
| `index.ts` | Re-exports everything (apps import from `@tabsircg/schemas/blog`, etc., not the barrel) |

No build step. The `exports` map points at `.ts` source; both apps `transpilePackages: ["@tabsircg/schemas"]` so Turbopack reads source directly and HMR is instant.

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

Two-phase upload — file goes browser→R2 directly, only the URL touches Firestore.

### AI authoring

[`generateBlogMetadata`](apps/admin/src/actions/aiActions.ts) and [`generateBlogDraft`](apps/admin/src/actions/aiActions.ts) call [`sendPrompt`](apps/admin/src/config/anthropic.ts), which streams the `@anthropic-ai/claude-agent-sdk` `query()`. The SDK is configured tight: only `WebSearch`/`WebFetch` tools, no filesystem, no hooks, no MCP. Output is forced through a Zod schema (`outputFormat: { type: "json_schema", … }`), parsed, and persisted as a normal draft.

### Analytics (partial)

`POST /api/event` ([route.ts](apps/admin/src/app/api/event/route.ts)) accepts the discriminated union from [`dashboard.ts`](packages/schemas/src/dashboard.ts) and fans out batched `FieldValue.increment` writes to `daily_stats`, `geo_stats`, `page_performance`, `traffic_sources`. The dashboard widgets read these via [`/api/dashboard/*`](apps/admin/src/app/api/dashboard) and aggregate over a configurable day window. **The portfolio doesn't currently emit any events** — schema and endpoint exist, the client emitter doesn't.

### Felt meter (per-device reactions)

Client sets a `felt-id` UUID cookie, debounces taps (600 ms), POSTs `{ slug, count }` to portfolio's `/api/score`. The proxy injects `felt-id` from the cookie and forwards as `id` to admin. Admin runs a Firestore transaction reading `blogs/{id}/felt/{deviceId}`, clamping per-device count at 50, only crediting the delta to `stats.score`.

---

## Gotchas worth re-reading

The serious ones — schema-content storage as a string, the no-build trick, the prev/next O(n) ceiling, featured-not-boolean — are already in [README.md](README.md) and [CLAUDE.local.md](CLAUDE.local.md). Don't duplicate them here; that's where they belong.

What's *not* in README:

- **Admin's data cache is empty.** Admin never sets `force-cache` on a fetch. Every Firestore read goes live. Portfolio is the only side that caches.
- **`revalidateTag` with `{ expire: 0 }`** is intentional. The default behaviour serves stale once; `expire: 0` purges. Keep it that way unless you specifically want a soft revalidate.
- **`startAfter(value, docId)` cursor.** The `__blogId` tail in the cursor string is a stable tiebreaker. If you change the cursor format, change [`readNDocs`](apps/admin/src/lib/commonQuery.ts) to match — it splits on `__` and coerces numeric prefixes back to numbers.
- **`serverToken` is enforced at the proxy, not per-route.** Don't assume a route handler will reject a missing token — it won't.
- **`/api/event` has no caller.** The endpoint and aggregation are wired; the portfolio-side emitter that would call them isn't.
