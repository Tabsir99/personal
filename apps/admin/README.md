# apps/admin

Private CMS for [tabsircg.com](https://tabsircg.com). Next.js 16, port `5000`. Owns Firestore and Cloudflare R2.

The cross-app picture lives in the root [README.md](../../README.md) and [ARCHITECTURE.md](../../ARCHITECTURE.md). This file only covers what matters when you're running admin on its own.

## Run

From the workspace root:

```bash
pnpm dev:admin          # admin only, :5000
pnpm dev                # admin + portfolio
```

From this directory:

```bash
pnpm dev                # same as pnpm dev:admin above
pnpm emulators          # Firebase emulators instead of production Firestore
```

## What it needs

`.env` in this directory. Required keys are listed in the root README under "Run it". The ones unique to admin:

- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — login credentials. There's no user table; these are the only account.
- `JWT_SECRET` — signs the `t` session cookie.
- `FIREBASE_PRIVATE_KEY` / `FIREBASE_CLIENT_EMAIL` — service-account access to Firestore.
- `CLOUDFLARE_R2_AK_ID` / `CLOUDFLARE_R2_AK` / `CLOUDFLARE_R2_ENDPOINT` — R2 credentials for image uploads.
- `LINKEDIN_CLINET_ID` / `LINKEDIN_CLINET_SECRET` — LinkedIn OAuth (note the typo, it's in code).
- `SERVER_TOKEN` — has to match portfolio's `SERVER_TOKEN`. Used by portfolio to call admin's API.
- `ANTHROPIC_AUTH_TOKEN` — only needed if you use the AI authoring features.

## Tests and types

```bash
pnpm tc                 # typecheck
pnpm test               # vitest
```

## Firestore migrations

One-off backfills live in `src/scripts/migrate*`. Always run with `dryRun: true` first.

## Gotcha worth re-stating here

`tsconfig.json` has `exactOptionalPropertyTypes: true`. Don't pass `undefined` for optional props. Use the spread-when-defined pattern: `{...(x ? { prop: ... } : {})}`. Portfolio doesn't have this flag, so code that lifts cleanly between the two apps can still trip on this.
