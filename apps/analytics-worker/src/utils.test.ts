import { describe, expect, it } from "vitest";
import { toUint16, toEventName, encodeExtraData } from "./utils";

describe("toUint16", () => {
  it("clamps above the column ceiling", () => {
    expect(toUint16(1_000_000)).toBe(65535);
    expect(toUint16(65536)).toBe(65535);
  });

  it("floors below zero", () => {
    expect(toUint16(-1)).toBe(0);
  });

  it("rounds fractional viewports", () => {
    expect(toUint16(1512.7)).toBe(1513);
  });

  it("treats non-finite input as unknown rather than as the ceiling", () => {
    expect(toUint16(NaN)).toBe(0);
    expect(toUint16(Infinity)).toBe(0);
    expect(toUint16(-Infinity)).toBe(0);
  });

  it("passes ordinary values through", () => {
    expect(toUint16(1920)).toBe(1920);
  });
});

describe("toEventName", () => {
  it("prefers extraData.eventName", () => {
    expect(toEventName({ eventName: "signup" }, "custom")).toBe("signup");
  });

  it("falls back to the type", () => {
    expect(toEventName(undefined, "pageview")).toBe("pageview");
    expect(toEventName({}, "identify")).toBe("identify");
  });

  it("ignores a non-string eventName", () => {
    expect(toEventName({ eventName: 42 }, "custom")).toBe("custom");
    expect(toEventName({ eventName: "" }, "custom")).toBe("custom");
  });

  it("caps at the column budget", () => {
    expect(toEventName({ eventName: "x".repeat(9999) }, "custom")).toHaveLength(
      255,
    );
  });
});

describe("encodeExtraData", () => {
  const oversized = Object.fromEntries(
    Array.from({ length: 40 }, (_, i) => [`k${i}`, "v".repeat(300)]),
  );

  it("leaves a small object untouched", () => {
    expect(encodeExtraData({ a: "1" })).toBe('{"a":"1"}');
  });

  it("returns an empty object for non-objects", () => {
    expect(encodeExtraData(null)).toBe("{}");
    expect(encodeExtraData([1, 2])).toBe("{}");
    expect(encodeExtraData("nope")).toBe("{}");
  });

  it("stays within the column budget", () => {
    expect(encodeExtraData(oversized).length).toBeLessThanOrEqual(4000);
  });

  it("always emits parseable JSON, unlike a raw slice", () => {
    const encoded = encodeExtraData(oversized);
    expect(() => JSON.parse(encoded)).not.toThrow();
    expect(() => JSON.parse(JSON.stringify(oversized).slice(0, 4000))).toThrow();
  });

  it("keeps as many whole keys as fit", () => {
    const kept = JSON.parse(encodeExtraData(oversized));
    expect(Object.keys(kept).length).toBeGreaterThan(0);
    expect(Object.keys(kept).length).toBeLessThan(40);
  });

  it("trims a single oversized value instead of dropping it", () => {
    const kept = JSON.parse(encodeExtraData({ blob: "z".repeat(50_000) }));
    expect(kept.blob).toHaveLength(1000);
  });
});
