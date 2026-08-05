# Analytics Architecture Reference

The data path, identity model, and how the dashboard queries it.

The client SDK and ingestion Worker live in this monorepo — `packages/analytics` (browser tracker + crawler middleware) and `apps/analytics-worker` (the CF Worker plus the Tinybird `.datasource` DDL). This doc describes observable behavior; the cookie/session logic is authoritative there.

## Stack

| Layer | Implementation |
| --- | --- |
| Event store | **Tinybird** (managed ClickHouse), datasource `analytics_events` |
| Ingestion | CF Worker at `analytics.tabsircg.com` → `POST {TINYBIRD_HOST}/v0/events?name=analytics_events` |
| Client SDK | `@tabsircg/analytics` |
| Dashboard API | Next.js route handlers → `POST {TINYBIRD_HOST}/v0/sql` |
| App config / funnels | Firestore |

## Data schema

Flat, named columns. Names are centralized in `src/lib/tinybird.ts` (`F`) so routes never hardcode them:

```
website_id  type  domain  href  referrer  visitor_id  session_id
language  timezone  event_name  extra_data(JSON)  country  region  city
browser  os  device  is_bot  bot_category  bot_name  ip
viewport_w  viewport_h  screen_w  screen_h  session_number  timestamp
revenue_cents
```

`revenue_cents` is set only by the Stripe webhook path; the browser SDK writes zero. **Revenue is USD-only by construction** — there is no currency column, so charging in a second currency is a schema change, not a display fix.

> **`type='payment'` rows are sparse.** `writePaymentEvent` knows the visitor but nothing about their browser, so `domain`, `href`, `referrer`, `language`, `timezone`, geo, UA and viewport are empty and `session_number` is 0. Anything reading "the visitor's latest row" must skip them or it renders a blank profile for every visitor who paid and left. Both seed scripts reproduce this deliberately.

### Why `visitor_id` is a UUID column

Every breakdown holds one entry per visitor in memory — `uniqExact`, and the `groupUniqArray` that dedups per-visitor revenue — and `GROUPING SETS` keeps one such state per level, eight of them on the sources route. At 16 bytes that is affordable; at 36 characters it was the first thing to hit a memory ceiling. It also shrinks the bloom filter and every join on the column.

The cost: **ClickHouse quarantines a row whose UUID it cannot parse, silently.** The id is not trustworthy input — it comes from the `cgd_visitor_id` cookie and the `_cgd_vid` param, both visitor-editable — so three gates keep malformed ids out:

- `usableHandoffId` (SDK) treats a non-UUID cookie or param as absent, so the tracker mints a fresh id rather than forwarding junk.
- `payloadSchema` (Worker) rejects a non-UUID `visitorId`. The SDK only ever sends `generateUUID()` output, so anything else is tampering or a direct POST.
- `writePaymentEvent` (admin) throws rather than write one — a quarantined payment row is revenue disappearing with no error anywhere. The webhook turns the throw into a 500 so Stripe retries.

`UUID_PATTERN` / `isUuid` live in `@tabsircg/schemas/analytics`; the tracker mirrors the pattern in its `constants.ts` under a test asserting the two are equal.

> **`session_id` is deliberately still a String.** `getSessionId` builds it as `'s' + uuid.slice(1)`, which is not a parseable UUID. Nothing aggregates per session the way breakdowns aggregate per visitor, so there is no similar win.

> **Changing a column type needs a migration — the `.datasource` file is a mirror, not the live table.** Tinybird cannot alter a column type in place on a populated datasource. Create `analytics_events_v2`, backfill with `INSERT INTO analytics_events_v2 SELECT * REPLACE (toUUID(visitor_id) AS visitor_id) FROM analytics_events`, repoint the Worker and admin, drop the old one. **Check for unconvertible rows first** — `SELECT count() FROM analytics_events WHERE toUUIDOrNull(visitor_id) IS NULL` — those are the rows the backfill drops.

The datasource also declares a `bloom_filter` skip index on `visitor_id`, solely for the journey route's unbounded per-visitor lookup.

### Enrichment

The Worker enriches browser rows at ingest, so these arrive as real columns: **geo** (`country`/`region`/`city`/`ip` from the request) and **UA parse** (`browser`/`os`/`device` via `parseUA`).

**The Worker does not classify bots.** `is_bot` / `bot_category` / `bot_name` arrive already decided in the request body, from `@tabsircg/analytics/middleware` running in the tracked app. A payload carrying a `bot` object is a crawl row: `is_bot = 1`, geo `Unknown`, nil-UUID visitor and session, and the crawler's real UA and IP taken from the body rather than the calling request's headers — the middleware reads them from the proxy's forwarding headers (`x-vercel-forwarded-for`, `cf-connecting-ip`, …) on the request the crawler actually made. Every other payload is a browser row with `is_bot = 0`.

Because those fields are supplied rather than derived at ingest, crawl payloads must carry `X-Ingest-Token` matching the Worker's `INGEST_TOKEN` secret; `Origin` alone gates browser events, which cannot hold a secret. A payload with a `bot` object and no matching token is a 403.

Why there and not here: the Worker only sees requests that executed JavaScript, so a UA check at ingest catches only crawlers that render — Googlebot's WRS, Bingbot, Lighthouse. GPTBot, ClaudeBot, CCBot and every social unfurler fetch HTML and leave. Middleware sees the fetch itself. Because the Worker classifies nothing, exactly one pipeline writes `is_bot = 1` and crawlers that do both are not double-counted.

Categories are declared once in `@tabsircg/schemas/analytics` (`BOT_CATEGORY_NAMES`) and consumed by the ingest schema, the middleware and `botRegistry.ts`: `search_index`, `answer_fetch`, `training`, `ai_crawler`, `seo`, `social`, `monitoring`, `tooling`, `archive`, `generic`. A match yields a canonical name (`AhrefsBot`, not the matched substring). Anything tripping only a bare bot signal falls to `generic`, named from its own UA token.

> **`bot_category` values changed twice.** Rows from before the signature table classified everything outside the AI/search set as `generic`, most named `bot`. Rows from while the Worker still classified cover only JS-rendering crawlers. Historical rows keep what they were given; only middleware-written rows have full coverage.

`ip` is written on every row and **read by nothing** — no ingest path or dashboard query filters on it. The only self-exclusion is the browser-local `cgd_ignore` flag (`packages/analytics/README.md` §6).

Data that still hides: **UTM params** live inside `href` and are parsed server-side by the sources route; **referrer** is the raw `document.referrer`.

## Identity & sessions

Cookies set by the SDK (prefix `cgd_`):

- **`cgd_visitor_id`** (365d, UUID) — persistent anonymous visitor, the primary join key.
- **`cgd_session_id`** (30-min sliding, `s`+UUID) — one visit window. Rollover increments `cgd_visitor_session_count`.
- **`identify` event** — links the visitorId to your `user_id` via `extra_data`; attaches, does not replace.
- **Cross-domain** — `_cgd_vid` / `_cgd_sid` / `_cgd_vsn` URL params carry identity across allowed hostnames; the tracker strips them after read.

## Query model

- **Live queries only**, no pre-aggregation. Every route POSTs SQL to `/v0/sql` (body = SQL + ` FORMAT JSON`, bearer `TINYBIRD_TOKEN`). Env: `TINYBIRD_HOST`, `TINYBIRD_TOKEN`.
- **One SQL statement per route** — multi-part panels use `UNION ALL` + a `level` discriminator, never multiple round-trips.
- Every route accepts `?websiteId=&period=&granularity=`; parsing and `queryTinybird()` live in `src/lib/tinybird.ts`.

## Routes (JWT-protected)

| Route | Returns |
| --- | --- |
| `/api/analytics/main` | Overview metrics, previous-period deltas, timeseries |
| `/api/analytics/pages` | Top pages, entry pages, hostnames, exit links |
| `/api/analytics/sources` | Referrers + channel classification |
| `/api/analytics/locations` | Country / region / city (`?country=&region=` drill-down) |
| `/api/analytics/system` | Browser / OS / device |
| `/api/analytics/goals` | Goal metrics + per-bucket series + the goal catalog |
| `/api/analytics/bots` | Crawler timeseries by category + per-bot totals |
| `/api/analytics/bots/pages` | Pages hit by a single bot (`?bot=`) |
| `/api/analytics/funnels` | Funnel definitions for the site |
| `/api/analytics/funnel` | One funnel's per-step counts + metrics (`?funnelId=`) |
| `/api/analytics/journey` | Goal completers + their lifetime timelines (`?goal=`) |

## Goals

`/api/analytics/goals` answers two questions in one call:

- **Metrics** (`goals`, `series`) — period-scoped, capped at the top 30 by unique visitors. Drives the Goals tab chart.
- **Catalog** (`catalog`) — every distinct `event_name` where `type = 'custom'`, with **no period filter**, so the journey and funnel-builder pickers don't shift when the date range changes.

The catalog branch pins `type = 'custom'` to prune on the `(website_id, is_bot, type)` sorting-key prefix. Attribute-driven goals are written as `type='custom'` with the real name in `event_name`. Goals every site has without firing a custom event — `payment`, `identify`, `external_link` — are unioned in client-side from `RESERVED_GOALS`, not discovered by the query.

Every SDK entry point writes that shape. `CUSTOM_EVENT_TYPE` lives in `@tabsircg/schemas/analytics`; admin re-exports it and the tracker mirrors it under an equality test, so the pin and the producer cannot drift.

> **Rows written before that unification keep `type=<event name>`.** They carry the right `event_name` and the wrong `type`: **counted by goals/series** (which only excludes `type='pageview'`) yet **absent from the catalog**, so an old goal can show in the chart but no picker. `journey/route.ts` has the same pin via `sortKeyTypeFor`. Funnels were never affected — a goal step matches `event_name` alone. Only a backfill clears it.

The query is three UNION branches, not four: `goals` and `series` read an identical row set and differ only in grouping, so they share one scan via `GROUP BY GROUPING SETS ((bucket, name), (name))`.

## Journeys

`/api/analytics/journey` deliberately breaks the "period bounds the query" rule:

- The **period selects which visitors appear** — those who fired `?goal=` (default `payment`) inside it, newest first, `?limit=`/`?skip=` paged. `?goal=all` drops the goal filter and ranks by last activity, so a journey that converted on nothing is still reachable; it costs ~4× the scan, because there is no `type` to pin.
- The **events returned are unbounded** — a journey is a visitor's whole lifetime, so the outer query carries no time filter. That unbounded `visitor_id IN (…)` lookup is why the datasource declares the `bloom_filter` skip index; the sort key (`website_id, is_bot, type, timestamp`) can't serve it.

Two load-bearing details:

- **The inner select pins `type`**, not just `event_name`. `event_name` isn't in the sort key, so filtering on it alone leaves `type` unconstrained and the index can't reach `timestamp`. Pinning `type` cut a 30-day probe from **927k scanned rows to 54k**.
- **It stays `IN (subquery)` rather than a join**, so ClickHouse pushes the visitor set down to the skip index; a join forces a full scan. The total visitor count rides along as a scalar subquery column, keeping the page to one round trip.

`LIMIT 101 BY visitor_id` caps each timeline **in the database**. The 101st row exists only to make truncation detectable and is dropped during assembly (`MAX_ROWS_PER_VISITOR` in `journey/assemble.ts`). Real traffic peaks near a dozen lifetime events per visitor. When it bites, the query keeps the **newest** 100 rows, so `rows[0]` is no longer the first touch and `sourceAttribution` / `timeBeforeGoal` derive from the oldest surviving row.

There is deliberately **no index on `event_name`**. Every type but `custom` has exactly one `event_name` (equal to the type), so the predicate is redundant once `type` is pinned; within `custom` there are ~12 names spread evenly, which no granule would be missing.

Timelines are **batch-prefetched with the list**, so opening a visitor costs no round trip. Runs of repeat views of the same path collapse into one entry with a `count` and `lastTimestamp`, and each visitor is capped at 100 entries (`truncated: true` when it bites).

Source classification reuses `buildChannelSQL` from `sources/channels.ts`, so a journey's channel and the Sources panel agree by construction. The raw referrer travels too, for `<Favicon source={…}>` to render client-side.

Customer identity rides on `type='payment'` rows, whose `extra_data` carries `customer_name` / `customer_email` / `customer_id` / `transaction_id` from the Stripe webhook. It is returned **unmasked** — the dashboard is single-owner and JWT-protected. Payments written before that webhook change render blank.
