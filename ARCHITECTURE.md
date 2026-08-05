# Architecture

How the apps wire together. README has the overview and run instructions.

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
   │  apps/portfolio │ ◄──────────────────────────────  │   apps/admin    │
   │   public site   │                                  │      CMS        │
   │   Next 16 :3001 │  ─────────────────────────────►  │  Next 16 :5000  │
   │                 │  POST /api/revalidate (tags)     │                 │
   └────────┬────────┘                                  └────────┬────────┘
            │  /api/score (proxy)                                │
            └────────────────────────────────────────────────────┤
                                                                 ▼
   ┌──────────────────────┐   POST /api/events   ┌───────────────────────┐
   │  analytics-worker    │ ◄─────────────────── │      Firestore        │
   │  (Cloudflare, KV)    │   browser + crawler  │  blogs, config, …     │
   └──────────┬───────────┘                      └───────────────────────┘
              ▼
        ┌───────────┐
        │ Tinybird  │  analytics_events
        └───────────┘
```

Admin owns Firestore and R2; nothing else writes to them. Portfolio reads admin's REST API through Next's data cache. Invalidation is push-based — admin POSTs tag names to portfolio's `/api/revalidate` after every mutation. Analytics is a separate pipeline: the Worker ingests events and writes to Tinybird, and admin's dashboard queries Tinybird directly.

---

## How they talk

### The envelope

Admin REST handlers are wrapped in [`wrapRoute`](apps/admin/src/lib/appUtils.ts), server actions in [`wrap`](apps/admin/src/lib/appUtils.ts). Both produce the shape in [`packages/schemas/src/api.ts`](packages/schemas/src/api.ts):

```ts
type ApiResponse<T> =
  | { status: "success"; data: T }
  | { status: "error"; message: string };
```

`ZodError` → 400, `HttpError` → its status, anything else → 500. Portfolio's `fetchJson` and `getPageData` unwrap it to `T | null`.

Paginated lists wrap `data` once more:

```ts
interface CursorPage<T> { items: T[]; nextCursor: string | null }
```

The cursor is `` `${lastItem[orderBy]}__${lastItem.blogId}` ``. The `__blogId` tail is a stable tiebreaker — without it, docs sharing an `orderBy` value skip or duplicate across pages. See [`readNDocs`](apps/admin/src/lib/commonQuery.ts).

### Auth

Two callers, both checked in [`apps/admin/src/proxy.ts`](apps/admin/src/proxy.ts) (Next 16's renamed `middleware.ts`):

| Caller | Mechanism | Unlocks |
|---|---|---|
| Browser session (admin) | `t` HTTP-only cookie holding a `jose` JWT | `/dashboard/*` pages and server actions |
| Portfolio server → admin | `serverToken` header | public read endpoints only (`serverTokenAllowed`) |

The JWT is minted in [`logInAction`](apps/admin/src/actions/authActions.ts) against `ADMIN_USERNAME` / `ADMIN_PASSWORD`, verified against `JWT_SECRET`. No user table — single tenant.

`serverToken` is enforced at the proxy, not per route. Don't write handlers that assume they'll re-check it.

### The public API surface

| Endpoint | Used by |
|---|---|
| `GET /api/blogs?status,kind,tag,cursor,limit,orderBy` | `getRecentBlogs` |
| `GET /api/blogs/featured` | `getFeaturedBlog` |
| `GET /api/blogs/nav` | `getBlogNav` — slug/title/date index for prev/next |
| `GET /api/blogs/[slug]` | `getPost` — returns the post plus its `prev`/`next` |
| `GET/POST /api/blogs/[slug]/score` | `FeltMeter` via portfolio's `/api/score` proxy |
| `GET /api/site-config` | `getSiteConfig` |
| `GET /api/config`, `GET /api/config/portfolio` | `getBlogTags`, portfolio config |
| `GET/POST /api/page-data` | `getPageData`; admin write |
| `POST /api/page-data/upload-urls` | Portfolio editor uploads (admin JWT) |
| `GET /api/analytics/*` | Admin dashboard — `main`, `pages`, `sources`, `locations`, `system`, `goals`, `journey`, `funnel`, `funnels`, `bots`, `bots/pages` |
| `POST /api/stripe/webhook` | Stripe revenue attribution |

`score` is the one public-caller mutation; it goes through portfolio's `/api/score` so the `felt-id` cookie stays same-origin. The analytics and upload endpoints need the admin JWT, not `serverToken`.

---

## Write → revalidate

```
client UI
  └─► server action (apps/admin/src/actions/blogActions.ts)
        └─► Firestore Admin SDK (apps/admin/src/lib/commonQuery.ts)
              └─► sendRevalidateRequest({ tags }) (apps/admin/src/lib/blogUtils.ts)
                    └─► POST apps/portfolio/src/app/api/revalidate/route.ts
                          └─► revalidateTag(tag, { expire: 0 })
```

`revalidateBlog(slug)` busts `blogs` (every list surfacing the post) and `blog:${slug}`. Page-data writes bust `page-data`; `updateSiteConfig` busts `site-config`; `addConfigValue` busts `blog-config`.

`{ expire: 0 }` purges immediately — without it Next serves stale once.

Portfolio's revalidate route checks `acs_tkn` against `SERVER_TOKEN`.

---

## Rendering

Next 16 App Router, Cache Components not opted in.

### Portfolio (mostly static)

| Route | Strategy |
|---|---|
| `/` | ISR — async RSC + `fetch(..., { cache: "force-cache", next: { tags: ["page-data", "blogs"] }})` |
| `/blog` | ISR — featured + first 30 + site config + tags in parallel; `tag` query filters in memory |
| `/blog/[slug]` | SSG at build via `generateStaticParams`, ISR after; fetches tagged `blog:${slug}` |
| `/privacy`, `/terms`, `/refund-policy` | Pure static |
| `sitemap.xml` | `revalidate = 86400` daily backstop plus `blogs`/`page-data` tag invalidation |
| `robots.txt` | Pure static |
| `/api/revalidate`, `/api/score` | Dynamic |

Two caches: the **data cache** (Next's fetch cache, keyed by URL + headers + tags, busted by `revalidateTag`) and the **full-route cache** (rendered RSC output — for a page whose only async work is tagged fetches, the route stays cached as long as those fetches do).

`React.cache()` wraps `getPost` and `getPageData` to dedupe within a request (e.g. `generateMetadata` + page render).

### Admin (mostly dynamic)

| Route | Strategy |
|---|---|
| `/` | Client component (login form) |
| `/dashboard/*` | Dynamic — auth-gated, never cached |
| `/dashboard/blog-site` | `export const dynamic = "force-dynamic"`, explicit |
| `/api/*` | Dynamic — every handler hits Firestore or Tinybird |
| Dashboard widgets | Client + SWR, `revalidateOnFocus: false`, `keepPreviousData: true` |

Admin never sets `force-cache`. Every read is live.

---

## Read path

Cold render of `/blog/some-slug`:

1. Next looks up the rendered route — miss.
2. `PostPage` calls `getPost(slug)`; `React.cache` memoizes within the request.
3. `fetchJson` checks the data cache. Cold, so it hits admin with `serverToken` and force-caches the response tagged `["blog:slug"]`.
4. Admin's `wrapRoute` runs the handler against Firestore and returns `{ status: "success", data }` with `prev`/`next` already computed.
5. Portfolio maps it to the `Post` view shape and renders. Route gets cached.
6. Admin publishes an edit → POSTs `["blogs", "blog:slug"]` → `revalidateTag` purges → next visit re-renders.

---

## Write path

Publishing a draft:

1. `PublishBlog` calls [`publishBlog(draftId)`](apps/admin/src/actions/blogActions.ts).
2. `wrap` catches throws and returns `ApiResponse`.
3. The action reads the draft, runs [`formDataToPublishedDB`](apps/admin/src/lib/blogUtils.ts) (preserving `featuredAt`, `publishedAt`, `stats` from any existing published doc), and overwrites the doc keyed by `parentBlogId || blogId`.
4. Deletes the draft if it was a side-edit (had a `parentBlogId`).
5. Calls `revalidateBlog(slug)` → portfolio purges.

---

## Per-app layout

### `apps/admin/src/`

| Dir | Role |
|---|---|
| `app/` | Routes. `dashboard/*` is the CMS UI, `api/*` the surface above |
| `actions/` | `"use server"` mutations: blog, auth, config, AI, media, analytics, funnel. All Firestore/R2 writes go through here |
| `lib/` | Server-only: `appUtils` (`wrap`/`wrapRoute`), `blogUtils` (DB ↔ form + revalidate), `commonQuery` (Firestore CRUD), `blogQuery`, `requireAuth`, `agentLog`, `finalizeAiDoc` |
| `config/` | `env.server`, `env.client`, `firebaseAdmin`, `cloudflareS3` (R2 + presign), `anthropic` (Claude Agent SDK wrapper) |
| `hooks/` | Client SWR wrappers; `useCustomSWR` enforces the `ApiResponse` envelope |
| `stores/` | Zustand: `BlogEditorStore`, `SiteConfigStore`, `PortfolioStore`, `UIStore` |
| `components/` | `blog-site/`, `write-post/`, `managePosts/`, `portfolio/`, `dashboard/`, `ui/` |
| `scripts/seed/` | Firestore seeders — `pnpm seed:firestore` |
| `scripts/migrate*` | One-off backfills. Run `dryRun: true` first |
| `proxy.ts` | Next 16 middleware. Gates by JWT cookie or `serverToken` |

### `apps/portfolio/src/`

| Path | Role |
|---|---|
| `app/page.tsx` | Home — page data + 4 recent posts |
| `app/blog/page.tsx` | Index — featured + first 30 + tag filter |
| `app/blog/[slug]/page.tsx` | Post page — `generateStaticParams` + `generateMetadata` |
| `app/(legal)/` | Privacy/terms/refund-policy |
| `app/api/revalidate/route.ts` | Receives admin's tag invalidations |
| `app/api/score/route.ts` | Score proxy; injects the `felt-id` device cookie |
| `lib/posts.ts` | `getRecentBlogs`, `getFeaturedBlog`, `getBlogNav`, `getPost`, plus `Post` / `PostMeta` / `Neighbour` view types |
| `lib/pageData.ts` | `getPageData` |
| `config/env.ts` | `ADMIN_ORIGIN`, `SERVER_TOKEN` |
| `components/` | `Blog/*`, `portfolio/*`, `ui/*` |

### `packages/schemas/src/`

| File | Exports |
|---|---|
| `blog.ts` | `BlogStatus`, `PublishedBlogDB`, `BlogDraftDB`, `BlogFormData` + zod schemas |
| `portfolio.ts` | `PageData`, `Project`, `Testimonial`, `Service`, `SkillGroup`, `Credential`, `Contact` |
| `site.ts` | `SiteConfig` |
| `analytics.ts` | `AnalyticsEventRow`, `BOT_CATEGORY_NAMES`, `extraDataSchema`, wire limits |
| `api.ts` | `ApiResponse<T>`, `CursorPage<T>` |
| `ai.ts` | `aiBlogMetadataSchema`, `aiBlogDraftSchema`, re-exported `DocContent` |
| `index.ts` | Barrel (apps import subpaths, not this) |

No build step — the `exports` map points at `.ts` source and both apps `transpilePackages` it, so Turbopack reads source and HMR is instant.

---

## Cross-cutting flows

### Media uploads

```
client → POST /api/page-data/upload-urls (filename, size, type)
       ← { presignedUrl, key, path }[]
client → PUT <presignedUrl> file body  (direct to R2, public-read, immutable)
client → POST /api/page-data with the new pageData JSON
admin  → diffs old vs new URLs, deleteObjects(R2_PUBLIC, removedUrls)
admin  → writePortfolioPageData → sendRevalidateRequest({ tag: "page-data" })
```

The file goes browser → R2 directly; only the URL touches Firestore.

### AI authoring

`generateBlogMetadata` and `generateBlogDraft` ([aiActions.ts](apps/admin/src/actions/aiActions.ts)) call `sendPrompt` ([anthropic.ts](apps/admin/src/config/anthropic.ts)), streaming the Claude Agent SDK `query()`. The SDK is locked down — `WebSearch` and `WebFetch` only, no filesystem, no hooks, no MCP. Output is forced through a Zod schema and saved as a normal draft.

### Analytics

Browser events come from `@tabsircg/analytics`; crawler events from its `/middleware` export, running in the app's request path. Both POST to the Cloudflare Worker, which validates against a KV origin allowlist and writes one row to Tinybird's `analytics_events`. Revenue rows are written separately by the Stripe webhook in admin. The dashboard queries Tinybird through `/api/analytics/*`. See [apps/admin/ANALYTICS.md](apps/admin/ANALYTICS.md).

### Felt meter

Client sets a `felt-id` UUID cookie, debounces taps (600ms), POSTs `{ slug, count }` to portfolio's `/api/score`. The proxy forwards `felt-id` as `id` to admin, which runs a Firestore transaction against `blogs/{id}/felt/{deviceId}`, clamps per-device count at 50, and credits only the delta to `stats.score`.

---

## Only documented here

- **Admin caches nothing.** It never sets `force-cache`. Portfolio is the side that caches.
- **`revalidateTag` uses `{ expire: 0 }`.** The default serves stale once; `expire: 0` purges.
- **`startAfter(value, docId)` cursor.** If you change the format, fix [`readNDocs`](apps/admin/src/lib/commonQuery.ts) — it splits on `__` and coerces numeric prefixes back to numbers.
- **`serverToken` is enforced at the proxy, not per route.**
