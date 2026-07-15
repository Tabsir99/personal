# Analytics Architecture Reference

## Stack

| Layer | Our implementation | DataFast equivalent |
|-------|-------------------|-------------------|
| Event store | CF Analytics Engine (ClickHouse-based) | Tinybird (managed ClickHouse) |
| App config | Firestore | MongoDB |
| Ingestion | CF Worker at `analytics.tabsircg.com` | Their script + backend |
| Dashboard API | Next.js route handlers → AE SQL API | Express → Tinybird API |
| Client SDK | `@tabsircg/analytics` | Their script (we forked/adapted from it) |

## AE Data Schema

```
indexes[0] = websiteId (partition key)

blobs:  1=websiteId, 2=type, 3=domain, 4=href, 5=referrer, 6=visitorId,
        7=sessionId, 8=language, 9=timezone, 10=eventName, 11=extraData(JSON),
        12=country, 13=region, 14=city, 15=userAgent, 16=ip

doubles: 1=viewportW, 2=viewportH, 3=screenW, 4=screenH, 5=visitorSessionNumber, 6=timestamp(ms)
```

## Query Patterns

All queries hit AE SQL API live: `POST accounts/{CF_ACCOUNT_ID}/analytics_engine/sql`

Token scope: Account Analytics: Read. Env vars: `CF_ACCOUNT_ID`, `CF_API_TOKEN`.

Current total: 17 queries across all routes when called simultaneously.

## Key Decisions

1. **Live queries only** (no pre-aggregation) — same as DataFast/Tinybird. Works at our scale.
2. **No extra Worker for reads** — AE SQL API is a universal REST endpoint.
3. **Stripe integration** — restricted key (`rk_`), query Stripe API on-demand, correlate payments to visitors via `metadata.cgd_visitor_id` on checkout sessions.
4. **Funnels** — defined in Firestore, computed server-side from AE events. No client SDK changes.
5. **D1 only if/when needed** — for historical retention (>90 days) or expensive cross-session computations at scale.

## What the SDK already collects (relevant to unbuilt features)

- **UTM params** — stored inside `F.href` (the full URL including query string). Sources route can parse `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` out of it. Not a SDK limitation, just needs server-side parsing.
- **Crawler/bot UAs** — the SDK's `isBot()` only blocks automation tools (Selenium, Puppeteer, curl). Real crawlers (Googlebot, GPTBot, ClaudeBot, Bingbot, etc.) pass through normally. Their full UA is stored in `F.userAgent`. A crawlers endpoint just needs UA pattern matching to categorize: `search_index`, `answer_fetch`, `training`, `ai_crawler`.
- **Full referrer URL** — `document.referrer` stored as-is in `F.referrer`. Contains domain + path.

## Session & Identity Model

- `cgd_visitor_id` cookie (365 days) — persistent visitor identifier
- `cgd_session_id` cookie (30-min sliding) — session boundary
- `identify` event links anonymous visitorId → app user ID via extraData
- Cross-domain: URL params `_cgd_vid`, `_cgd_sid` carry visitor across allowed hostnames
- Revenue correlation: visitorId in Stripe checkout `metadata` or `session_id` URL param on return

## API Routes (all JWT-protected)

| Route | Queries | Purpose |
|-------|---------|---------|
| `/api/analytics/main` | 5 | Overview + previous period + timeseries |
| `/api/analytics/pages` | 2 | Top pages + entry pages |
| `/api/analytics/sources` | 1 | Referrers + channel classification |
| `/api/analytics/locations` | 3 | Country/region/city (drill-down filters) |
| `/api/analytics/system` | 1 | Browser/OS/device from UA parsing |
| `/api/analytics/events` | 2 | Custom events + conversion rates |
| `/api/analytics/realtime` | 1 | Active visitors (last 10 min) |
| `/api/analytics/hostnames` | 1 | Per-domain breakdown |
| `/api/analytics/exit-links` | 1 | Outbound link clicks |

All accept `?websiteId=&period=&granularity=`. Locations also accepts `?country=&region=` for drill-down.
