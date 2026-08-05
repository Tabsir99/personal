import { describe, expect, it } from "vitest";
import * as sdk from "../../analytics/src/constants";
import * as middleware from "../../analytics/src/middleware/index";
import { CRAWLER_CATEGORIES } from "../../analytics/src/middleware/signatures";
import { REFERENCE } from "./reference";

const DECLARATIVE_ATTRIBUTES = [
  sdk.GOAL_ATTR,
  sdk.GOAL_PROP_PREFIX,
  sdk.SCROLL_ATTR,
  sdk.SCROLL_PROP_PREFIX,
  sdk.SCROLL_THRESHOLD_ATTR,
  sdk.SCROLL_DELAY_ATTR,
];

const CONFIG_ATTRIBUTES = [
  "data-website-id",
  "data-domain",
  "data-allowed-hostnames",
  "data-api-url",
  "data-allow-localhost",
  "data-allow-file-protocol",
  "data-allow-iframe",
  "data-debug",
  "data-disable-console",
];

describe("the reference covers the SDK surface", () => {
  it("documents every declarative attribute the tracker reads", () => {
    for (const attribute of DECLARATIVE_ATTRIBUTES) {
      expect(REFERENCE, `${attribute} is undocumented`).toContain(attribute);
    }
  });

  it("documents every script-tag config attribute", () => {
    for (const attribute of CONFIG_ATTRIBUTES) {
      expect(REFERENCE, `${attribute} is undocumented`).toContain(attribute);
    }
  });

  it("documents every cross-domain handoff parameter", () => {
    for (const param of sdk.HANDOFF_PARAMS) {
      expect(REFERENCE, `${param} is undocumented`).toContain(param);
    }
  });

  it("states the property limits the Worker actually enforces", () => {
    expect(REFERENCE).toContain(String(sdk.EXTRA_DATA_MAX_PROPERTIES));
    expect(REFERENCE).toContain(String(sdk.EXTRA_DATA_MAX_KEY_LENGTH));
    expect(REFERENCE).toContain(String(sdk.EXTRA_DATA_MAX_VALUE_LENGTH));
    expect(REFERENCE).toContain(String(sdk.EXTRA_DATA_MAX_BYTES));
    expect(REFERENCE).toContain(sdk.EXTRA_DATA_KEY_PATTERN.source);
    expect(REFERENCE).toContain(sdk.EVENT_NAME_KEY);
  });

  it("does not describe the scroll threshold as a percentage", () => {
    expect(REFERENCE).toContain(`${sdk.SCROLL_THRESHOLD_ATTR}="0.75"`);
    expect(REFERENCE).not.toContain(`${sdk.SCROLL_THRESHOLD_ATTR}="75"`);
  });
});

describe("the reference covers the crawler middleware", () => {
  it("documents every entry point the middleware exports", () => {
    const entryPoints = Object.keys(middleware);
    expect(entryPoints.length).toBeGreaterThan(0);
    for (const name of entryPoints) {
      expect(REFERENCE, `${name} is undocumented`).toContain(name);
    }
  });

  it("documents every crawler category", () => {
    for (const category of CRAWLER_CATEGORIES) {
      expect(REFERENCE, `${category} is undocumented`).toContain(category);
    }
  });

  it("states that crawl events need the ingest token", () => {
    expect(REFERENCE).toContain("ingestToken");
    expect(REFERENCE).toContain("X-Ingest-Token");
    expect(REFERENCE).toContain("INGEST_TOKEN");
  });
});
