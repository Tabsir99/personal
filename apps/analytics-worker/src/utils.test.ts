import { describe, expect, it } from "vitest";
import { toUint16, toEventName, encodeExtraData } from "./utils";
import { detectBot } from "./detectBot";

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

describe("detectBot", () => {
  const named: Array<[string, string, string]> = [
    ["Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", "Googlebot", "search_index"],
    ["Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)", "Bingbot", "search_index"],
    ["Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)", "YandexBot", "search_index"],
    ["Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)", "GPTBot", "training"],
    ["Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)", "ClaudeBot", "training"],
    ["Mozilla/5.0 (compatible; CCBot/2.0; https://commoncrawl.org/faq/)", "CCBot", "training"],
    ["Mozilla/5.0 ChatGPT-User/1.0; +https://openai.com/bot", "ChatGPT-User", "answer_fetch"],
    ["Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/bot)", "PerplexityBot", "ai_crawler"],
    ["Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)", "AhrefsBot", "seo"],
    ["Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)", "SemrushBot", "seo"],
    ["Mozilla/5.0 (compatible; MJ12bot/v1.4.8; http://mj12bot.com/)", "MJ12bot", "seo"],
    ["facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)", "facebookexternalhit", "social"],
    ["Twitterbot/1.0", "Twitterbot", "social"],
    ["Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)", "Discordbot", "social"],
    ["Mozilla/5.0+(compatible; UptimeRobot/2.0; http://www.uptimerobot.com/)", "UptimeRobot", "monitoring"],
    ["Mozilla/5.0 (compatible; Pingdom.com_bot_version_1.4)", "Pingdom", "monitoring"],
    ["Mozilla/5.0 (compatible; archive.org_bot +http://archive.org/details/archive.org_bot)", "Internet Archive", "archive"],
    ["curl/7.68.0", "curl", "tooling"],
    ["Wget/1.20.3 (linux-gnu)", "Wget", "tooling"],
    ["python-requests/2.28.1", "Python", "tooling"],
    ["Go-http-client/1.1", "Go-http-client", "tooling"],
    ["PostmanRuntime/7.29.0", "Postman", "tooling"],
  ];

  it("names and categorises every bot in the table", () => {
    for (const [ua, name, category] of named) {
      const result = detectBot(ua);
      expect([ua, result.bot_name, result.bot_category]).toEqual([ua, name, category]);
      expect(result.is_bot).toBe(1);
    }
  });

  it("gives distinct names rather than one collapsed bucket", () => {
    const names = named.map(([ua]) => detectBot(ua).bot_name);
    expect(new Set(names).size).toBe(new Set(named.map(([, n]) => n)).size);
  });

  it("falls back to the agent token, never the bare signal", () => {
    const unknown = detectBot("Mozilla/5.0 (compatible; SomeNewBot/3.1; +http://example.com)");
    expect(unknown.is_bot).toBe(1);
    expect(unknown.bot_category).toBe("generic");
    expect(unknown.bot_name).toBe("SomeNewBot");
  });

  it("does not flag real browsers", () => {
    const browsers = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
      "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    ];
    for (const ua of browsers) {
      expect([ua, detectBot(ua).is_bot]).toEqual([ua, 0]);
    }
  });

  it("keeps java/ from matching javascript in a browser string", () => {
    expect(detectBot("Mozilla/5.0 JavaScript/1.0 Chrome/120").is_bot).toBe(0);
    expect(detectBot("Java/1.8.0_181").bot_name).toBe("Java");
  });
});
