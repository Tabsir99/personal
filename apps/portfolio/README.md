# apps/portfolio

Public site at [tabsircg.com](https://tabsircg.com). Next.js 16, port `3001`. Reads admin's REST API and revalidates on push.

Cross-app context is in the root [README.md](../../README.md) and [ARCHITECTURE.md](../../ARCHITECTURE.md), which has the full rendering matrix and read/write paths. This file covers running portfolio on its own.

## Run

```bash
pnpm dev:portfolio      # from workspace root, :3001
pnpm dev                # from this directory, same thing
pnpm tc                 # typecheck
pnpm test               # vitest
```

Admin must be reachable at `ADMIN_ORIGIN` for anything to render. Running portfolio alone? Run `pnpm seed:firestore` from the root first so admin has something to serve.

## Environment

`.env` in this directory — the entire surface area:

```
ADMIN_ORIGIN=http://localhost:5000
SERVER_TOKEN=...        # must match admin's
```

Portfolio never touches Firestore or R2 directly; admin handles all of it.

## Routes

| Route | Strategy |
| --- | --- |
| `/` | ISR |
| `/blog`, `/blog/[slug]` | SSG with tag-driven revalidation |
| `/privacy`, `/terms`, `/refund-policy` | Pure static |
| `sitemap.xml`, `robots.txt` | SEO |
| `/api/revalidate` | Receives tag invalidation pings from admin |
| `/api/score` | Proxies score reactions to admin, injects the `felt-id` cookie |
