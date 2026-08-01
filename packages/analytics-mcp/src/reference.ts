export const REFERENCE = `# Instrumenting a site with @tabsircg/analytics

## Install one way, not both

Script tag - self-initialising, and the only mode that gets the declarative
attributes and automatic outbound-link tracking:

    <script defer src="https://unpkg.com/@tabsircg/analytics@2" data-website-id="ID" data-domain="example.com"></script>

SDK - for typed calls, callbacks, or when a bundler owns your scripts:

    import { init } from '@tabsircg/analytics/sdk';
    const analytics = init({ websiteId: 'ID', domain: 'example.com' });

Both at once double every pageview.

### Script tag attributes

| Attribute | Effect |
| --- | --- |
| data-website-id | required |
| data-domain | required, the primary hostname |
| data-allowed-hostnames | comma separated. Other hosts you own; enables cross-domain visitor handoff |
| data-api-url | override the ingest endpoint; relative is resolved against the page origin |
| data-allow-localhost | "true" to record localhost. Off by default |
| data-allow-file-protocol | "true" to record file:// pages. Off by default |
| data-allow-iframe | "true" to run inside a frame. Off by default |
| data-debug | "true" for verbose logging. Also implicitly permits iframes |
| data-disable-console | "true" to silence the tracker entirely |

init() takes the same settings as camelCase options: websiteId, domain,
allowedHostnames, apiUrl, allowLocalhost, allowIframe, debug, disableConsole.
There is no allowFileProtocol in SDK mode.

Tracking silently disables itself, in this order, when: a bot is detected, the
page is localhost or file:// without the matching opt-in, the page is framed
without allowIframe or debug, or websiteId/domain are missing.

## Never send these - they are collected for you

href, referrer, viewport, screen size, language, timezone, visitor id, session id,
session number. Putting any of them in your properties wastes the 10-property
budget for nothing.

Pageviews fire on load and on every SPA route change (pushState, replaceState,
popstate). Routes are compared by pathname only, so ?tab=b after ?tab=a is not a
new pageview. A repeat of the same URL within 60 seconds is throttled.

## Custom events

    analytics.trackEvent('checkout_completed', { plan: 'pro', seats: '4' });

Script-tag mode exposes the same thing as a global, safe to call before the
script loads:

    cgd('checkout_completed', { plan: 'pro' });
    cgd('identify', { user_id: 'u_123', name: 'Jane' });

The type column is always "custom". The name lands in extra_data.eventName and
becomes event_name in Tinybird, which is what the dashboard groups goals by.
Never put the name in the type column.

## Declarative attributes (script tag only)

Click goals. Fire on click and on Enter/Space, from the nearest ancestor
carrying the attribute:

    <button data-cgd-goal="signup" data-cgd-goal-plan="pro">Sign up</button>

Scroll goals. Fire when the element reaches the visibility threshold:

    <section data-cgd-scroll="pricing_seen"
             data-cgd-scroll-threshold="0.75"
             data-cgd-scroll-delay="1000"
             data-cgd-scroll-variant="b"></section>

| Attribute | Value |
| --- | --- |
| data-cgd-goal | goal name |
| data-cgd-goal-<prop> | extra property |
| data-cgd-scroll | goal name |
| data-cgd-scroll-threshold | **fraction 0 to 1**, default 0.5. NOT a percentage - 75 is rejected with a console warning and falls back to 0.5 |
| data-cgd-scroll-delay | milliseconds the element must stay visible before firing, default 0 |
| data-cgd-scroll-<prop> | extra property |

Two things that will surprise you:

- Dashes in a property attribute become underscores. data-cgd-goal-user-tier
  arrives as user_tier. This is how you satisfy the /^[a-z0-9_-]+$/ key rule
  from HTML, where camelCase is not available.
- A scroll event automatically carries scroll_percentage, threshold and delay.
  That is 3 of your 10 properties spent before you add any of your own.

Scroll goals re-arm: leaving the viewport resets the element, so scrolling back
fires again. Elements added to the DOM later are picked up automatically.

## Outbound links (script tag only)

Clicking an anchor to a different site does one of three things:

- same site, or a subdomain of it: nothing.
- a host listed in data-allowed-hostnames: no event. The link is rewritten with
  _cgd_vid, _cgd_sid and _cgd_vsn so the visitor stays one visitor across your
  domains. The receiving page must also run the tracker.
- anywhere else: an event with type "external_link" carrying url and text.

Note "external_link" is its own type column value, not "custom". Do not pass it
to trackEvent.

## React

    import { Track } from '@tabsircg/analytics/react';

    <Track type="goal" name="signup" data={{ source: 'hero' }}>
      <button>Sign up</button>
    </Track>

    <Track type="scroll" name="pricing_seen" threshold={0.5} delay={1000}>
      <section>...</section>
    </Track>

Headless - it clones its child and adds the data attributes, rendering no extra
DOM. It needs the script tag present, because it only writes attributes; the
listeners come from script-tag mode.

## Identify and revenue

    analytics.identify('user-123', { name: 'Jane', image: 'https://...' });

Requires a non-empty user id. Links the anonymous visitor to a known user.

For revenue, stamp the visitor id onto the Stripe PaymentIntent metadata at
checkout. The webhook reads it back and writes the payment against the same
visitor:

    metadata: { visitor_id: <cgd_visitor_id cookie>, session_id: <cgd_session_id cookie> }

## Property rules - the Worker enforces these and rejects the whole event

| Rule | Limit |
| --- | --- |
| property count | 10 (eventName exempt) |
| property name | 1-32 chars, /^[a-z0-9_-]+$/ |
| value | string, 1000 chars |
| whole object | 4000 chars serialised |

The tracker lowercases keys and stringifies values before sending, so
{ itemCount: 3 } arrives as { itemcount: "3" }. It does NOT validate - a key with
a dot or a space passes the tracker and is refused by the Worker with a 400 that
loses the entire event. Run validate_event before writing the call.

## Callbacks

trackPageview, trackEvent and identify each take an optional callback that fires
exactly once. Declarative attributes and the cgd() global cannot take one.

| outcome | meaning |
| --- | --- |
| delivered | reached Tinybird |
| rejected | Worker refused it - carries the HTTP status |
| failed | request never completed |
| disabled | bot, localhost, iframe, or the cgd_ignore localStorage flag |
| throttled | same URL within 60s |
| invalid | no websiteId or domain configured |

Only delivered means it was recorded. Events use fetch keepalive, so they survive
the page unloading - never await one before navigating.

Set localStorage cgd_ignore = "true" in a browser to exclude yourself.
`;
