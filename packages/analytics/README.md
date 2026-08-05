# @tabsircg/analytics

Cookie-based, self-hosted web analytics. A browser tracker sends pageviews, custom events and identify calls to your own endpoint. Revenue is tracked server-side from Stripe.

1. **Load the tracker once** — pageviews are then automatic.
2. **Record events** with any method in §2.

---

## 1. Load the tracker

Do one of these. Both boot the same tracker and auto-track pageviews (initial load + SPA navigation).

**A. Script tag** — no build step:

```html
<script
  defer
  src="https://unpkg.com/@tabsircg/analytics@1/dist/cgd.js"
  data-website-id="your-site-id"
  data-domain="yourdomain.com"
></script>
```

**B. Bundled app**:

```ts
import { init } from '@tabsircg/analytics/sdk';

export const analytics = init({ websiteId: 'your-site-id', domain: 'yourdomain.com' });
```

Website id and domain are required; full options in §5. Self-hosting `dist/cgd.js` is fine — where the script is served from does not affect where events go, only `data-api-url` does (§8).

---

## 2. Record events

Requires the tracker from §1.

### 2a. HTML attributes

```html
<button data-cgd-goal="signup" data-cgd-goal-source="hero">Sign up</button>
<section data-cgd-scroll="pricing_seen" data-cgd-scroll-threshold="0.5"></section>
```

Goals fire on click, scroll events when the element enters the viewport.

### 2b. JavaScript

| Action        | Script tag (§1A)                               | Bundled app (§1B)                                 |
| ------------- | ---------------------------------------------- | ------------------------------------------------- |
| Custom event  | `cgd('signup', { plan: 'pro' })`               | `analytics.trackEvent('signup', { plan: 'pro' })` |
| Identify user | `cgd('identify', { user_id: 'usr_1', email })` | `analytics.identify('usr_1', { email })`          |
| Pageview      | automatic                                      | `analytics.trackPageview()` (also automatic)      |

All four routes to a custom event — `cgd()`, `trackEvent()`, §2a attributes, §2c `<Track>` — send the identical wire shape: `type: "custom"` with the name in `extraData.eventName`. The stored row is the same either way.

> `type` is the third column of the Tinybird sorting key, so it holds a fixed set (`pageview`, `custom`, `identify`, `external_link`, `payment`) rather than your event names — hence the name travels in `extraData.eventName` and lands in `event_name`.
>
> **Rows written before this was unified keep `type: <event name>`.** They appear in the goals chart (`type != 'pageview'`) but not the goal catalog or journey filter (`type = 'custom'`). Only a backfill fixes those.

Pageviews are throttled: the same URL is not re-sent within 60s (persisted in `sessionStorage`).

### 2c. React helper

`<Track>` is sugar for §2a — it writes `data-cgd-*` onto its child and renders no DOM of its own.

```tsx
import { Track } from '@tabsircg/analytics/react';

<Track type="goal" name="signup" data={{ source: 'hero' }}>
  <button>Sign up</button>
</Track>

<Track type="scroll" name="pricing_seen" threshold={0.5}>
  <section id="pricing" />
</Track>
```

---

## 3. Identify users

Attaches a user id and profile so later events tie to a known person. `user_id` required; `email`, `name`, `image` and arbitrary string keys optional. Call it after login.

```ts
cgd('identify', { user_id: 'usr_1', email: 'a@b.com', name: 'Jane' });
```

---

## 4. Revenue attribution (server-side)

Revenue is **not** sent by the browser. Your server creates the payment; the admin Stripe webhook writes the row. A payment is attributed when its **PaymentIntent** carries `visitor_id` in `metadata`.

The ids live in cookies `cgd_visitor_id` and `cgd_session_id` — read them from the incoming request when you create the payment.

**Setup once:** in admin, add a Stripe **restricted key** (`rk_...`) with **Webhook Endpoints (write)** and **PaymentIntents (read)**. The webhook is created for you.

```ts
await stripe.checkout.sessions.create({
  payment_intent_data: { metadata: { visitor_id, session_id } },
});

await stripe.paymentIntents.create({ metadata: { visitor_id, session_id } });
```

| Stripe event               | Effect              | Attribution                           |
| -------------------------- | ------------------- | ------------------------------------- |
| `payment_intent.succeeded` | `+ amount_received` | PaymentIntent metadata (direct)       |
| `refund.created`           | `− refund.amount`   | resolved from refund → PaymentIntent  |
| `charge.dispute.created`   | `− amount`          | resolved from dispute → PaymentIntent |

Refunds and disputes resolve back to their PaymentIntent, so you never stamp them yourself. Missing `visitor_id` skips the row; `session_id` is optional. Deduplicated by Stripe event id.

---

## 5. Configuration reference

### Script `data-*` attributes

| Attribute                  | Description                                | Default                          |
| -------------------------- | ------------------------------------------ | -------------------------------- |
| `data-website-id`          | Site id — **required**                     | —                                |
| `data-domain`              | Primary tracked domain — **required**      | —                                |
| `data-api-url`             | Override the event endpoint                | `https://analytics.tabsircg.com` |
| `data-allowed-hostnames`   | Comma-separated extra hosts (cross-domain) | ``                               |
| `data-allow-localhost`     | Track on localhost                         | `false`                          |
| `data-allow-file-protocol` | Track on `file://`                         | `false`                          |
| `data-allow-iframe`        | Track when framed                          | `false`                          |
| `data-debug`               | Verbose logging                            | `false`                          |
| `data-disable-console`     | Silence all tracker logs                   | `false`                          |

SDK `init(options)` takes the same fields camelCased, with `allowedHostnames` as `string[]`.

### Cookies

| Cookie                      | Purpose           | TTL    |
| --------------------------- | ----------------- | ------ |
| `cgd_visitor_id`            | Stable visitor id | 365d   |
| `cgd_session_id`            | Session id        | 30 min |
| `cgd_visitor_session_count` | Session counter   | 365d   |

The cookie `domain` is `.<data-domain>` when the current hostname is that domain or a subdomain, otherwise `.<current hostname>`. Subdomains share one visitor id for free; unrelated hostnames need §7.

### Event payload

```jsonc
{
  "type": "pageview | identify | custom",
  "websiteId": "...",
  "domain": "...",
  "href": "...",
  "referrer": "...",
  "visitorId": "...",
  "sessionId": "...",
  "visitorSessionNumber": 1,
  "viewport": { "width": 1920, "height": 1080 },
  "screenWidth": 1920,
  "screenHeight": 1080,
  "language": "en-US",
  "timezone": "America/New_York",
  "extraData": {},
}
```

New versus returning is derived from `session_number` — a visitor whose minimum session number in the window is `1` is new. There is no separate first-seen field.

### Wire limits

The `extraData` rules live in `EXTRA_DATA_*` in `@tabsircg/schemas/analytics` and are enforced in exactly one place: the Worker's `extraDataSchema`. Violate it and the whole payload 400s; the event callback reports `rejected`.

**The tracker does not validate — it marshals.** `toEventData` lowercases keys, stringifies values and bounds their length, then sends whatever you gave it. A rule the browser enforces is a rule anyone can skip by posting to the Worker directly. The SDK publishes the numbers as constants and its tests assert they equal the shared contract, so published limits cannot drift from enforced ones.

| Field                            | Limit                  | Enforced by                                                       |
| -------------------------------- | ---------------------- | ----------------------------------------------------------------- |
| `href`                           | 2000 chars             | tracker trims; Worker rejects beyond                              |
| `type` (custom events)           | 64 chars               | Worker rejects                                                    |
| derived `event_name`             | 255 chars              | Worker trims                                                      |
| `extraData` — value              | 1000 chars             | tracker trims; Worker rejects beyond                              |
| `extraData` — whole object       | 4000 chars             | Worker rejects, drops trailing keys as a backstop (always valid JSON) |
| `extraData` — key count          | 10                     | Worker rejects (`eventName` exempt)                               |
| `extraData` — key name           | 32 chars, `[a-z0-9_-]` | tracker lowercases; Worker rejects                                |
| `extraData` — value type         | string                 | tracker stringifies; Worker rejects non-strings                   |
| `visitorId`, `sessionId`         | 100 chars              | Worker rejects; tracker drops an over-length handoff id           |
| viewport, screen, session number | 0–65535                | Worker clamps (`UInt16` columns)                                  |

Every entry point routes through `toEventData`, so they all put the same shape on the wire. Values are trimmed and length-bounded but otherwise passed through verbatim — the tracker does **not** strip markup or URL schemes, which would corrupt legitimate data (`?w=64&h=64` losing its `&`) while protecting nothing. Escape on render, as the dashboard does.

The one thing the tracker refuses is an over-length `_cgd_vid` / `_cgd_sid` handoff param, and it is not a security check: the handoff writes straight into a 365-day cookie, so one bad link would 400 every event from that browser for a year. It is rejected on the way in and again when reading the cookie back.

---

## 6. Excluding traffic

There is **no IP-based exclusion anywhere in this system.** The Worker records `CF-Connecting-IP` but no ingest path or dashboard query filters on it. The full set of exclusions, in order:

| Exclusion             | Where                                                             | Default | Override                                               |
| --------------------- | ----------------------------------------------------------------- | ------- | ------------------------------------------------------ |
| **Your own browser**  | `localStorage['cgd_ignore'] === 'true'`                           | off     | set per browser/profile (below)                        |
| Localhost             | tracker refuses to boot                                           | blocked | `data-allow-localhost="true"` / `allowLocalhost: true` |
| `file://`             | tracker refuses to boot                                           | blocked | `data-allow-file-protocol="true"`                      |
| Inside an iframe      | tracker refuses to boot                                           | blocked | `data-allow-iframe="true"` / `allowIframe: true`       |
| Headless / automation | `bot.ts` heuristics, before the request                           | blocked | —                                                      |
| Unregistered `Origin` | Worker KV allowlist → 403 (§8)                                    | blocked | register the origin in admin                           |
| Crawlers & bot UAs    | tagged `is_bot=1` by the middleware (§9); **row is still stored** | stored  | dashboard queries filter `is_bot = 0`                  |

To stop recording your own visits, run this once per browser profile and device:

```js
localStorage.setItem('cgd_ignore', 'true'); // re-enable: localStorage.removeItem('cgd_ignore')
```

Checked in `sendEvent`, so it suppresses every event type before any network request. It is per-origin and per-profile (incognito, a second browser and your phone each need their own), and clearing site data clears it. There is no admin UI for it. It does not remove rows already recorded, and being client-side it is a convenience, not a security control.

For true IP exclusion the place is `requestGuard.ts` in the Worker — it already reads `CF-Connecting-IP` before anything is written.

---

## 7. Cross-domain tracking

Cookies cannot cross a registrable domain, so the tracker hands identity over **in the link itself**.

1. **List the other host** on every site involved:

   ```html
   <script defer src="…" data-website-id="…" data-domain="example.com"
     data-allowed-hostnames="app.other.com,shop.other.com"></script>
   ```

   ```ts
   init({ websiteId: '…', domain: 'example.com', allowedHostnames: ['app.other.com', 'shop.other.com'] });
   ```

2. **Navigate by clicking a real `<a href>`.** On click (or Enter/Space) the tracker inspects the anchor:

   | Target host                                                   | What happens                                                             |
   | ------------------------------------------------------------- | ------------------------------------------------------------------------ |
   | same host, a sub/parent domain, or both under a declared host | left alone — cookies already cover it                                    |
   | listed in `allowedHostnames` (or `domain`)                    | `href` is **rewritten in place** with `_cgd_vid`, `_cgd_sid`, `_cgd_vsn` |
   | anything else                                                 | recorded as an `external_link` goal, no params added                     |

3. **The landing page adopts the identity** — reads those params ahead of its own cookies, writes them to cookies, then strips them via `history.replaceState`.

Consequences:

- **Only anchor clicks work.** `window.location = …`, form POSTs, server redirects and QR codes carry no params; append them yourself.
- **A host you forget to list** is not merely un-stitched — it is logged as an outbound `external_link`.
- **Hostnames match exactly.** `isInternalDomain` is string equality. No wildcards; `app.other.com` does not cover `other.com`.
- Both sites need the **same `websiteId`**, and both origins registered in admin (§8), or the far side 403s.
- Subdomains of `data-domain` need no setup.

---

## 8. Endpoint and authorization

Events are `POST`ed as `Content-Type: text/plain`. That is load-bearing: it keeps the request CORS-simple so no preflight is sent — the Worker answers `POST` only and returns **405 for `OPTIONS`**, so `application/json` would break ingest outright.

Transport is `fetch(…, { keepalive: true })`, which completes even if the document is torn down mid-flight, so an event fired on a click that navigates away is not lost. `sendBeacon` gives the same guarantee but returns only a queued boolean, and the response status is what `EventCallback` reports. There is no fallback transport — keepalive has shipped in every engine since July 2021, and the bundle targets ES2020.

Two keepalive constraints: all in-flight keepalive requests share a **64 KB body budget** per document, and `credentials` is `omit` so no cookies travel. Neither binds here, but a much larger `extraData` budget would need rechecking.

### Event callbacks

`trackPageview`, `trackEvent` and `identify` each take an optional callback that fires **exactly once on every path**, including those where nothing is sent, so it is safe to await before navigating.

| `outcome`   | Meaning                                                         | `status`        |
| ----------- | --------------------------------------------------------------- | --------------- |
| `delivered` | Worker accepted it                                              | `200`           |
| `rejected`  | Worker refused it — validation, unknown site, bad origin        | the HTTP status |
| `failed`    | Request never completed (offline, DNS, blocked)                 | `0`             |
| `disabled`  | Not sent: bot, localhost, iframe, or `cgd_ignore`               | `0`             |
| `throttled` | Not sent: same URL within 60s                                   | `0`             |
| `invalid`   | Not sent: no `websiteId`/`domain`, so no payload could be built | `0`             |

Only `delivered` means the event reached Tinybird. Malformed `extraData` comes back as `rejected`, not `invalid` — the tracker sends it and lets the Worker rule.

### Endpoint resolution

`data-api-url` / `apiUrl` wins if set (relative resolves against the page origin); otherwise the built-in `API_URL`, `https://analytics.tabsircg.com/api/events`. The Worker routes on method, not path, and would accept `POST` anywhere on that host; the path is kept so the endpoint stays addressable by firewall/WAF rules. **Where the script is loaded from does not influence this** — an earlier version inferred a self-hosted endpoint from the `<script src>` host and silently redirected events; that is gone.

### Authorization

By **`Origin`**, not a token. The Worker looks up `website_<websiteId>` in KV, expects a JSON array of allowed origins, and 403s unless the request `Origin` is in it (or the array contains `"*"`). Admin writes that key via `syncOriginsToKV` whenever a website is created or its origins are edited. An empty origins list rejects every event.

Each lookup is memoised in the isolate that served it to avoid a billed KV read per event. This is **not** a global cache — each isolate keeps its own and expires independently, so propagation is eventual:

| Lookup result     | Memo TTL | Why                                                             |
| ----------------- | -------- | --------------------------------------------------------------- |
| website found     | 60 s     | matches KV's own edge-cache TTL                                 |
| website not found | 10 s     | collapses a flood of bogus IDs without making a new site wait   |

So an origin edit takes up to ~60s to apply everywhere; a new website starts accepting events within ~10s.

---

## 9. Crawler tracking (`@tabsircg/analytics/middleware`)

The browser tracker cannot see crawlers. GPTBot, ClaudeBot, CCBot, PerplexityBot and every social unfurler request the HTML and leave — no JavaScript runs, so no event is sent. Only crawlers that render (Googlebot's WRS, Bingbot, Lighthouse) would reach ingest through the tracker.

The middleware closes that gap from the server: it reads the request `User-Agent`, and on a known crawler posts one event to the same endpoint with `is_bot = 1`. Human traffic costs one lowercased substring scan and **no network call**.

This is the only thing that writes `is_bot = 1`. The Worker does no bot classification, so a crawler that both fetches and renders is counted once.

### Next.js

```ts
// proxy.ts
import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import { trackCrawler } from '@tabsircg/analytics/middleware';

export function proxy(request: NextRequest, event: NextFetchEvent) {
  trackCrawler(request, event, { websiteId: 'your-website-id' });
  return NextResponse.next();
}

export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'] };
```

Do **not** `await` it. Passing `event` schedules the POST with `event.waitUntil` and returns synchronously. To wrap an existing proxy, use `withCrawlerTracking(handler, config)`.

### Express

```ts
import { expressCrawlerMiddleware } from '@tabsircg/analytics/middleware';

app.use(expressCrawlerMiddleware({ websiteId: 'your-website-id' }));
```

Calls `next()` immediately; the POST is left in flight.

### Hono

```ts
import { honoCrawlerMiddleware } from '@tabsircg/analytics/middleware';

app.use('*', honoCrawlerMiddleware({ websiteId: 'your-website-id' }));
```

Uses `c.executionCtx.waitUntil` when the runtime provides one.

### Skipped before any network call

Non-`GET`/`HEAD` methods, unrecognised user agents, subresource requests (`Sec-Fetch-Dest` of `image`, `script`, `style`, …), and anything `shouldTrack` rejects.

**Path and extension filtering is not built in** — your framework's matcher already scopes which requests reach the middleware. If you want it anyway, `ignoreStaticPaths` is an opt-in preset covering `/api`, `/_next`, `/static` and ~32 static extensions, with `/robots.txt`, `/llms.txt`, `/llms-full.txt` and `sitemap*.xml` exempt:

```ts
import { ignoreStaticPaths, trackCrawler } from '@tabsircg/analytics/middleware';

trackCrawler(request, event, { websiteId: '…', shouldTrack: ignoreStaticPaths });
```

### Config

| Option                      | Default                     | Purpose                                                    |
| --------------------------- | --------------------------- | ---------------------------------------------------------- |
| `websiteId`                 | required                    | Same id the browser tracker uses                           |
| `ingestToken`               | required                    | Shared secret; must equal the Worker's `INGEST_TOKEN`      |
| `apiUrl`                    | the shared ingest endpoint  | Override for self-hosted ingest                            |
| `domain`                    | request hostname            | Value written to the `domain` column                       |
| `publicOrigin`              | —                           | Rebuild URLs when the runtime exposes an internal hostname |
| `enabled`                   | `true`                      | Kill switch without touching middleware code               |
| `excludeCategories`         | —                           | Drop whole categories, e.g. `['tooling', 'monitoring']`    |
| `methods`                   | `['GET', 'HEAD']`           | Methods worth recording                                    |
| `shouldTrack(url, crawler)` | —                           | Path policy; pass `ignoreStaticPaths` or your own          |
| `getIp(request)`            | standard forwarding headers | Override crawler IP extraction                             |
| `timeoutMs`                 | `1500`                      | Abort the ingest POST                                      |
| `debug`                     | `false`                     | Log dropped events                                         |

`classifyCrawler(userAgent)` is exported on its own for the `{ name, category }` verdict without sending anything.

### Authorization

Unlike the browser tracker, this path is server-to-server, so it authenticates with a shared secret rather than `Origin` alone. Set `ingestToken` in the config and the same value as the Worker's `INGEST_TOKEN` secret (`wrangler secret put INGEST_TOKEN`). The middleware sends it as `X-Ingest-Token`; the Worker rejects any payload carrying a `bot` object without a match, so crawl rows cannot be forged by anyone who merely knows a `websiteId`.

Origin is still checked as for browser events (§8), so the website's origin must also be registered.

---

## 10. Development

```bash
pnpm build       # tsup → dist/ (cgd.js IIFE, sdk.js, react.js, middleware.js)
pnpm tc          # tsc --noEmit
```

| File          | Role                                                       |
| ------------- | ---------------------------------------------------------- |
| `index.ts`    | Script-tag entry; installs `window.cgd`, boots the tracker |
| `sdk.ts`      | `init()` entry for bundled apps                            |
| `react.tsx`   | `<Track>` attribute helper                                 |
| `config.ts`   | Reads `data-*` / SDK overrides                             |
| `events.ts`   | `trackPageview` / `trackCustomEvent` / `trackIdentify`     |
| `tracker.ts`  | Builds and POSTs the payload                               |
| `storage.ts`  | Cookie state + cross-domain URL params                     |
| `dom.ts`      | Goal + scroll attribute observers                          |
| `spa.ts`      | `pushState` / `popstate` pageview hijack                   |
| `bot.ts`      | Headless / automation filtering, browser-side              |
| `middleware/` | Server-side crawler tracking (§9); no browser code         |
