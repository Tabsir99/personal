# @tabsircg/analytics

Cookie-based, self-hosted web analytics. A small browser tracker sends pageviews, custom events, and identify calls to your own endpoint. Revenue is tracked separately, server-side, from Stripe.

The whole model is two steps:

1. **Load the tracker once.** From then on, pageviews are tracked automatically.
2. **Record events** using any of the methods in §2 — all of them require step 1.

---

## 1. Load the tracker

Do exactly one of these. Both boot the same tracker and start auto-tracking pageviews (initial load + SPA navigation).

**A. Script tag** — plain HTML, no build step. Served straight off npm:

```html
<script
  defer
  src="https://unpkg.com/@tabsircg/analytics@1/dist/cgd.js"
  data-website-id="your-site-id"
  data-domain="yourdomain.com"
></script>
```

Self-hosting the file instead is fine — copy `dist/cgd.js` anywhere you like.
Where the script is served from no longer affects where events are sent; only
`data-api-url` does (§8).

**B. Bundled app** — import and init from npm:

```ts
import { init } from '@tabsircg/analytics/sdk';

export const analytics = init({
  websiteId: 'your-site-id',
  domain: 'yourdomain.com',
});
```

`data-website-id` / `websiteId` and `data-domain` / `domain` are required. Full option list in §5.

---

## 2. Record events

Everything below assumes the tracker from §1 is loaded.

### 2a. HTML attributes (no JavaScript)

Add attributes to any element. Fires on click:

```html
<button data-cgd-goal="signup" data-cgd-goal-source="hero">Sign up</button>
```

Fires when the element scrolls into view:

```html
<section data-cgd-scroll="pricing_seen" data-cgd-scroll-threshold="0.5"></section>
```

### 2b. JavaScript calls

Same actions, called from code. Use whichever matches how you loaded the tracker:

| Action        | Script tag (§1A)                               | Bundled app (§1B)                                 |
| ------------- | ---------------------------------------------- | ------------------------------------------------- |
| Custom event  | `cgd('signup', { plan: 'pro' })`               | `analytics.trackEvent('signup', { plan: 'pro' })` |
| Identify user | `cgd('identify', { user_id: 'usr_1', email })` | `analytics.identify('usr_1', { email })`          |
| Pageview      | fires automatically                            | `analytics.trackPageview()` (also automatic)      |

Identify links the current anonymous visitor to a known user; call it after login.

> **These two custom-event columns are not interchangeable on the wire.**
> `cgd(name, data)` and the §2a attributes send `type: "custom"` with the real
> name in `extraData.eventName`. `analytics.trackEvent(name, data)` sends
> `type: name` instead, with no `eventName`. Both land a row whose `event_name`
> is correct, so **funnels** (which match `event_name` alone) see either — but
> the dashboard's **goal catalog and journey filter both pin `type = 'custom'`**
> to hit the sort key, so `trackEvent()`-shaped rows never populate the goal
> pickers and never show under a journey goal filter. Until that is
> reconciled, prefer `cgd()` / attributes for anything you want to appear as a
> goal. Reserved types (`pageview`, `identify`, `payment`) are rejected by the
> endpoint with a 400 if passed to `trackEvent()`.

Pageviews are throttled: the same URL is not re-sent within 60 seconds
(persisted in `sessionStorage`, so it survives reloads).

### 2c. React helper (optional)

`<Track>` is **only sugar for §2a** — it writes the same `data-cgd-*` attributes onto its child and renders no DOM of its own. It still needs the tracker from §1 loaded; alone it does nothing.

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

## 3. Identify users (optional)

`identify` attaches a user id and profile to the visitor so later events are tied to a known person. Fields: `user_id` (required), plus any of `email`, `name`, `image`, and arbitrary string keys.

```ts
cgd('identify', { user_id: 'usr_1', email: 'a@b.com', name: 'Jane' });
// bundled: analytics.identify('usr_1', { email: 'a@b.com', name: 'Jane' });
```

---

## 4. Revenue attribution (optional, server-side)

Revenue is **not** sent by the browser. Your server creates the payment in Stripe; the admin Stripe webhook writes the revenue row. A payment is attributed to a visitor when its **PaymentIntent** carries `visitor_id` in `metadata`.

The visitor id is the cookie **`cgd_visitor_id`** (and session **`cgd_session_id`**), set by the tracker in §1. Read them from the incoming request on your server when you create the payment.

**One-time setup:** in the admin dashboard, add or edit the website and paste a Stripe **restricted key** (`rk_...`) with **Webhook Endpoints (write)** and **PaymentIntents (read)** permissions. The webhook is created for you.

**Per payment:** stamp the PaymentIntent's metadata once — that single stamp covers income, refunds, and disputes.

```ts
// Checkout Session — propagates to the PaymentIntent
await stripe.checkout.sessions.create({
  /* line_items, mode, ... */
  payment_intent_data: { metadata: { visitor_id, session_id } },
});

// or a raw PaymentIntent
await stripe.paymentIntents.create({
  /* amount, currency, ... */
  metadata: { visitor_id, session_id },
});
```

| Stripe event               | Effect              | Amount from | Attribution                           |
| -------------------------- | ------------------- | ----------- | ------------------------------------- |
| `payment_intent.succeeded` | `+ amount_received` | the event   | PaymentIntent metadata (direct)       |
| `charge.refunded`          | `− amount_refunded` | the event   | resolved from charge → PaymentIntent  |
| `charge.dispute.created`   | `− amount`          | the event   | resolved from dispute → PaymentIntent |

For refunds and disputes the webhook follows the charge/dispute back to its PaymentIntent and reads that metadata, so you never stamp the charge or dispute yourself. `visitor_id` is required, `session_id` optional; a missing `visitor_id` skips the row. Events are deduplicated by Stripe event id.

---

## 5. Configuration reference

### Script `data-*` attributes (§1A)

| Attribute                  | Description                                | Default                                 |
| -------------------------- | ------------------------------------------ | --------------------------------------- |
| `data-website-id`          | Site id — **required**                     | —                                       |
| `data-domain`              | Primary tracked domain — **required**      | —                                       |
| `data-api-url`             | Override the event endpoint                | `https://analytics.tabsircg.com`        |
| `data-allowed-hostnames`   | Comma-separated extra hosts (cross-domain) | ``                                      |
| `data-allow-localhost`     | Track on localhost                         | `false`                                 |
| `data-allow-file-protocol` | Track on `file://`                         | `false`                                 |
| `data-debug`               | Verbose logging                            | `false`                                 |
| `data-disable-console`     | Silence all tracker logs                   | `false`                                 |

### SDK `init(options)` (§1B)

Same fields, camelCased: `websiteId` (req), `domain` (req), `apiUrl?`, `allowedHostnames?: string[]`, `allowLocalhost?`, `debug?`, `disableConsole?`.

### Cookies

| Cookie                      | Purpose             | TTL    |
| --------------------------- | ------------------- | ------ |
| `cgd_visitor_id`            | Stable visitor id   | 365d   |
| `cgd_session_id`            | Session id          | 30 min |
| `cgd_visitor_first_seen_at` | First-seen ISO date | 365d   |
| `cgd_visitor_session_count` | Session counter     | 365d   |

Cross-domain: these travel via URL params `_cgd_vid`, `_cgd_sid`, `_cgd_vfs`, `_cgd_vsn` — see §7.

The cookie `domain` attribute is set to `.<data-domain>` when the current
hostname is that domain or a subdomain of it, otherwise to `.<current
hostname>`. So subdomains of the configured domain share one visitor id for
free; unrelated hostnames do not, which is what §7 exists to bridge.

### Event payload (POSTed to the endpoint)

```jsonc
{
  "type": "pageview | identify | custom",
  "websiteId": "...",
  "domain": "...",
  "href": "...",
  "referrer": "...",
  "visitorId": "...",
  "sessionId": "...",
  "visitorFirstSeenAt": "ISO",
  "visitorSessionNumber": 1,
  "viewport": { "width": 1920, "height": 1080 },
  "screenWidth": 1920,
  "screenHeight": 1080,
  "language": "en-US",
  "timezone": "America/New_York",
  "extraData": {},
}
```

`visitorFirstSeenAt` is sent and validated by the ingest Worker but has **no
column** in the `analytics_events` datasource — it is currently dropped at
ingest. Session recency is derived from `session_number` instead.

### Wire limits

The `extraData` rules live in one place — `EXTRA_DATA_*` in
`@tabsircg/schemas/analytics` — and are applied twice. The Worker's
`extraDataSchema` is the boundary that actually holds: violate it and the whole
payload 400s. The tracker mirrors the same numbers in `sanitizeEventData` so a
mistake surfaces as a console error at the call site instead of a silent
rejection you never see. The tracker's copy is a convenience, not a control;
anything posting straight to the Worker still has to satisfy the schema.

The SDK's copy of the numbers is asserted equal to the shared contract in its
test suite, so the two cannot drift.

| Field                            | Limit         | Enforced by                                                          |
| -------------------------------- | ------------- | -------------------------------------------------------------------- |
| `href`                           | 2000 chars    | tracker trims before sending; Worker rejects beyond                   |
| `type` (custom events)           | 64 chars      | Worker schema (rejects)                                               |
| derived `event_name`             | 255 chars     | Worker trims                                                          |
| `extraData` — value              | 1000 chars    | tracker trims; Worker rejects beyond                                  |
| `extraData` — whole object       | 4000 chars    | both reject beyond; Worker also drops trailing keys as a backstop, so what is stored is **always valid JSON** |
| `extraData` — key count          | 10            | both reject (`eventName` is exempt)                                   |
| `extraData` — key name           | 32 chars, `[a-z0-9_-]` | tracker lowercases then rejects; Worker rejects              |
| `extraData` — value type         | string        | both reject numbers, objects and arrays                               |
| viewport, screen, session number | 0–65535       | Worker clamps (columns are `UInt16`)                                  |

Every tracking entry point routes through `sanitizeEventData` — `cgd()`,
`analytics.trackEvent()`, `identify()`, `data-cgd-goal`, `data-cgd-scroll` and
the automatic `external_link` event. A payload that violates any rule above is
**not sent**, and the reason is logged to the console.

Values are trimmed and length-bounded but otherwise passed through verbatim.
The tracker does **not** strip markup or URL schemes from your values: it would
corrupt legitimate data (`?w=64&h=64` losing its `&`) while protecting nothing,
since anything bypassing the script skips it anyway. Escape on render, as the
dashboard does.

---

## 6. Excluding traffic (yourself, localhost, bots)

There is **no IP-based exclusion anywhere in this system.** The Worker records
`CF-Connecting-IP` into the `ip` column but no ingest path and no dashboard
query ever filters on it. Everything below is the full set of exclusions that
actually exist, in the order they apply.

| Exclusion               | Where                                      | Default | Override                                              |
| ----------------------- | ------------------------------------------ | ------- | ----------------------------------------------------- |
| **Your own browser**    | `localStorage['cgd_ignore'] === 'true'`    | off     | set it per browser/profile (see below)                |
| Localhost               | tracker refuses to boot                    | blocked | `data-allow-localhost="true"` / `allowLocalhost: true` |
| `file://`               | tracker refuses to boot                    | blocked | `data-allow-file-protocol="true"`                     |
| Inside an iframe        | tracker refuses to boot                    | blocked | `data-debug="true"`                                   |
| Headless / automation   | `bot.ts` heuristics, before the request     | blocked | —                                                     |
| Unregistered `Origin`   | Worker KV allowlist → 403 (see §8)          | blocked | register the origin on the website in admin           |
| Crawlers & bot UAs      | Worker tags `is_bot=1`; **row is still stored** | stored | dashboard queries filter `is_bot = 0`             |

**To stop recording your own visits**, run this once in the devtools console on
each browser profile and device you browse from:

```js
localStorage.setItem('cgd_ignore', 'true');   // re-enable: localStorage.removeItem('cgd_ignore')
```

It is checked in `sendEvent`, so it suppresses **every** event type — pageviews,
goals, and identify — before any network request is made. Caveats worth knowing:
it is per-origin and per-browser-profile (incognito, a second browser, and your
phone each need their own), and clearing site data clears it. There is no admin
UI for this flag and nothing in the codebase sets it.

Two things this does **not** do: it does not remove rows already recorded
(delete those in Tinybird), and because the check is client-side, it is a
convenience, not a security control.

If you ever want true IP exclusion, the place for it is `requestGuard.ts` in the
Worker — it already reads `CF-Connecting-IP` before anything is written, so an
allowlist check there would drop the event at ingest rather than at query time.

---

## 7. Cross-domain tracking

Cookies cannot cross a registrable domain, so the tracker hands the identity
over **in the link itself**. The trick is one config field plus one rule about
how you link.

1. **List the other host** on every site involved:

   ```html
   <script defer src="…" data-website-id="…" data-domain="example.com"
           data-allowed-hostnames="app.other.com,shop.other.com"></script>
   ```

   ```ts
   init({ websiteId: '…', domain: 'example.com',
          allowedHostnames: ['app.other.com', 'shop.other.com'] });
   ```

2. **Navigate by clicking a real `<a href>`.** On click (or Enter/Space) the
   tracker inspects the anchor and branches:

   | Target host                              | What happens                                                        |
   | ---------------------------------------- | ------------------------------------------------------------------- |
   | same host, or same registrable domain    | left alone — cookies already cover it                                |
   | listed in `allowedHostnames` (or `domain`) | `href` is **rewritten in place** with `_cgd_vid`, `_cgd_sid`, `_cgd_vfs`, `_cgd_vsn` |
   | anything else                            | recorded as an `external_link` goal, no params added                 |

3. **The landing page adopts the identity.** The tracker there reads those four
   params ahead of its own cookies, writes them to its cookies, then strips them
   from the URL via `history.replaceState` so they never reach your analytics
   `href` or get shared/bookmarked.

Consequences worth knowing:

- **It only works through anchor clicks.** A `window.location = …`, a form POST,
  a server redirect, or a QR code carries no params — the visitor is new on the
  other side. For those, append the four params yourself.
- **The allowlist is what flips the branch.** A host you forget to list is not
  merely un-stitched, it is actively logged as an outbound `external_link`.
- **Hostnames must match exactly** — `isInternalDomain` is a string equality
  check against `domain` and each `allowedHostnames` entry. No wildcards, and
  `app.other.com` does not cover `other.com`.
- Both sites must use the **same `websiteId`**, and both origins must be
  registered on that website in admin (§8), or the far side 403s.
- Subdomains of `data-domain` need no setup at all — the cookie is already
  written to `.<domain>`.

---

## 8. Endpoint and authorization

Events are `POST`ed as `Content-Type: text/plain` via `XMLHttpRequest`. That
content type is deliberate and load-bearing: it keeps the request CORS-simple so
no preflight is sent — the ingest Worker answers `POST` only and returns **405
for `OPTIONS`**, so switching to `application/json` would break ingest outright.

Resolution order for the endpoint, from `state.ts`:

| Condition                         | Endpoint used                                             |
| --------------------------------- | --------------------------------------------------------- |
| `data-api-url` / `apiUrl` set     | that value (relative is resolved against the page origin) |
| anything else                     | the built-in `API_URL`                                    |

`API_URL` is `https://analytics.tabsircg.com/api/events` — the ingest Worker.
The Worker itself routes on method, not path, and would accept `POST` anywhere
on that host; the `/api/events` path is kept deliberately so the endpoint stays
addressable by network-level rules (firewall, WAF, proxy allowlists) instead of
being a bare origin. **Where the script is loaded from does not influence
this.**
An earlier version inferred a self-hosted endpoint whenever the `<script src>`
host wasn't `admin.tabsircg.com`, which silently redirected events to
`<the visitor's own origin>/api/events`; that inference is gone. Self-hosting is
still fully supported — point `data-api-url` / `apiUrl` at your own collector.

Ingest is authorized by **`Origin`**, not by a token. The Worker looks up
`website_<websiteId>` in its KV namespace, expects a JSON array of allowed
origins, and 403s unless the request `Origin` is in it (or the array contains
`"*"`). Admin writes that key for you — `syncOriginsToKV` runs whenever a website
is created or its origins are edited. A website whose origins list is empty
rejects every event.

The Worker memoises each lookup in the isolate that served it, to avoid paying a
billed KV read per analytics event. That memo is **not** a single global cache —
each isolate (roughly, each colo, more under load) keeps its own and expires it
independently, so propagation is eventual:

| Lookup result       | Memo TTL | Why                                                    |
| ------------------- | -------- | ------------------------------------------------------ |
| website found       | 60 s     | matches KV's own edge-cache TTL, so nothing is staler than KV already is |
| website not found   | 10 s     | still collapses a flood of bogus IDs into one read, without making a newly-created site wait |

So an origin edit in admin takes up to ~60 s to apply everywhere, and a brand
new website starts accepting events within ~10 s.

---

## 9. Development

```bash
pnpm build       # tsup → dist/ (cgd.js IIFE, sdk.js, react.js)
pnpm typecheck   # tsc --noEmit
```

| File         | Role                                                       |
| ------------ | ---------------------------------------------------------- |
| `index.ts`   | Script-tag entry; installs `window.cgd`, boots the tracker |
| `sdk.ts`     | `init()` entry for bundled apps                            |
| `react.tsx`  | `<Track>` attribute helper                                 |
| `config.ts`  | Reads `data-*` / SDK overrides                             |
| `events.ts`  | `trackPageview` / `trackCustomEvent` / `trackIdentify`     |
| `tracker.ts` | Builds and POSTs the payload                               |
| `storage.ts` | Cookie state + cross-domain URL params                     |
| `dom.ts`     | Goal + scroll attribute observers                          |
| `spa.ts`     | `pushState` / `popstate` pageview hijack                   |
| `bot.ts`     | Headless / bot filtering                                   |
