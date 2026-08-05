# apps/admin

Private CMS for [tabsircg.com](https://tabsircg.com). Next.js 16, port `5000`. Owns Firestore and Cloudflare R2.

Cross-app context is in the root [README.md](../../README.md) and [ARCHITECTURE.md](../../ARCHITECTURE.md); the analytics pipeline is in [ANALYTICS.md](ANALYTICS.md). This file covers running admin on its own.

## Run

```bash
pnpm dev:admin          # from workspace root, :5000
pnpm dev                # from this directory, same thing
pnpm emulators          # Firebase emulators instead of production Firestore
pnpm tc                 # typecheck
pnpm test               # vitest
```

## Environment

`.env` in this directory. Full list in the root README; the admin-only keys:

| Key | Purpose |
| --- | --- |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Login. No user table — this is the only account |
| `JWT_SECRET` | Signs the `t` session cookie |
| `FIREBASE_PRIVATE_KEY` / `FIREBASE_CLIENT_EMAIL` | Service-account access to Firestore |
| `CLOUDFLARE_R2_AK_ID` / `CLOUDFLARE_R2_AK` / `CLOUDFLARE_R2_ENDPOINT` | R2 image uploads |
| `LINKEDIN_CLINET_ID` / `LINKEDIN_CLINET_SECRET` | LinkedIn OAuth (the typo is in the code) |
| `SERVER_TOKEN` | Must match portfolio's; portfolio uses it to call admin's API |
| `ANTHROPIC_AUTH_TOKEN` | Only for the AI authoring features |
| `TINYBIRD_HOST` / `TINYBIRD_TOKEN` | Analytics dashboard queries |

## Firestore migrations

One-off backfills live in `src/scripts/migrate*`. Always run with `dryRun: true` first.

## Gotcha worth re-stating

`tsconfig.json` has `exactOptionalPropertyTypes: true`. Don't pass `undefined` for optional props — use `{...(x ? { prop: ... } : {})}`. Portfolio doesn't have this flag, so code that lifts between the two apps can still trip on it.
