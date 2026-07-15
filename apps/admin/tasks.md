# Analytics Dashboard — Tasks

## Done

- [x] Architecture decisions finalized (live AE queries, no new worker, no webhooks)
- [x] `src/lib/analyticsEngine.ts` — AE SQL client, period parsing, input validation
- [x] `src/config/env.server.ts` — CF_ACCOUNT_ID + CF_API_TOKEN added
- [x] API: `/api/analytics/main` — overview metrics + previous period + timeseries
- [x] API: `/api/analytics/pages` — top pages + entry pages
- [x] API: `/api/analytics/sources` — referrers with channel classification
- [x] API: `/api/analytics/locations` — country/region/city drill-down
- [x] API: `/api/analytics/system` — browser/OS/device from UA
- [x] API: `/api/analytics/events` — custom events + conversion rates
- [x] API: `/api/analytics/realtime` — active visitors (10-min window)
- [x] API: `/api/analytics/hostnames` — per-domain breakdown
- [x] API: `/api/analytics/exit-links` — outbound link clicks

## In Progress

- [ ] Dashboard UI (Phase 2)

## Remaining

### Phase 2: Dashboard UI

- [ ] Period selector + domain selector controls
- [ ] Overview metric cards (visitors, pageviews, sessions, bounce rate, duration, realtime)
- [ ] Timeseries area chart (recharts)
- [ ] Breakdown tables: sources (channel/referrer tabs)
- [ ] Breakdown tables: locations (country/region/city tabs)
- [ ] Breakdown tables: pages (hostname/page/entry page/exit link tabs)
- [ ] Breakdown tables: system (browser/OS/device tabs)
- [ ] Custom events section
- [ ] SWR hooks for data fetching

### Phase 3: Missing Endpoints

- [ ] UTM parsing in sources route (params already in `F.href`)
- [ ] `/api/analytics/crawlers` — categorize known bot UAs (Googlebot → search_index, GPTBot → training, ChatGPT-User → answer_fetch, ClaudeBot → ai_crawler)
- [ ] Rename events route types from "Goal" to "Event" (it's a raw event breakdown, not configured goals)

### Phase 4: Stripe Revenue

- [ ] Store restricted Stripe key per website (settings UI + Firestore config)
- [ ] Revenue query endpoint — reads Stripe API, correlates via `cgd_visitor_id` metadata
- [ ] Revenue cards in overview (revenue, conversion rate, revenue/visitor)
- [ ] Revenue attribution in breakdown tables

### Phase 5: Funnels / Goals

- [ ] Goal configuration CRUD (which events are goals, optional revenue value, target threshold)
- [ ] Funnel definition CRUD (stored in Firestore)
- [ ] Funnel computation endpoint (sequential step matching from AE data)
- [ ] Funnel builder UI + results visualization

### Phase 6: Materialized Views (D1)

- [ ] Historical retention — daily rollups for data beyond 90-day AE window
- [ ] Pre-computed session duration / bounce rate at scale

### Phase 7: Advanced

- [ ] User journey (Sankey visualization)
- [ ] Conversion metrics (visits-to-conversion, time-to-conversion)
- [ ] Google Search Console integration

## Notes

- 17 AE queries total when all current routes called simultaneously
- AE SQL API: `POST accounts/{id}/analytics_engine/sql` — reads only, writes via Worker
- Stripe: restricted key (`rk_`), query on-demand, correlate via `metadata.cgd_visitor_id`
- Funnels: backend-only computation, no client SDK changes needed
- Env needed: `CF_ACCOUNT_ID`, `CF_API_TOKEN` (Account Analytics: Read scope)
