# analytics-worker backlog

## Seed still only emits `kind: "charge"`

`src/scripts/seed.ts` hardcodes `kind: "charge"` and draws `revenue_cents` from
`COFFEE_AMOUNTS_CENTS`, so it is always positive. The Stripe webhook also emits
`kind: "refund"` and `kind: "dispute"` with a **negative** `revenue_cents`.
Nothing seeded exercises the refund/dispute revenue split.

The seed posts NDJSON straight to the events endpoint, so it bypasses
`writePaymentEvent` and its `extra: { kind: RevenueKind }` constraint — the one
payment writer the type system does not cover.

Fix: emit refunds and disputes at some rate, with negated cents.

## Resolved

- **Per-event-type input types.** `BrowserEventInput`, `CrawlEventInput` and
  `PaymentEventInput` in `@tabsircg/schemas/analytics` each require exactly the
  columns their event kind must carry. Every row builder is annotated with one
  of them, so excess and missing columns are compile errors.
- **Bot rows built with the browser builder.** The seed now has `toCrawlRow`,
  forced by `CrawlEventInput`. Crawl rows no longer mint a visitor UUID per hit.
- **Missing field sanitisers.** The seed imports `toUint16`, `toEventName` and
  `encodeExtraData` from `../utils` instead of reimplementing them.
- **Partial payment rows.** Every column except `website_id`, `type` and
  `timestamp` carries a `DEFAULT` in `analytics_events.datasource`, verified
  against the dev workspace: partial rows fill in rather than quarantining.
