# Analytics Dashboard — Tasks

## Done

- [x] Analytics stack — tracker SDK + Cloudflare worker + Tinybird `analytics_events` datasource
- [x] `@tabsircg/analytics-contract` — shared column single-source-of-truth
- [x] `src/lib/tinybird.ts` — query client (`F`), period/granularity parsing, param validation
- [x] API routes (all on Tinybird): main, sources, pages, locations, system, events, realtime, bots, bots/pages
- [x] Stripe webhook → Tinybird revenue ingest (`type='payment'`, dedup by event id)
- [x] Stripe restricted key per website (dialog + store)
- [x] Dashboard UI — overview, timeseries, breakdown panels, bot detection card, reveal animations

## Remaining

### Revenue wiring (ingested, not yet queried)

- [x] Revenue in sources (referrers + channels)
- [x] Revenue in pages (entry pages, top pages, hostnames)
- [x] Revenue in locations (country / region / city)
- [x] Revenue in system (browser / OS / device)
- [ ] Revenue total + trend in overview (main route — deferred)
- [x] Exclude exit links from revenue attribution

### Visitor split (new vs returning)

- [x] `new_visitors` / `returning_visitors` split — scoped to acquisition surfaces (sources referrers/channels + entry pages); other breakdowns return a single `uv`
- [x] Shared query builder + sidecars (`src/lib/analyticsQuery.ts`)
- [ ] Wire new/returning + revenue into breakdown panels (UI — deferred with main chart)
- [ ] New/returning in overview + main chart (focused session)

### Campaigns (UTM)

- [ ] Capture UTM params (source / medium / campaign / term / content)
- [ ] Campaign breakdown — visitors + revenue per campaign

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

### Open decisions

- [ ] Visitor-keyed storage for journeys — second datasource / MV vs. skip index on existing table
- [ ] Cross-device identity stitching (email → multiple visitor IDs)
- [ ] Keyword tab (low priority) — organic search queries via Google Search Console. Placeholder in the Sources panel for now; paid keywords are already available as `utm_term` under the Campaign dropdown.

## Notes

- Every analytics route = 1 Tinybird query (main/events = 2); revenue wiring must not add queries.
- Revenue lives on `type='payment'` rows (visitor_id + optional session_id, no dimensions); attribute by joining to the visitor's pageviews.
- Datasource sort key: `website_id, is_bot, type, timestamp`.
- Breakdown default views use one `GROUPING SETS` scan (locations/system/sources); locations drill-down (`?country=`) scopes to that country and returns only its sub-levels. Pages stays 4 branches (heterogeneous grains + exit links use `type='external_link'`).
- Dimension revenue is "influence": a visitor's revenue attaches to each dimension value they touched, so a column can slightly exceed total revenue; `uv` stays exact. Needs a live Tinybird run to validate the `GROUPING SETS` SQL.
- New/returning split is scoped to the acquisition surfaces only: **sources** (referrers + channels) and **entry pages**. Every other breakdown (system, locations, top pages, hostnames, exit links) returns a single `uv`. Rationale: new-vs-returning is an acquisition signal (which channel / landing page brings first-timers); on environment dimensions like browser/OS/geo it's noise.
- Where the split is kept, classification is once per visitor (`MIN(session_number)` in range; `=1` new, `>1` returning) so `newVisitors + returningVisitors === uv`. Derived from a window `MIN(session_number)` over the already-scanned dimension rows (no extra raw scan) via `buildGroupingSetsBreakdown({ classSplit: true })`. Entry pages are session-grained, so their split is visit-level (entry session's `session_number`). Pages route unions split + uv branches under one column set and maps each partition to its metric shape.
