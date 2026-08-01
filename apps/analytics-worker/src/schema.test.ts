import { describe, expect, it } from "vitest";
import { payloadSchema } from "./schema";

const base = {
  websiteId: "my-site",
  domain: "example.com",
  href: "https://example.com/",
  referrer: null,
  viewport: { width: 1920, height: 1080 },
  visitorId: "v1",
  sessionId: "s1",
  visitorSessionNumber: 1,
  language: "en-US",
  timezone: "UTC",
  screenWidth: 1920,
  screenHeight: 1080,
};

const parse = (over: Record<string, unknown>) =>
  payloadSchema.safeParse({ ...base, ...over });

describe("payloadSchema", () => {
  it("accepts a pageview", () => {
    expect(parse({ type: "pageview" }).success).toBe(true);
  });

  it("accepts a custom event", () => {
    expect(
      parse({ type: "custom", extraData: { eventName: "signup" } }).success,
    ).toBe(true);
  });

  it("requires user_id on identify", () => {
    expect(parse({ type: "identify", extraData: {} }).success).toBe(false);
    expect(
      parse({ type: "identify", extraData: { user_id: "u1" } }).success,
    ).toBe(true);
  });

  it("rejects reserved types used as custom", () => {
    expect(parse({ type: "payment" }).success).toBe(false);
  });

  it("bounds the type so it cannot bloat the sorting key", () => {
    expect(parse({ type: "a".repeat(64) }).success).toBe(true);
    expect(parse({ type: "a".repeat(65) }).success).toBe(false);
  });

  it("bounds href", () => {
    expect(parse({ type: "pageview", href: "h".repeat(2001) }).success).toBe(
      false,
    );
  });

  it("requires a websiteId", () => {
    expect(parse({ type: "pageview", websiteId: "" }).success).toBe(false);
  });

  it("enforces the same extra_data property budget as the browser SDK", () => {
    const ten = Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [`k${i}`, "1"]),
    );
    expect(parse({ type: "custom", extraData: ten }).success).toBe(true);
    expect(
      parse({ type: "custom", extraData: { ...ten, k10: "1" } }).success,
    ).toBe(false);
  });

  it("exempts eventName from the property budget, as the SDK does", () => {
    const ten = Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [`k${i}`, "1"]),
    );
    expect(
      parse({ type: "custom", extraData: { eventName: "signup", ...ten } })
        .success,
    ).toBe(true);
  });

  it("rejects property names the SDK would have refused", () => {
    expect(parse({ type: "custom", extraData: { "bad key": "1" } }).success).toBe(
      false,
    );
    expect(
      parse({ type: "custom", extraData: { Plan: "pro" } }).success,
    ).toBe(false);
    expect(
      parse({ type: "custom", extraData: { ["k".repeat(33)]: "1" } }).success,
    ).toBe(false);
  });

  it("bounds a single value and the serialised whole", () => {
    expect(
      parse({ type: "custom", extraData: { a: "x".repeat(1001) } }).success,
    ).toBe(false);
    const big = Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [`k${i}`, "x".repeat(1000)]),
    );
    expect(parse({ type: "custom", extraData: big }).success).toBe(false);
  });

  it("rejects non-string property values", () => {
    expect(parse({ type: "custom", extraData: { a: 1 } }).success).toBe(false);
    expect(parse({ type: "custom", extraData: { a: { b: 1 } } }).success).toBe(
      false,
    );
  });

  it("applies the same rules to identify profile data", () => {
    expect(
      parse({ type: "identify", extraData: { user_id: "u1", "bad key": "x" } })
        .success,
    ).toBe(false);
    expect(
      parse({
        type: "identify",
        extraData: { user_id: "u1", image: "https://x.com/a.jpg?w=64&h=64" },
      }).success,
    ).toBe(true);
  });

  it("no longer accepts a cfOverride block as a known field", () => {
    const result = parse({ type: "pageview", cfOverride: { ip: "1.2.3.4" } });
    expect(result.success).toBe(true);
    expect(result.success && "cfOverride" in result.data).toBe(false);
  });
});
