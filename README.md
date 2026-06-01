# tabsircg

Source for [tabsircg.com](https://tabsircg.com): the public portfolio + blog (`apps/portfolio`) and the CMS that feeds it (`apps/admin`). pnpm workspace, Next.js 16 on both sides, shared Zod schemas in `packages/schemas`.

```
apps/portfolio  ──REST──►  apps/admin  ──►  Firestore + Cloudflare R2
   (public)                  (private CMS)
```

[ARCHITECTURE.md](ARCHITECTURE.md) goes into the data flow, rendering matrix, and per-app layout.

---

## The apps

### `apps/admin` (Next.js 16, port `5000`)

Private CMS. Notion-style block editor via `@open-notion/editor`, drafts → publish flow, featured-post management. Dashboard CRUD over everything portfolio renders (projects, services, skills, testimonials, credentials, site metadata) plus an analytics dashboard (page views, geo, traffic sources, time-series).

Image uploads go to Cloudflare R2 via presigned URLs. Auth is one JWT cookie (`jose`) gated by `ADMIN_USERNAME` / `ADMIN_PASSWORD` — no user table, single tenant. LinkedIn OAuth for cross-posting. Optional Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) for AI-assisted authoring. Everything else is Firestore.

### `apps/portfolio` (Next.js 16, port `3001`)

Public site. Animated hero with terminal/scramble bits, services, work showcase, voices/testimonials, contact. Blog index with a featured slot plus a cursor-paginated regular list. Per-post pages have TOC, share buttons, heart/score reactions, the "felt meter". Legal pages (privacy, terms, refund policy). SEO: dynamic sitemap, `robots.txt`, OG metadata.

`/api/revalidate` is how admin pushes fresh content without a redeploy. `/api/score` proxies reactions back to admin so the `felt-id` cookie stays same-origin.

### `packages/schemas` — `@tabsircg/schemas`

Shared Zod schemas and types. Exports its `.ts` source directly through the `exports` map (no build, no `dist`). Both apps `transpilePackages` it, so a schema edit hot-reloads in both servers.

Modules: `blog`, `portfolio`, `user`, `dashboard`, `api`, `site`, `ai`.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Language | TypeScript 5.9 |
| Styling | Tailwind v4 (CSS-first `@theme`), `tw-animate-css` |
| UI | `@base-ui/react`, `shadcn`, `lucide-react`, `react-icons` |
| Validation | Zod 4 |
| Data | Firestore via `firebase-admin` |
| Storage | Cloudflare R2 (S3-compatible, `@aws-sdk/client-s3`) |
| Editor | `@open-notion/editor` |
| Auth | `jose` JWTs in HTTP-only cookies |
| State | `swr`, `zustand`, server actions |
| Charts | `recharts` |
| Tests | `vitest` |
| Runtime | Node 24.13 (`.nvmrc`), pnpm workspaces |
| AI | `@anthropic-ai/claude-agent-sdk` |

---

## Run it

Node 24.13 (`.nvmrc`) and pnpm.

```bash
pnpm install

pnpm dev               # both apps: admin :5000, portfolio :3001
pnpm dev:admin         # just admin
pnpm dev:portfolio     # just portfolio
```

Each app loads its own `.env`. Next doesn't pick env files up from the workspace root, so shared values get duplicated.

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
SERVER_TOKEN=...   # has to match admin's SERVER_TOKEN
```

Firebase emulators (admin only):
```bash
cd apps/admin && pnpm emulators
```

Seed local Firestore with sample data:
```bash
pnpm seed:firestore
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
| `pnpm seed:firestore` | Seed admin's Firestore |
| `pnpm clean:pnpm` | Nuke `node_modules` + lockfile, reinstall |

---

## Wire contracts

Every admin REST response goes through `wrapRoute` ([apps/admin/src/lib/appUtils.ts](apps/admin/src/lib/appUtils.ts)) and ends up shaped like this:

```ts
type ApiResponse<T> =
  | { status: "success"; data: T }
  | { status: "error"; message: string };
```

Portfolio's `fetchJson` unwraps it. List endpoints (just `/api/blogs` so far) wrap `data` once more:

```ts
interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;  // stringified orderBy value of last item
}
```

The `serverToken` header is portfolio's auth into admin. It's enforced at the proxy ([apps/admin/src/proxy.ts](apps/admin/src/proxy.ts)) and scoped to the public, portfolio-facing endpoints only — blog reads, config, `GET /api/page-data`, and event ingest — never the dashboard analytics or content writes, which require the admin JWT cookie.

### Public API (admin)

```
GET    /api/blogs                  paginated list (status, kind, tag, cursor, limit, orderBy)
GET    /api/blogs/featured         current featured post
GET    /api/blogs/[slug]           single published post
POST   /api/blogs/[slug]/score     react to a post
GET    /api/site-config            global site config
GET    /api/config/portfolio       portfolio content
POST   /api/event                  client analytics ingest
GET    /api/dashboard/{stats,geo,pages,sources}    analytics aggregates (admin-only)
```

---

## Things that bite

### Featured is a timestamp, not a boolean

`featuredAt: number | null`. Whichever published blog has the highest non-null `featuredAt` is "featured". Featuring is an explicit action (`featureBlog(blogId)` server action, or `GET /api/blogs/featured` for the portfolio side). There's no `unfeatureBlog`. So once you've featured anything, something is always featured — that's the design, accept it. Requires the `(status, featuredAt desc)` Firestore composite index ([apps/admin/firestore.indexes.json](apps/admin/firestore.indexes.json)).

### Blog content is a JSON string, not an object

`PublishedBlogDB.content` and `BlogDraftDB.content` hold `JSON.stringify(DocContent)` strings in Firestore. The parse/stringify happens at the boundary: [apps/admin/src/lib/blogUtils.ts](apps/admin/src/lib/blogUtils.ts) on the admin side, [apps/portfolio/src/lib/posts.ts](apps/portfolio/src/lib/posts.ts) on the portfolio side. Treat it as `DocContent` everywhere else.

### Wire types vs view types

Wire shapes live in `@tabsircg/schemas`. They're what travels over HTTP. View shapes (`Post`, `PostMeta`, `Neighbour` in [apps/portfolio/src/lib/posts.ts](apps/portfolio/src/lib/posts.ts)) are portfolio-only: ISO date strings, computed `prev`/`next`, that kind of thing. Don't move view types into the shared package.

### The no-build workspace

`@tabsircg/schemas` is internal-only and never gets published. Its `exports` map points straight at `.ts` source, both apps `transpilePackages` it, and Turbopack reads source. HMR is instant. Don't add a build step "just in case" — you'd need a dual `"development"`/`"production"` exports condition and you'd lose the live edit story. The only reason this works is that the package is never consumed from outside the repo.

---

## Layout

```
personal/
├── apps/
│   ├── admin/                  Next.js 16 admin/CMS (port 5000)
│   │   ├── src/app/api/        REST endpoints used by portfolio
│   │   ├── src/app/dashboard/  Authoring + analytics UI
│   │   ├── src/scripts/seed/   Firestore seeders
│   │   ├── firestore.rules
│   │   └── firestore.indexes.json
│   └── portfolio/              Next.js 16 public site (port 3001)
│       ├── src/app/            Routes (incl. /blog, /api/{score,revalidate})
│       └── src/components/     portfolio/, Blog/, ui/
└── packages/
    └── schemas/                @tabsircg/schemas — Zod sources, no build
```

`CLAUDE.local.md` has the deeper notes: gotchas, schema migration policy, open work. Read it before changing the wire format or the dev story.

---

## Smaller stuff

- Admin's `tsconfig.json` has `exactOptionalPropertyTypes: true`. Don't pass `undefined` for optional props. Use spread-when-defined: `{...(x ? { prop: ... } : {})}`. Portfolio doesn't have that flag.
- `pnpm-lock.yaml` lives at the workspace root only. There are no per-app lockfiles.
- `@open-notion/editor` is a peer dep of `@tabsircg/schemas` (only the `DocContent` type is referenced). Both apps install it directly.
- `getPost(slug)` in portfolio computes prev/next by paginating all blogs. Fine up to about 100 published posts. Past that, drop in a navigation-index doc.

---

## Deployment

Both apps are Next.js 16 standalone builds on Node. Production runs on Vercel. Admin's Firestore is production Firebase. Portfolio's `/api/revalidate` is how admin pushes content updates without a redeploy.
