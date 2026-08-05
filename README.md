# tabsircg

Source for [tabsircg.com](https://tabsircg.com): the public portfolio + blog (`apps/portfolio`) and the CMS that feeds it (`apps/admin`). pnpm workspace, Next.js 16 on both sides, shared Zod schemas in `packages/schemas`.

```
apps/portfolio  ──REST──►  apps/admin  ──►  Firestore + Cloudflare R2
   (public)                  (private CMS)        │
        └──── events ──►  analytics-worker  ──►  Tinybird
```

[ARCHITECTURE.md](ARCHITECTURE.md) has the data flow, rendering matrix and per-app layout.

---

## The apps

### `apps/admin` — Next.js 16, port `5000`

Private CMS. Notion-style block editor via `@open-notion/editor`, drafts → publish flow, featured-post management. CRUD over everything portfolio renders (projects, services, skills, testimonials, credentials, site metadata), plus an analytics dashboard reading Tinybird.

Image uploads go to Cloudflare R2 via presigned URLs. Auth is one `jose` JWT cookie gated by `ADMIN_USERNAME` / `ADMIN_PASSWORD` — no user table, single tenant. LinkedIn OAuth for cross-posting. Optional Claude Agent SDK for AI-assisted authoring.

### `apps/portfolio` — Next.js 16, port `3001`

Public site. Animated hero, services, work showcase, testimonials, contact. Blog index with a featured slot plus a cursor-paginated list. Post pages have TOC, share buttons and the felt meter. Legal pages, dynamic sitemap, `robots.txt`, OG metadata.

`/api/revalidate` is how admin pushes fresh content without a redeploy. `/api/score` proxies reactions to admin so the `felt-id` cookie stays same-origin.

### `apps/analytics-worker`

Cloudflare Worker at `analytics.tabsircg.com`. Validates events against a KV origin allowlist and writes rows to Tinybird. Holds the `.datasource` DDL.

### `packages/`

| Package | Role |
|---|---|
| `@tabsircg/schemas` | Shared Zod schemas + types. Exports `.ts` source directly — no build, no `dist`. Modules: `blog`, `portfolio`, `site`, `analytics`, `api`, `ai` |
| `@tabsircg/analytics` | Browser tracker SDK + server-side crawler middleware. Published to npm |
| `@tabsircg/analytics-mcp` | MCP server exposing the analytics data |

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Language | TypeScript 5.9 |
| Styling | Tailwind v4 (CSS-first `@theme`), `tw-animate-css` |
| UI | `premium-ds`, `@base-ui/react`, `lucide-react` |
| Validation | Zod 4 |
| Data | Firestore via `firebase-admin`; Tinybird for analytics |
| Storage | Cloudflare R2 (`@aws-sdk/client-s3`) |
| Editor | `@open-notion/editor` |
| Auth | `jose` JWTs in HTTP-only cookies |
| State | `swr`, `zustand`, server actions |
| Charts | `recharts` |
| Tests | `vitest` |
| Runtime | Node 24.13 (`.nvmrc`), pnpm workspaces |
| AI | `@anthropic-ai/claude-agent-sdk` |

---

## Run it

```bash
pnpm install
pnpm dev               # both apps: admin :5000, portfolio :3001
pnpm dev:admin         # just admin
pnpm dev:portfolio     # just portfolio
```

Each app loads its own `.env` — Next doesn't read env files from the workspace root, so shared values are duplicated.

**`apps/admin/.env`**
```
RUNTIME=development
ADMIN_USERNAME=...
ADMIN_PASSWORD=...
JWT_SECRET=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
CLOUDFLARE_R2_AK_ID=...
CLOUDFLARE_R2_AK=...
CLOUDFLARE_R2_ENDPOINT=...
LINKEDIN_CLINET_ID=...
LINKEDIN_CLINET_SECRET=...
SERVER_TOKEN=...
ANTHROPIC_AUTH_TOKEN=...
```

**`apps/portfolio/.env`**
```
ADMIN_ORIGIN=http://localhost:5000
SERVER_TOKEN=...   # must match admin's
```

```bash
cd apps/admin && pnpm emulators   # Firebase emulators
pnpm seed:firestore               # seed local Firestore
pnpm seed:analytics               # seed Tinybird
```

---

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Both apps in parallel |
| `pnpm dev:admin` / `pnpm dev:portfolio` | One app |
| `pnpm dev:clean` | Wipe `.next/`, then dev |
| `pnpm build` | Build both |
| `pnpm tc` | Typecheck both |
| `pnpm test` | vitest in every workspace |
| `pnpm seed:firestore` / `pnpm seed:analytics` | Seed data |
| `pnpm clean:pnpm` | Nuke `node_modules` + lockfile, reinstall |

---

## Wire contracts

Every admin REST response goes through `wrapRoute` ([appUtils.ts](apps/admin/src/lib/appUtils.ts)):

```ts
type ApiResponse<T> =
  | { status: "success"; data: T }
  | { status: "error"; message: string };
```

Portfolio's `fetchJson` unwraps it. List endpoints (just `/api/blogs`) wrap `data` once more:

```ts
interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;  // `${orderByValue}__${blogId}`
}
```

The `serverToken` header is portfolio's auth into admin. It's enforced at the proxy ([proxy.ts](apps/admin/src/proxy.ts)), scoped to public read endpoints only — never the analytics dashboard, content writes, or the upload presigner, which need the admin JWT.

### Public API (admin)

```
GET    /api/blogs                  paginated list (status, kind, tag, cursor, limit, orderBy)
GET    /api/blogs/featured         current featured post
GET    /api/blogs/nav              slug/title/date index for prev/next
GET    /api/blogs/[slug]           single published post, with prev/next
POST   /api/blogs/[slug]/score     react to a post
GET    /api/site-config            global site config
GET    /api/config/portfolio       portfolio content
GET    /api/analytics/*            dashboard aggregates (admin JWT only)
```

---

## Things that bite

**Featured is a timestamp, not a boolean.** `featuredAt: number | null`; the published blog with the highest non-null value wins. Featuring is an explicit action (`featureBlog(blogId)`). There's no `unfeatureBlog`, so once anything has been featured something always is — that's the design. Needs the `(status, featuredAt desc)` composite index in [firestore.indexes.json](apps/admin/firestore.indexes.json).

**Blog content is a JSON string, not an object.** `PublishedBlogDB.content` and `BlogDraftDB.content` hold `JSON.stringify(DocContent)`. Parse/stringify happens at the boundary — [blogUtils.ts](apps/admin/src/lib/blogUtils.ts) on the admin side, [posts.ts](apps/portfolio/src/lib/posts.ts) on portfolio's. Treat it as `DocContent` everywhere else.

**Wire types vs view types.** Wire shapes live in `@tabsircg/schemas`. View shapes (`Post`, `PostMeta`, `Neighbour` in [posts.ts](apps/portfolio/src/lib/posts.ts)) are portfolio-only — ISO date strings, computed `prev`/`next`. Don't move view types into the shared package.

**The no-build workspace.** `@tabsircg/schemas` is internal-only and never published. Its `exports` map points at `.ts` source, both apps `transpilePackages` it, Turbopack reads source, HMR is instant. Don't add a build step — you'd need dual `"development"`/`"production"` exports conditions and you'd lose the live edit story.

---

## Layout

```
personal/
├── apps/
│   ├── admin/                  Next.js 16 CMS (port 5000)
│   │   ├── src/app/api/        REST endpoints
│   │   ├── src/app/dashboard/  Authoring + analytics UI
│   │   ├── src/scripts/        Seeders and migrations
│   │   └── firestore.{rules,indexes.json}
│   ├── portfolio/              Next.js 16 public site (port 3001)
│   └── analytics-worker/       Cloudflare Worker + Tinybird DDL
└── packages/
    ├── schemas/                @tabsircg/schemas — Zod sources, no build
    ├── analytics/             @tabsircg/analytics — tracker SDK + crawler middleware
    └── analytics-mcp/          MCP server over the analytics data
```

[CLAUDE.md](CLAUDE.md) has the deeper notes — gotchas, schema migration policy, open work. Read it before changing the wire format or the dev story.

---

## Smaller stuff

- Admin's `tsconfig.json` has `exactOptionalPropertyTypes: true`. Don't pass `undefined` for optional props — use `{...(x ? { prop: ... } : {})}`. Portfolio doesn't have that flag.
- `pnpm-lock.yaml` lives at the workspace root only.
- `@open-notion/editor` is a peer dep of `@tabsircg/schemas` (only `DocContent` is referenced). Both apps install it directly.

---

## Deployment

Both apps are Next.js 16 standalone builds on Vercel. Firestore is production Firebase. The analytics Worker deploys to Cloudflare. Admin's push to portfolio's `/api/revalidate` is how content updates ship without a redeploy.
