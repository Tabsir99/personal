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

`visitor_id` is a **`UUID` column**, not a String. Every breakdown holds one
entry per visitor in memory — `uniqExact`, and the `groupUniqArray` that dedups
per-visitor revenue — and `GROUPING SETS` keeps one such state per level, eight
of them on the sources route. At 16 bytes that is affordable; at 36 characters it
was the first thing to hit a memory ceiling. It also shrinks the bloom filter and
every join on the column.

The cost is that **ClickHouse quarantines a row whose UUID it cannot parse, and
says nothing**. The id is not trustworthy input — it comes from the
`cgd_visitor_id` cookie and the `_cgd_vid` cross-domain param, both of which a
visitor can edit — so three gates keep malformed ids away from the column:

- `usableHandoffId` (SDK) treats a non-UUID cookie or handoff param as absent, so
  the tracker mints a fresh id instead of forwarding junk.
- `payloadSchema` (Worker) rejects a non-UUID `visitorId` outright. The SDK only
  ever sends `generateUUID()` output, so anything else is tampering or a direct
  POST, and failing at the boundary beats vanishing later.
- `writePaymentEvent` (admin) throws rather than write one. Stripe metadata is
  only as good as what checkout put there, and a quarantined payment row is
  revenue disappearing with no error anywhere; the webhook turns the throw into a
  500 and releases the event for Stripe to retry.

`UUID_PATTERN` / `isUuid` live in `@tabsircg/schemas/analytics`; the tracker
mirrors the pattern in its own `constants.ts` under a test asserting the two are
equal, the same arrangement `CUSTOM_EVENT_TYPE` uses.

> **`session_id` is deliberately still a String.** `getSessionId` builds it as
> `'s' + uuid.slice(1)`, which is not a parseable UUID. Nothing aggregates per
> session the way the breakdowns aggregate per visitor, so there is no similar
> win to chase.

> **Changing the column type needs a migration; the `.datasource` file is a
> mirror, not the live table.** Tinybird cannot alter a column type in place on a
> populated datasource. The move is: create `analytics_events_v2` with the new
> schema, backfill with
> `INSERT INTO analytics_events_v2 SELECT * REPLACE (toUUID(visitor_id) AS visitor_id) FROM analytics_events`,
> point the Worker and admin at it, then drop the old one. **Check for
> unconvertible rows first** —
> `SELECT count() FROM analytics_events WHERE toUUIDOrNull(visitor_id) IS NULL` —
> because those rows are the ones the backfill will drop, and any row written
> before the three gates above existed could be among them.

The datasource also declares a `bloom_filter` skip index on `visitor_id`
(`INDEXES` in the `.datasource`). It exists solely for the journey route's
unbounded per-visitor lookup — see below.

Server-side enrichment happens in the Worker at ingest on browser rows, so
these arrive as real columns (no query-time parsing needed):

- **geo** — `country` / `region` / `city` / `ip` from the request.
- **UA parse** — `browser` / `os` / `device` via `parseUA`.

**The Worker does not classify bots.** `is_bot` / `bot_category` / `bot_name`
arrive already decided, in the request body, from
`@tabsircg/analytics/middleware` running in the tracked app's own middleware.
A payload carrying a `bot` object is a crawl row: `is_bot = 1`, geo `Unknown`,
nil-UUID visitor and session, and the crawler's real UA and IP taken from the
body rather than from the calling request's headers. Every other payload is a
browser row and is written with `is_bot = 0`.

The reason it lives there and not here: the Worker only ever sees requests that
executed JavaScript, so a UA check at ingest can only catch crawlers that
render — Googlebot's WRS, Bingbot, Lighthouse. GPTBot, ClaudeBot, CCBot and
every social unfurler fetch HTML and leave, and would never appear. Middleware
sees the fetch itself, so it sees all of them. Because the Worker classifies
nothing, exactly one pipeline writes `is_bot = 1` and there is no double count
for the crawlers that do both.

Categories are still declared once in `@tabsircg/schemas/analytics`
(`BOT_CATEGORY_NAMES`) and consumed by the ingest schema, the middleware and
`botRegistry.ts`: `search_index`, `answer_fetch`, `training`, `ai_crawler`,
`seo`, `social`, `monitoring`, `tooling`, `archive`, and `generic`. A match
yields a canonical name (`AhrefsBot`, not the substring that matched) so the
bots panel groups cleanly. Anything that only trips a bare bot signal falls to
`generic` and is named from its own UA token, never from the signal.

> **`bot_category` values changed twice.** Rows ingested before the signature
> table existed classified everything outside the AI/search set as `generic` —
> SEO crawlers, link unfurlers and uptime monitors all landed there, most of
> them named `bot`. Rows ingested while the Worker still classified cover only
> JavaScript-rendering crawlers. Historical rows keep whatever they were given;
> only rows written by the middleware have full crawler coverage.

`ip` is written on every row and **read by nothing** — no ingest path and no
dashboard query filters on it. There is no IP-based exclusion of your own
traffic; the only self-exclusion is the browser-local `cgd_ignore` flag
documented in `packages/analytics/README.md` §6.

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
- **Cross-domain** — `_cgd_vid` / `_cgd_sid` (+ `_cgd_vsn`) URL params
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

Every SDK entry point now writes that shape — `cgd(name,…)`, the `data-cgd-*`
attributes, `<Track>` and `analytics.trackEvent(name,…)` all send
`type='custom'` + `extraData.eventName`. `CUSTOM_EVENT_TYPE` lives in
`@tabsircg/schemas/analytics`; admin re-exports it and the tracker mirrors it
under a test that asserts the two are equal, so the pin and the producer cannot
drift apart again.

> **Rows written before that unification keep `type=<event name>`.**
> `trackEvent` used to send the name as the `type`, so those rows carry the
> right `event_name` and the wrong `type`: **counted by the goals/series
> branch** (which only excludes `type='pageview'`) yet **absent from the
> catalog**, so an old goal can show in the chart while missing from every
> picker. `journey/route.ts` has the same pin via `sortKeyTypeFor`. Funnels were
> never affected — a goal step matches `event_name` alone. Only a backfill
> rewriting `type` to `custom` clears the historical rows.

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

`LIMIT 101 BY visitor_id` caps each timeline **in the database**, so a runaway
visitor never reaches the wire; the 101st row exists only to make truncation
detectable and is dropped during assembly (`MAX_ROWS_PER_VISITOR` in
`journey/assemble.ts`). Real traffic peaks near a dozen lifetime events per
visitor. When it does bite, the query keeps the **newest** 100 rows, so `rows[0]`
is no longer the visitor's first touch and `sourceAttribution` and
`timeBeforeGoal` are derived from the oldest surviving row instead.

There is deliberately **no index on `event_name`**. Every type but `custom` has
exactly one `event_name` (equal to the type), so the predicate is already
redundant once `type` is pinned; within `custom` there are ~12 names spread
evenly, which no granule would be missing — a bloom filter would skip nothing
and cost write throughput.

Timelines are **batch-prefetched with the list** rather than fetched per visitor,
so opening a visitor costs no round trip. Two things keep that payload sane: runs
of repeat views of the same path collapse into one entry with a `count` and a
`lastTimestamp`, and each visitor is capped at 100 entries (`truncated: true`
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
