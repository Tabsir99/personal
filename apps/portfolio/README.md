# apps/portfolio

Public site at [tabsircg.com](https://tabsircg.com). Next.js 16, port `3001`. Reads admin's REST API and revalidates on push.

The cross-app picture lives in the root [README.md](../../README.md) and [ARCHITECTURE.md](../../ARCHITECTURE.md). This file only covers what matters when you're running portfolio on its own.

## Run

From the workspace root:

```bash
pnpm dev:portfolio      # portfolio only, :3001
pnpm dev                # admin + portfolio
```

From this directory:

```bash
pnpm dev                # same as pnpm dev:portfolio above
```

Admin needs to be reachable at `ADMIN_ORIGIN` for any data to render. If you run portfolio alone, hit `pnpm seed:firestore` from the workspace root first so admin has something to serve.

## What it needs

`.env` in this directory:

```
ADMIN_ORIGIN=http://localhost:5000
SERVER_TOKEN=...        # has to match admin's SERVER_TOKEN
```

That's it. Portfolio doesn't talk to Firestore or R2 directly — admin handles all of that. The two env values above are the entire surface area.

## Tests and types

```bash
pnpm tc                 # typecheck
pnpm test               # vitest
```

## What's served where

- `/` — home, ISR
- `/blog`, `/blog/[slug]` — blog index + post pages, SSG with tag-driven revalidation
- `/privacy`, `/terms`, `/refund-policy` — pure static
- `sitemap.xml`, `robots.txt` — SEO
- `/api/revalidate` — receives tag invalidation pings from admin
- `/api/score` — proxies score reactions to admin, injects the `felt-id` cookie

[ARCHITECTURE.md](../../ARCHITECTURE.md) has the full rendering matrix and the read/write paths.

## Gotcha worth re-stating here

`getPost(slug)` paginates all blogs to compute prev/next. Fine up to ~100 published posts. Past that, build a navigation index doc in admin and read that instead.
