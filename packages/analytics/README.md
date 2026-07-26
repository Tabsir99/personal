# @tabsircg/analytics

Cookie-based, self-hosted web analytics. A small browser tracker sends pageviews, custom events, and identify calls to your own endpoint. Revenue is tracked separately, server-side, from Stripe.

The whole model is two steps:

1. **Load the tracker once.** From then on, pageviews are tracked automatically.
2. **Record events** using any of the methods in §2 — all of them require step 1.

---

## 1. Load the tracker

Do exactly one of these. Both boot the same tracker and start auto-tracking pageviews (initial load + SPA navigation).

**A. Script tag** — plain HTML, no build step:

```html
<script defer src="/cgd.js" data-website-id="your-site-id" data-domain="yourdomain.com"></script>
```

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
| `data-api-url`             | Override the event endpoint                | `https://admin.tabsircg.com/api/events` |
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

Cross-domain: these travel via URL params `_cgd_vid`, `_cgd_sid`, `_cgd_vfs`, `_cgd_vsn`.

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

---

## 6. Development

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
