# Analytics Architecture Reference

How analytics works in this app — the data path, the identity model, and how the
dashboard queries it.

The client SDK and the ingestion Worker live in this monorepo:
`packages/analytics` (the `@tabsircg/analytics` browser SDK) and
`apps/analytics-worker` (the CF Worker, plus the Tinybird `.datasource` DDL).
This doc describes observable behavior; the cookie/session logic is
authoritative there.

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
revenue_cents
```

`revenue_cents` is only ever set by the Stripe webhook path; the browser SDK
writes zero. **Revenue is USD-only by construction** — there is no currency
column, so charging in a second currency is a schema change, not a display fix
(converting needs the FX rate as of the payment).

> **`type='payment'` rows are sparse.** They come from `writePaymentEvent`, called
> by the Stripe webhook, which knows the visitor but nothing about their browser.
> `domain`, `href`, `referrer`, `language`, `timezone`, geo, UA and viewport are
> all empty, and `session_number` is 0. Anything reading "the visitor's latest
> row" must skip them or it will render a blank profile for every visitor who
> paid and left. Both seed scripts reproduce this shape deliberately.

The datasource also declares a `bloom_filter` skip index on `visitor_id`
(`INDEXES` in the `.datasource`). It exists solely for the journey route's
unbounded per-visitor lookup — see below.

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
| `/api/analytics/goals`      | Goal metrics + per-bucket series + the goal catalog              |
| `/api/analytics/bots`       | Crawler timeseries by category + per-bot totals                  |
| `/api/analytics/bots/pages` | Pages hit by a single bot (`?bot=`)                              |
| `/api/analytics/funnels`    | Funnel definitions for the site                                  |
| `/api/analytics/funnel`     | One funnel's per-step counts + metrics (`?funnelId=`)            |
| `/api/analytics/journey`    | Goal completers + their full lifetime timelines (`?goal=`)       |

## Goals

`/api/analytics/goals` answers two different questions in one Tinybird call,
because the pickers and the charts need different things:

- **Metrics** (`goals`, `series`) — period-scoped, capped at the top 30 by
  unique visitors. Drives the Goals tab chart and its aside.
- **Catalog** (`catalog`) — every distinct `event_name` where `type = 'custom'`,
  with **no period filter**. Drives the goal pickers in the journey tab and the
  funnel builder, so the options don't shift when the date range changes.

The catalog branch pins `type = 'custom'` so it prunes on the
`(website_id, is_bot, type)` sorting-key prefix. That works because the tracker
writes attribute-driven goals (`data-*-goal`, `data-*-scroll`) as
`type='custom'` with the real name in `event_name`. Goals every site has without
firing a custom event — `payment`, `identify`, `external_link` — are unioned in
client-side from `RESERVED_GOALS`, not discovered by the query.

The query is three UNION branches, not four: `goals` and `series` read an
identical row set and differ only in grouping, so they share one scan via
`GROUP BY GROUPING SETS ((bucket, name), (name))`. `catalog` (all-time) and the
pageview visitor total (key-pruned on `type='pageview'`) stay separate — merging
either would cost more than it saves.

## Journeys

`/api/analytics/journey` breaks the "period bounds the query" rule that every
other route follows, deliberately:

- The **period selects which visitors appear** — those who fired `?goal=`
  (default `payment`) inside it, newest completion first, `?limit=`/`?skip=`
  paged. `?goal=all` drops the goal filter and lists every visitor active in the
  period ranked by last activity, so a journey that converted on nothing is
  still reachable. It costs roughly 4× the scan of a goal-scoped page, because
  there is no `type` to pin.
- The **events returned for those visitors are unbounded** — a journey is a
  visitor's whole lifetime, so the outer query carries no time filter. That
  unbounded `visitor_id IN (…)` lookup is why the datasource declares a
  `bloom_filter` skip index on `visitor_id`; the sort key
  (`website_id, is_bot, type, timestamp`) can't serve it.

Two things about that SQL are load-bearing:

- **The inner select pins `type`**, not just `event_name`. `event_name` isn't in
  the sort key, so filtering on it alone leaves `type` unconstrained and the
  index can't reach `timestamp`. Pinning `type` (`payment` for the payment goal,
  `custom` for every other) cut a 30-day probe from **927k scanned rows to 54k**.
- **It stays `IN (subquery)` rather than a join**, so ClickHouse can push the
  visitor set down to the skip index — a join would force a full scan. The total
  visitor count rides along as a scalar subquery column, keeping the whole page
  to one round trip.

`LIMIT 501 BY visitor_id` caps each timeline **in the database**, so a runaway
visitor never reaches the wire; the 501st row exists only to make truncation
detectable and is dropped during assembly. Real traffic peaks near a dozen
lifetime events per visitor, so this has never fired.

There is deliberately **no index on `event_name`**. Every type but `custom` has
exactly one `event_name` (equal to the type), so the predicate is already
redundant once `type` is pinned; within `custom` there are ~12 names spread
evenly, which no granule would be missing — a bloom filter would skip nothing
and cost write throughput.

Timelines are **batch-prefetched with the list** rather than fetched per visitor,
so opening a visitor costs no round trip. Two things keep that payload sane: runs
of repeat views of the same path collapse into one entry with a `count` and a
`lastTimestamp`, and each visitor is capped at 500 entries (`truncated: true`
when it bites).

Source classification reuses `buildChannelSQL` from `sources/channels.ts`, so a
journey's channel and the Sources panel agree by construction. The raw referrer
travels too, for `<Favicon source={…}>` to render client-side — the route ships
no icon or flag URLs.

Customer identity rides on `type='payment'` rows, whose `extra_data` carries
`customer_name` / `customer_email` / `customer_id` / `transaction_id`, written by
the Stripe webhook. It is returned **unmasked** — the dashboard is single-owner
and JWT-protected, so masking your own customer list would only get in the way.
Payments written before that webhook change carry no identity and render blank.
