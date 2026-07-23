# Analytics Dashboard — Tasks

## Ship scope (pre-deploy)

The dashboard deploys once **Goals → Funnels → User Journeys** are built, in that order. Everything under **V2 / Later** is deferred — not needed for the initial launch. The three ship as a tabbed section on the dashboard: **Goal · Funnel · User · Journey**.

North-star screenshots + spec: `~/.claude/projects/-home-tabsir-ap-reactp-personal/analytics-north-star/` (Goal / Funnel / Journey tabs, funnel hovers, visitor-detail drawer).

## Done

- [x] Analytics stack — tracker SDK + Cloudflare worker + Tinybird `analytics_events` datasource
- [x] `@tabsircg/analytics-contract` — shared column single-source-of-truth
- [x] `src/lib/tinybird.ts` — query client (`F`), period/granularity parsing, param validation
- [x] API routes (all on Tinybird): main, sources, pages, locations, system, events, realtime, bots, bots/pages
- [x] Stripe webhook → Tinybird revenue ingest (`type='payment'`, dedup by event id)
- [x] Stripe restricted key per website (dialog + store)
- [x] Dashboard UI — overview, timeseries, breakdown panels, bot detection card, reveal animations
- [x] Revenue wired into breakdowns — sources (referrers + channels), pages (entry/top/hostnames), locations (country/region/city), system (browser/OS/device); exit links excluded from attribution
- [x] New/returning split (backend) — scoped to acquisition surfaces (sources referrers/channels + entry pages) via shared builder `src/lib/analyticsQuery.ts`; every other breakdown returns a single `uv`
- [x] Campaigns (UTM) — capture + campaign breakdown (visitors + revenue per campaign) merged into the sources route as one single-scan query
- [x] **Main route rework** — one request: the pageview slice `[prevStart, end)` is scanned once into session rows, then `GROUPING SETS ((period), (bucket))` folds it into current/previous overview totals **and** the per-bucket series; revenue is a second small payment scan `UNION ALL`'d in. Timeseries buckets by **session start**. `TimeseriesPoint` now carries `newVisitors`, `returningVisitors`, `bounceRate`, `sessionDuration`, `revenue` per bucket. Validated on live 1M-row data.
- [x] Query performance + index-usage logging — `queryLog.ts` (chalk, one structured line/query: wall/srv time, rows/bytes scanned, slow flag); opt-in `EXPLAIN indexes=1` behind `TINYBIRD_EXPLAIN=1`
- [x] Real-Tinybird integration tests — every route driven against a seeded ~10k-row realistic dataset + an independent JS reference oracle (exact by-key value match)
- [x] Fix `ILLEGAL_AGGREGATION` in locations/sources breakdowns (aggregate aliased to a GROUP BY key)
- [x] **Main chart — frontend** — `AreaChart` → `ComposedChart`; per-metric render map (volume → filled area, rate/avg → line, Visitors → stacked new/returning, default → Visitors area + Revenue bars on right axis); nullable selection (re-click active metric → default); enriched per-metric tooltips + footers; `formatDuration`/`formatBounce` lifted into shared `chartFormat.ts`; revenue bars with `motion` scale-wipe on hover. (Flip to live data tracked under Pre-deploy.)

## Remaining — ship these three, then deploy

### 1. Goals (ref: `01-goal-tab.png`)

A goal = a tracked event elevated to a "goal" with a friendly name/category + colour. The `events` route already returns the raw event breakdown; this adds the config layer + per-goal series + the tab UI.

- [ ] **Goal-config store** — which events count as goals; per goal: friendly name + category (`scroll_to_problem` → "Scroll › Problem"), colour. CRUD + `+` add-goal.
- [ ] Rename `events` route types Goal → Event (raw breakdown, not configured goals)
- [ ] **Per-goal time series** — one coloured line per goal over the period (multi-line chart)
- [ ] **Goal leaderboard** — ranked list right of the chart: name + completions + relative-magnitude bar; click to highlight/isolate that goal's line; search + filter
- [ ] Goal metrics — visitors completed, conversion rate, revenue

### 2. Funnels (ref: `02-funnel-tab.png`, `04-`/`05-` hovers)

- [ ] **Funnel-definition store** — ordered steps (pageview and/or event steps); funnel picker/switcher + `…` manage menu
- [ ] **Funnel computation** — per-step in-order unique visitors, step-to-step drop-off, conversion from previous + from start, headline conversion rate; **step value** = attributed revenue ÷ visitors at step. Use ClickHouse `windowFunnel()` over per-visitor event sequences (aim: one scan).
- [ ] **Funnel flow viz** — narrowing "river" across steps; per step emoji + name + visitor count; drop-off badges between steps; headline conversion rate + period
- [ ] **Step hover** — drop-off to next, conversion from prev + from start, step value `$/visitor`, top sources, top countries (first step: value + sources + countries only, no drop-off)

### 3. User Journeys (ref: `03-journey-tab-goal-completers.png`, `06-visitor-detail-drawer.png`)

Two tabs — **User** + **Journey** — feeding one shared visitor-detail drawer.

- [ ] **Visitor-keyed storage (decide + build first — blocks the rest)** — second datasource / MV keyed by `visitor_id` vs. skip index on the existing table. The current sort key `website_id, is_bot, type, timestamp` has no `visitor_id` prefix, so per-visitor timelines scan wide. Enables the timeline + user list without full scans.
- [ ] **Journey tab** — goal picker (`Goal: Payment 29`); list of completers: avatar, masked name, `Customer` tag, geo/device/OS/browser, source (favicon), spent, time-to-complete (first-touch → goal), completed-at + mini activity strip; searchable
- [ ] **User tab** — broader visitor directory (all visitors, same row shape); click any row → drawer
- [ ] **Visitor-detail drawer** — profile (masked identity from payment params: name/email/id/transaction_id + geo/device); day-grouped event timeline (pageviews + triggered events with expandable parameters + highlighted `Paid` row); oldest/newest sort + copy + `Show N next` pagination; right rail stats (pageviews / spent / time-to-completion) + activity heatmap + AI-summary placeholder
- [ ] **Privacy masking** — PII (names/emails/params) masked by default in list + drawer
- [ ] Paying-visitor journeys need no signup/identify (payment row carries identity); identified-user drill-down where available

### Pre-deploy

- [ ] Flip `USE_MOCKS → false` in `analyticsStore.ts`; validate every route against live Tinybird
- [ ] Deploy the whole analytics dashboard

## V2 / Later (deferred — not needed for a while)

### Breakdown panels — new/returning + revenue (UI)

- [ ] Wire new/returning columns into Sources (referrers/channels) + entry pages, and revenue into all breakdown panels. Backend already emits these; panel rendering only.

### Revenue as an overview metric card (optional)

- [ ] A dedicated Revenue cell in the metrics bar with a period-over-period trend — **superseded** by revenue-in-chart (default view + tooltip). Revisit only if you also want it in the bar; needs `OverviewMetrics.revenue` + a previous-period payment scan (currently the revenue scan is `[start, end)` only, so there's no prior-period figure for a delta).

### Rollups / pre-aggregation (low priority)

- [ ] Hourly rollup datasource (MV-fed from raw events)
- [ ] Daily rollup datasource
- [ ] Serve breakdowns from rollups; derive weekly/monthly by aggregating
- [x] `pages` route consolidated — pages/entryPages/hostnames now share one pageview scan (GROUPING SETS + entry-page `first_value` window) with revenue joined once; `exitLinks` stays its own scan (different type). 7 scans → 3; measured **2.84× less scanned** on live 30d data (2.32M → 816k rows), 0 value diffs. Serving from a rollup is a further optional gain.

### Open decisions

- [ ] Cross-device identity stitching (email → multiple visitor IDs)
- [ ] Keyword tab (low priority) — organic search queries via Google Search Console. Placeholder in the Sources panel for now; paid keywords are already available as `utm_term` under the Campaign dropdown.

## Notes

- `main` is now **1 request** (2 scans); `events` = 2 queries; every other route = 1. Revenue wiring must not add queries.
- Revenue lives on `type='payment'` rows (visitor_id + optional session_id, no dimensions); attribute by joining to the visitor's pageviews.
- Datasource sort key: `website_id, is_bot, type, timestamp`.
- Main timeseries buckets by **session start** (not pageview time) so per-bucket bounce / duration / new-vs-returning stay consistent; a session's activity attributes to the bucket it started in. Previous-period sessions carry a `bucket` sentinel of `0` so they collapse into one discarded row instead of leaking into the first current bucket.
- Breakdown default views use one `GROUPING SETS` scan (locations/system/sources); locations drill-down (`?country=`) scopes to that country and returns only its sub-levels. Pages stays 4 branches (heterogeneous grains + exit links use `type='external_link'`).
- Dimension revenue is "influence": a visitor's revenue attaches to each dimension value they touched, so a column can slightly exceed total revenue; `uv` stays exact. Validated by the integration suite (real Tinybird + JS reference oracle), which guards the per-group dedup.
- New/returning split is scoped to the acquisition surfaces only: **sources** (referrers + channels) and **entry pages**. Every other breakdown (system, locations, top pages, hostnames, exit links) returns a single `uv`. Rationale: new-vs-returning is an acquisition signal (which channel / landing page brings first-timers); on environment dimensions like browser/OS/geo it's noise.
- Where the split is kept, classification is once per visitor (`MIN(session_number)` in range; `=1` new, `>1` returning) so `newVisitors + returningVisitors === uv`. Derived from a window `MIN(session_number)` over the already-scanned dimension rows (no extra raw scan). Entry pages are session-grained, so their split is visit-level (entry session's `session_number`). Pages route unions split + uv branches under one column set and maps each partition to its metric shape.
