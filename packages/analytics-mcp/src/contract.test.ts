import { describe, expect, it } from "vitest";
import * as shared from "@tabsircg/schemas/analytics";
import * as vendored from "./contract";
import { validateEvent } from "./validate";

describe("the vendored contract matches the Worker", () => {
  it("mirrors every extra_data limit", () => {
    expect(vendored.EXTRA_DATA_MAX_PROPERTIES).toBe(shared.EXTRA_DATA_MAX_PROPERTIES);
    expect(vendored.EXTRA_DATA_MAX_KEY_LENGTH).toBe(shared.EXTRA_DATA_MAX_KEY_LENGTH);
    expect(vendored.EXTRA_DATA_MAX_VALUE_LENGTH).toBe(shared.EXTRA_DATA_MAX_VALUE_LENGTH);
    expect(vendored.EXTRA_DATA_MAX_BYTES).toBe(shared.EXTRA_DATA_MAX_BYTES);
    expect(vendored.EXTRA_DATA_KEY_PATTERN.source).toBe(shared.EXTRA_DATA_KEY_PATTERN.source);
    expect(vendored.EXTRA_DATA_KEY_PATTERN.flags).toBe(shared.EXTRA_DATA_KEY_PATTERN.flags);
    expect(vendored.EVENT_NAME_KEY).toBe(shared.EVENT_NAME_KEY);
    expect(vendored.CUSTOM_EVENT_TYPE).toBe(shared.CUSTOM_EVENT_TYPE);
    expect(vendored.VISITOR_ID_MAX_LENGTH).toBe(shared.VISITOR_ID_MAX_LENGTH);
  });

  it("agrees with the shared schema on every verdict", () => {
    const cases: Record<string, string>[] = [
      { eventName: "signup", plan: "pro" },
      { eventName: "signup", "bad key": "x" },
      { eventName: "signup", "user.tier": "pro" },
      Object.fromEntries(Array.from({ length: 11 }, (_, i) => [`k${i}`, "1"])),
      { a: "x".repeat(1001) },
      Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`k${i}`, "x".repeat(1000)])),
    ];
    for (const candidate of cases) {
      expect(vendored.extraDataSchema.safeParse(candidate).success).toBe(
        shared.extraDataSchema.safeParse(candidate).success,
      );
    }
  });
});

describe("validateEvent", () => {
  it("accepts an ordinary event", () => {
    const report = validateEvent("checkout_completed", { plan: "pro", seats: "4" });
    expect(report.valid).toBe(true);
    expect(report.wire).toEqual({ eventName: "checkout_completed", plan: "pro", seats: "4" });
  });

  it("shows the marshalling the tracker applies before the Worker sees it", () => {
    const report = validateEvent("purchase", { itemCount: 3 });
    expect(report.valid).toBe(true);
    expect(report.wire).toEqual({ eventName: "purchase", itemcount: "3" });
    expect(report.transformations).toEqual([
      'key "itemCount" is lowercased to "itemcount"',
      'value of "itemcount" is number 3, sent as "3"',
    ]);
  });

  it("catches the key a lowercase pass cannot fix, and suggests one that works", () => {
    const report = validateEvent("purchase", { "user.tier": "pro" });
    expect(report.valid).toBe(false);
    expect(report.problems[0]).toContain('Rename it to "user_tier"');
  });

  it("exempts eventName from the property budget", () => {
    const ten = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`k${i}`, "1"]));
    expect(validateEvent("signup", ten).valid).toBe(true);
    expect(validateEvent("signup", { ...ten, k10: "1" }).valid).toBe(false);
  });

  it("refuses an empty event name", () => {
    const report = validateEvent("", { plan: "pro" });
    expect(report.valid).toBe(false);
    expect(report.problems[0]).toContain("event name is empty");
  });

  it("reports truncation rather than silently losing the tail", () => {
    const report = validateEvent("view", { note: "x".repeat(1500) });
    expect(report.valid).toBe(true);
    expect(report.wire.note).toHaveLength(1000);
    expect(report.transformations[0]).toContain("truncated to 1000");
  });
});
