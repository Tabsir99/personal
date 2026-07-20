# Analytics Architecture Reference

How analytics works in this app — the data path, the identity model, and how the
dashboard queries it.

The client SDK and the ingestion Worker live in a **separate repo**, not this
monorepo: `/home/tabsir/ap/reactp/tabsircg/analytics` — `packages/analytics` (the
`@tabsircg/analytics` browser SDK) and `packages/backend` (the CF Worker). This
doc describes observable behavior; the cookie/session logic is authoritative
there.

## Stack

| Layer                | Implementation                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| Event store          | **Tinybird** (managed ClickHouse), datasource `analytics_events`                               |
| Ingestion            | CF Worker at `analytics.tabsircg.com` → `POST {TINYBIRD_HOST}/v0/events?name=analytics_events` |
| Client SDK           | `@tabsircg/analytics` (browser tracker; sets cookies, sends events)                            |
| Dashboard API        | Next.js route handlers → `POST {TINYBIRD_HOST}/v0/sql` (ClickHouse SQL)                        |
| App config / funnels | Firestore                                                                                      |

> Historical note: this stack briefly used Cloudflare Analytics Engine before
> moving to Tinybird. The admin read layer (`src/lib/tinybird.ts`, `queryTinybird`)
> now reflects that. One vestige remains in the **Worker repo**: an unused
> `AnalyticsEngineDataset` binding (`CGD`) in `packages/backend/wrangler.toml` —
> nothing writes to it. The live store is Tinybird.

## Data schema (`analytics_events` datasource)

Flat, named columns (not positional). Column names are centralized in
`src/lib/tinybird.ts` (`F`) so routes never hardcode them:

```
website_id  type  domain  href  referrer  visitor_id  session_id
language  timezone  event_name  extra_data(JSON)  country  region  city
browser  os  device  is_bot  bot_category  bot_name  ip
viewport_w  viewport_h  screen_w  screen_h  session_number  timestamp
```

Server-side enrichment happens in the Worker at ingest, so these arrive as real
columns (no query-time parsing needed):

- **geo** — `country` / `region` / `city` / `ip` from the request.
- **UA parse** — `browser` / `os` / `device` via `parseUA`.
- **bot detect** — `is_bot` / `bot_category` / `bot_name` via `detectBot`
  (categories: `search_index` / `answer_fetch` / `training` / `ai_crawler`). Real
  crawlers are recorded, not dropped; only automation tools (Selenium/curl) are
  blocked upstream by the SDK.

Where data still hides:

- **UTM params** live inside `href` (full URL incl. query string); the sources
  route parses `utm_*` out server-side.
- **Referrer** is the raw `document.referrer` (domain + path) in `referrer`.

## Identity & sessions

Set by the client SDK as cookies (prefix `cgd_`):

- **`cgd_visitor_id`** (365 days, UUID) — the persistent anonymous visitor. Primary
  join key across all events.
- **`cgd_session_id`** (30-min sliding, `s`+UUID) — one visit window under a
  visitor. Rollover increments `cgd_visitor_session_count`.
- **`identify` event** — `analytics.identify(userId, …)` links the anonymous
  visitorId to your app's `user_id` via `extra_data` (does not replace the
  visitorId; attaches to it).
- **Cross-domain** — `_cgd_vid` / `_cgd_sid` (+ `_cgd_vfs`, `_cgd_vsn`) URL params
  carry the identity across allowed hostnames; the tracker strips them after read.

## Query model

- **Live queries only**, no pre-aggregation: every route `POST`s SQL to Tinybird's
  `/v0/sql` endpoint (body = SQL + ` FORMAT JSON`, `Authorization: Bearer
  {TINYBIRD_TOKEN}`). Env: `TINYBIRD_HOST`, `TINYBIRD_TOKEN`.
- **One SQL statement per route** — multi-part panels are built with `UNION ALL` +
  a `level` discriminator and subqueries, never multiple round-trips.
- Every route accepts `?websiteId=&period=&granularity=`; parsing + the shared
  `queryTinybird()` helper live in `src/lib/tinybird.ts`.

## Routes (JWT-protected)

| Route                       | Returns                                                          |
| --------------------------- | ---------------------------------------------------------------- |
| `/api/analytics/main`       | Overview metrics, previous-period deltas, timeseries             |
| `/api/analytics/pages`      | Top pages, entry pages, hostnames, exit links                    |
| `/api/analytics/sources`    | Referrers + channel classification                               |
| `/api/analytics/locations`  | Country / region / city (accepts `?country=&region=` drill-down) |
| `/api/analytics/system`     | Browser / OS / device                                            |
| `/api/analytics/events`     | Custom events + conversion rates                                 |
| `/api/analytics/realtime`   | Active visitors (last 10 min)                                    |
| `/api/analytics/bots`       | Crawler timeseries by category + per-bot totals                  |
| `/api/analytics/bots/pages` | Pages hit by a single bot (`?bot=`)                              |
