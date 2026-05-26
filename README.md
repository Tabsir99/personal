# tabsircg

Personal site monorepo: a public **portfolio + blog** ([tabsircg.com](https://tabsircg.com)) and a private **admin/CMS** that powers it. Built as a pnpm workspace so the public site and the admin share Zod schemas and TypeScript types over the wire without a build step.

```
apps/portfolio  ──REST──►  apps/admin  ──►  Firestore + Cloudflare R2
   (public)                  (private CMS)
```

---

## What's inside

### `apps/admin` — Private CMS (Next.js 16, port `5000`)
- Notion-style block editor (`@open-notion/editor`) for writing posts.
- Drafts → publish workflow with featured-post management.
- Dashboard for managing portfolio content: projects, services, skills, testimonials, credentials, metadata.
- Analytics dashboard: page views, geo breakdown, traffic sources, time-series stats.
- Image uploads to **Cloudflare R2** via presigned URLs.
- JWT-cookie session auth (`jose`) gated by `ADMIN_USERNAME` / `ADMIN_PASSWORD`.
- LinkedIn OAuth integration for cross-posting.
- Anthropic Claude Agent SDK wired in (`@anthropic-ai/claude-agent-sdk`) for AI-assisted authoring.
- Firestore-backed: blogs, drafts, portfolio config, site config, analytics aggregates.

### `apps/portfolio` — Public site (Next.js 16, port `3001`)
- Animated hero, terminal/scramble effects, services, work showcase, voices/testimonials, contact.
- Blog index with featured slot + cursor-paginated regular list.
- Per-post pages with TOC, share buttons, heart/score feedback, "felt meter".
- Legal pages: privacy, terms, refund policy.
- SEO: dynamic sitemap, robots.txt, OG metadata.
- On-demand revalidation endpoint (`/api/revalidate`) so admin can push fresh content without a redeploy.
- Score proxy (`/api/score`) that forwards reactions to admin.

### `packages/schemas` — `@tabsircg/schemas`
Shared Zod schemas + types. Exports its `.ts` source directly via the `exports` map — no build, no `dist`. Both apps `transpilePackages` it so edits hot-reload in both servers instantly.

Modules: `blog`, `portfolio`, `user`, `dashboard`, `api`, `site`, `ai`.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js **16** (App Router, Turbopack), React **19** |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS **v4** (CSS-first `@theme`), `tw-animate-css` |
| UI primitives | `@base-ui/react`, `shadcn`, `lucide-react`, `react-icons` |
| Validation | Zod 4 |
| Data | Firestore (via `firebase-admin`) |
| Object storage | Cloudflare R2 (S3-compatible, `@aws-sdk/client-s3`) |
| Editor | `@open-notion/editor` (block editor) |
| Auth | `jose` JWTs in HTTP-only cookies |
| Forms/state | `swr`, `zustand`, server actions |
| Charts | `recharts` |
| Tests | `vitest` |
| Runtime | Node **24.13** (see `.nvmrc`), pnpm workspaces |
| AI | `@anthropic-ai/claude-agent-sdk` |

---

## Quick start

Requires Node `24.13.0` (`.nvmrc`) and `pnpm`.

```bash
pnpm install

# Both apps in parallel: admin on :5000, portfolio on :3001
pnpm dev

# One app at a time
pnpm dev:admin
pnpm dev:portfolio
```

Each app needs its own `.env` file (env files are not loaded from workspace root by Next). Required keys:

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
SERVER_TOKEN=...   # must match admin's SERVER_TOKEN
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

## Workspace commands

| Command | What it does |
|---|---|
| `pnpm dev` | Run both apps in parallel |
| `pnpm dev:admin` / `pnpm dev:portfolio` | Run one app |
| `pnpm dev:clean` | Nuke `.next/` then `dev` |
| `pnpm build` | Build both apps |
| `pnpm tc` | Typecheck both apps |
| `pnpm test` | Run vitest in every workspace |
| `pnpm seed:firestore` | Seed admin's Firestore (config, blogs, portfolio, analytics) |
| `pnpm clean:pnpm` | Wipe `node_modules` + lockfile, reinstall |

---

## Wire contracts (admin → portfolio)

Every admin REST response is wrapped by `wrapRoute` ([apps/admin/src/lib/appUtils.ts](apps/admin/src/lib/appUtils.ts)) into:

```ts
type ApiResponse<T> =
  | { status: "success"; data: T }
  | { status: "error"; message: string };
```

Portfolio's `fetchJson` helper unwraps it. List endpoints (currently just `/api/blogs`) wrap `data` again in a cursor page:

```ts
interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;  // stringified orderBy value of last item
}
```

The header `serverToken` is portfolio's auth to admin (described but not yet enforced — add validation in `wrapRoute` once admin's API gets a public hostname).

### Public API surface (admin)

```
GET    /api/blogs                  paginated list (status, kind, tag, cursor, limit, orderBy)
GET    /api/blogs/featured         the current featured post
GET    /api/blogs/[slug]           single published post
POST   /api/blogs/[slug]/score     react to a post
GET    /api/site-config            global site config
GET    /api/config/portfolio       portfolio content
POST   /api/event                  client analytics ingest
GET    /api/dashboard/{stats,geo,pages,sources}    analytics aggregates (admin-only)
```

---

## Key concepts

### Featured posts
A blog's "featured" flag is a `featuredAt: number | null` timestamp, **not** a boolean. The post with the highest non-null `featuredAt` across published blogs wins. Featuring is an explicit action (`featureBlog(blogId)` server action or `GET /api/blogs/featured`); there is no `unfeatureBlog` — once anything has ever been featured, there is always a featured post. Requires the `(status, featuredAt desc)` Firestore composite index in [apps/admin/firestore.indexes.json](apps/admin/firestore.indexes.json).

### Blog content storage
`PublishedBlogDB.content` and `BlogDraftDB.content` are stored as **`JSON.stringify(DocContent)` strings** in Firestore. Parsing/stringifying happens at the boundary in [apps/admin/src/lib/blogUtils.ts](apps/admin/src/lib/blogUtils.ts) and [apps/portfolio/src/lib/posts.ts](apps/portfolio/src/lib/posts.ts).

### Wire types vs view types
- **Wire types** live in `@tabsircg/schemas` — shapes traveling over HTTP. Source of truth.
- **View types** live in `apps/portfolio/src/lib/posts.ts` (`Post`, `PostMeta`, `Neighbour`) — presentation-only (e.g. `date` as an ISO string, computed `prev`/`next`). Don't move these into the shared package.

### The no-build workspace trick
`@tabsircg/schemas` is internal-only and never published, so its `exports` map points directly at `.ts` source. Both apps add `transpilePackages: ["@tabsircg/schemas"]` in `next.config.ts`, letting Turbopack read the source and watch it for HMR. Editing a schema instantly propagates to both apps. **Don't add a build step "just in case"** — it would break the dev story.

---

## Layout

```
personal/
├── apps/
│   ├── admin/                  Next.js 16 admin/CMS (port 5000)
│   │   ├── src/app/api/        REST endpoints consumed by portfolio
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

`CLAUDE.local.md` carries deeper notes (gotchas, schema migration policy, open work) — read it before changing the wire format or the dev story.

---

## Gotchas

- Admin's `tsconfig.json` has `exactOptionalPropertyTypes: true` — never pass `undefined` for optional props. Use the spread-when-defined pattern: `{...(x ? { prop: ... } : {})}`. Portfolio does not have this flag.
- `pnpm-lock.yaml` lives at the workspace root only; there are no per-app lockfiles.
- `@open-notion/editor` is a peer dep of `@tabsircg/schemas` (only the `DocContent` type is referenced); both apps install it directly.
- Each app loads its own `.env`. Shared values (e.g. `SERVER_TOKEN`) are duplicated in both files.
- The portfolio's `getPost(slug)` computes prev/next by paginating all blogs — fine up to ~100 published posts. Beyond that, introduce a "navigation index" doc.

---

## Deployment

Both apps are Next.js 16 standalone builds and run on Node. Production targets Vercel; admin's Firestore data is in production Firebase. The portfolio's `/api/revalidate` endpoint lets admin push fresh content without a redeploy.
