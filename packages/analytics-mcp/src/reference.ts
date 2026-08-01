export const REFERENCE = `# Instrumenting a site with @tabsircg/analytics

## Install one way, not both

Script tag - no build step, adds automatic outbound-link and declarative goal tracking:

    <script defer src="https://unpkg.com/@tabsircg/analytics" data-website-id="YOUR_ID" data-domain="example.com"></script>

SDK - when you need typed calls or a callback:

    import { init } from '@tabsircg/analytics/sdk';
    const analytics = init({ websiteId: 'YOUR_ID', domain: 'example.com' });

Both at once double every pageview.

## Never send these - they are collected for you

href, referrer, viewport, screen size, language, timezone, visitor id, session id,
session number. Pageviews fire on load and on every SPA route change (pushState,
replaceState, popstate). Putting any of them in extraData wastes the 10-property
budget.

Route changes are compared by pathname only, so ?tab=b after ?tab=a is not a new
pageview. A repeat of the same URL within 60 seconds is throttled.

## Custom events

    analytics.trackEvent('checkout_completed', { plan: 'pro', seats: '4' });

The type column is always "custom". The name you pass lands in extra_data.eventName
and becomes event_name in Tinybird, which is what the dashboard groups goals by.
Do not try to put the name in the type column.

Declarative equivalent, no JS:

    <button data-cgd-goal="signup" data-cgd-goal-plan="pro">Sign up</button>
    <section data-cgd-scroll="read_article" data-cgd-scroll-threshold="75"></section>

## extraData rules - enforced by the Worker, which returns 400 for the whole event

| Rule | Limit |
| --- | --- |
| property count | 10 (eventName exempt) |
| property name | 1-32 chars, /^[a-z0-9_-]+$/ |
| value | string, 1000 chars |
| whole object | 4000 chars serialised |

The tracker lowercases your keys and stringifies your values before sending, so
{ itemCount: 3 } arrives as { itemcount: "3" }. It does NOT validate - a key with
a dot or a space passes the tracker and is refused by the Worker. Use the
validate_event tool before writing the call.

## Identifying a user

    analytics.identify('user-123', { name: 'Jane', image: 'https://...' });

Requires a non-empty user id. Links the anonymous visitor id to a known user.

For revenue, stamp the visitor id onto the Stripe PaymentIntent metadata at
checkout; the webhook reads it back and writes the payment row against the same
visitor.

    metadata: { visitor_id: <the cgd_visitor_id cookie>, session_id: <cgd_session_id> }

## Callbacks

Every entry point takes an optional callback that fires exactly once:

| outcome | meaning |
| --- | --- |
| delivered | reached Tinybird |
| rejected | Worker refused it - carries the HTTP status |
| failed | request never completed |
| disabled | bot, localhost, iframe, or the cgd_ignore flag |
| throttled | same URL within 60s |
| invalid | no websiteId or domain configured |

Only delivered means the event was recorded. Events are sent with fetch keepalive,
so they survive the page unloading; you do not need to await one before navigating.

## Config flags to leave off in production

allowLocalhost records dev traffic as real visits. allowIframe lets the tracker run
inside embeds. debug logs every event to the console.
`;
