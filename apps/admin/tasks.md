# Analytics Dashboard — Tasks

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

## Remaining

### Main chart — frontend (next up)

Backend is done (see "Main route rework" above); this is the `MainChart` + tooltip render work. Root cause of the "broken session time": `MainChart`'s `CHART_KEYS` whitelists only `visitors|pageviews|sessions`, so Bounce and Session time silently fall back to the visitors line — and the data half only just landed.

- [ ] Render every metric's own time series (except Online) — remove the `CHART_KEYS` fallback; Session time = average session time over time
- [ ] Swap `AreaChart` → recharts `ComposedChart`; per-metric render map:
  - default (no selection): Visitors **area** + Revenue **bars** (right-hand axis)
  - Visitors: two **stacked areas** — New + Returning
  - Pageviews / Sessions: single filled **area**
  - Bounce rate: bare **line**, `%` axis
  - Session time: bare **line**, `m ss` axis
  - rule: volume metrics → filled area; rate/average metrics → bare line
- [ ] Nullable selection — default = none; re-clicking the active metric returns to default (`OverviewCard.chartMetric: ChartMetric | null`; `MetricsBar` accepts `null` via its existing all-muted path). Online stays as-is (no series)
- [ ] Tooltip enrichment (structure unchanged) — per-metric derived rate + a one-line footer explaining the metric:
  - Visitors → New / Returning / Total + `% new`; footer "Unique people who visited."
  - Pageviews → value + `pages / visitor`; footer "Total page loads, repeat views included."
  - Sessions → value + `pages / session`; footer "Visits — a session ends after 30 min idle."
  - Bounce rate → `%`; footer "Share of sessions that left after one page."
  - Session time → `m ss`; footer "Avg time between a session's first and last event."
  - default → Visitors + Revenue + `revenue / visitor`; footer names the period
- [ ] Lift `formatDuration` / `formatBounce` out of `MetricsBar` into a shared `chartFormat.ts` so bar, axis, and tooltip agree
- [ ] Flip `USE_MOCKS` → `false` in `analyticsStore.ts` to hit the real route

Files: `MainChart.tsx`, `OverviewCard.tsx`, `MetricsBar.tsx`, `analyticsMock.ts`, new `chartFormat.ts`.

**Open UX decisions (blocking the build):**

1. Revenue bars — default view only, or faintly behind every metric? (lean: default-only)
2. Deselect-to-default by re-clicking the active metric, or an explicit "Overview" state?
3. Default headline line — Visitors, or Pageviews?

### Breakdown panels — new/returning + revenue (UI)

- [ ] Wire new/returning columns into Sources (referrers/channels) + entry pages, and revenue into all breakdown panels. Backend already emits these; this is panel rendering only, separate from the main chart.

### Revenue as an overview metric card (optional)

- [ ] A dedicated Revenue cell in the metrics bar with a period-over-period trend — **superseded** by revenue-in-chart (default view + tooltip). Revisit only if you also want it in the bar; needs `OverviewMetrics.revenue` + a previous-period payment scan (currently the revenue scan is `[start, end)` only, so there's no prior-period figure for a delta).

### Goals

- [ ] Rename events route types Goal → Event (raw breakdown, not configured goals)
- [ ] Goal configuration — which events count as goals
- [ ] Goal metrics — visitors completed, conversion rate, revenue

### Funnels

- [ ] Funnel definition CRUD — ordered steps
- [ ] Funnel computation — per-step visitors, drop-off, conversion
- [ ] Funnel builder + preview UI

### User journeys

- [ ] Per-visitor timeline — entry, pageviews, events, payment, duration
- [ ] Paying-visitor journeys (no signup / identify required)
- [ ] Identified-user drill-down

### Rollups / pre-aggregation (low priority)

- [ ] Hourly rollup datasource (MV-fed from raw events)
- [ ] Daily rollup datasource
- [ ] Serve breakdowns from rollups; derive weekly/monthly by aggregating
- [x] `pages` route consolidated — pages/entryPages/hostnames now share one pageview scan (GROUPING SETS + entry-page `first_value` window) with revenue joined once; `exitLinks` stays its own scan (different type). 7 scans → 3; measured **2.84× less scanned** on live 30d data (2.32M → 816k rows), 0 value diffs. Serving from a rollup is a further optional gain.

### Open decisions

- [ ] Visitor-keyed storage for journeys — second datasource / MV vs. skip index on existing table
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
