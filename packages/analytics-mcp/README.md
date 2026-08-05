# @tabsircg/analytics-mcp

An MCP server that lets an AI agent instrument a site with [`@tabsircg/analytics`](../analytics) without guessing at the wire rules.

## Install

```json
{
  "mcpServers": {
    "tabsircg-analytics": {
      "command": "npx",
      "args": ["-y", "@tabsircg/analytics-mcp"]
    }
  }
}
```

stdio transport — the client spawns it as a subprocess. No network, no auth, no port. It reads the project it is pointed at and nothing else.

## What it exposes

### `validate_event` (tool)

Takes a proposed `trackEvent` call and returns the verdict the Worker would give, before the code is written.

```
validate_event({ eventName: "purchase", data: { itemCount: 3, "user.tier": "pro" } })
```

```
INVALID - the Worker will reject this with HTTP 400, and the whole event is lost.

analytics.trackEvent("purchase", ...) sends:
  type column: "custom"
  extra_data: {
    "itemcount": "3",
    "user.tier": "pro",
    "eventName": "purchase"
  }

Problems:
  - Property "user.tier" contains characters outside ^[a-z0-9_-]+$. Rename it to "user_tier".

The tracker changes your input before sending:
  - key "itemCount" is lowercased to "itemcount"
  - value of "itemcount" is number 3, sent as "3"
```

A model applying the key regex by hand gets this wrong sometimes, and the failure mode is a 400 against a fire-and-forget beacon — invisible until the numbers are already missing. This runs the regex instead.

### `inspect_setup` (tool)

Scans a project root for the tracker: resolved version, where it is initialised, whether the script tag and SDK are both wired up, and flags that should not ship (`allowLocalhost`, `allowIframe`, `debug`).

### `analytics://reference` (resource)

The instrumentation guide — install paths, what the tracker collects automatically so it is not re-sent, the event model, `extraData` rules, callback outcomes, and the Stripe revenue handoff.

Documents belong in resources, not tools. Only the two things that *compute* something from your input are tools.

## Why the contract is vendored

`@tabsircg/schemas` is workspace-only and never published, so `src/contract.ts` mirrors `extraDataSchema` and its constants. `src/contract.test.ts` asserts the copy agrees with the shared package — on every constant, and on the verdict for a set of edge-case payloads — so the two cannot drift.

The rules describe the **deployed Worker**, a single global version, not whatever tracker release a given project has installed. That is why vendoring is safe here.
