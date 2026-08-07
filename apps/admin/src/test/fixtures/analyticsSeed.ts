import type { AnalyticsEventRow } from "@tabsircg/schemas/analytics";

export interface SeedOptions {
  websiteId: string;
  seed: number;
  minRows: number;
  windowStart: number;
  windowEnd: number;
}

const DOMAIN = "tabsircg.com";
const DAY = 86_400_000;

type Weighted = { weight: number };

interface Source extends Weighted {
  referrer: string;
  query?: string;
}

interface Country extends Weighted {
  code: string;
  tz: string;
  lang: string;
  regions: [string, string][];
}

const SOURCES: Source[] = [
  { referrer: "https://www.google.com/", weight: 0.26 },
  { referrer: "https://www.bing.com/", weight: 0.05 },
  { referrer: "https://duckduckgo.com/", weight: 0.05 },
  { referrer: "", weight: 0.18 },
  { referrer: "https://www.linkedin.com/feed/", weight: 0.045 },
  { referrer: "https://www.reddit.com/r/webdev/", weight: 0.045 },
  { referrer: "https://x.com/", weight: 0.04 },
  { referrer: "https://news.ycombinator.com/", weight: 0.05 },
  { referrer: "https://dev.to/", weight: 0.02 },
  { referrer: "https://lobste.rs/", weight: 0.02 },
  { referrer: "https://chatgpt.com/", weight: 0.035 },
  { referrer: "https://www.perplexity.ai/", weight: 0.02 },
  { referrer: "https://claude.ai/", weight: 0.015 },
  { referrer: "https://www.youtube.com/", weight: 0.025 },
  { referrer: "https://t.me/", weight: 0.015 },
  { referrer: "https://discord.com/channels/@me", weight: 0.01 },
  {
    referrer: "https://mail.proton.me/",
    weight: 0.04,
    query:
      "utm_source=newsletter&utm_medium=email&utm_campaign=weekly_digest&utm_content=header_link",
  },
  { referrer: "https://github.com/tabsircg", weight: 0.02 },
  {
    referrer: "https://www.producthunt.com/",
    weight: 0.012,
    query: "ref=producthunt",
  },
  {
    referrer: "https://indiehackers.com/",
    weight: 0.008,
    query: "ref=indiehackers",
  },
  {
    referrer: "https://www.google.com/",
    weight: 0.018,
    query:
      "utm_source=google&utm_medium=cpc&utm_campaign=blog_promo&utm_content=text_ad_a&utm_term=self_hosted_analytics",
  },
  {
    referrer: "https://x.com/",
    weight: 0.015,
    query:
      "utm_source=twitter&utm_medium=paid_social&utm_campaign=launch_2026&utm_content=carousel_1",
  },
  {
    referrer: "https://www.reddit.com/",
    weight: 0.007,
    query:
      "utm_source=reddit&utm_medium=cpc&utm_campaign=devtools&utm_content=promoted_post&utm_term=privacy_analytics",
  },
];

const COUNTRIES: Country[] = [
  {
    code: "US",
    tz: "America/New_York",
    lang: "en-US",
    regions: [
      ["New York", "New York City"],
      ["California", "San Francisco"],
      ["Texas", "Austin"],
    ],
    weight: 0.5,
  },
  {
    code: "GB",
    tz: "Europe/London",
    lang: "en-GB",
    regions: [
      ["England", "London"],
      ["Scotland", "Edinburgh"],
    ],
    weight: 0.15,
  },
  {
    code: "DE",
    tz: "Europe/Berlin",
    lang: "de-DE",
    regions: [
      ["Berlin", "Berlin"],
      ["Bavaria", "Munich"],
    ],
    weight: 0.1,
  },
  {
    code: "FR",
    tz: "Europe/Paris",
    lang: "fr-FR",
    regions: [
      ["Île-de-France", "Paris"],
      ["Auvergne-Rhône-Alpes", "Lyon"],
    ],
    weight: 0.08,
  },
  {
    code: "JP",
    tz: "Asia/Tokyo",
    lang: "ja-JP",
    regions: [
      ["Tokyo", "Tokyo"],
      ["Osaka", "Osaka"],
    ],
    weight: 0.07,
  },
  {
    code: "CA",
    tz: "America/Toronto",
    lang: "en-CA",
    regions: [
      ["Ontario", "Toronto"],
      ["Ontario", "London"],
      ["British Columbia", "Vancouver"],
    ],
    weight: 0.05,
  },
  {
    code: "IN",
    tz: "Asia/Kolkata",
    lang: "en-IN",
    regions: [
      ["Maharashtra", "Mumbai"],
      ["Karnataka", "Bengaluru"],
    ],
    weight: 0.05,
  },
];

interface Device {
  browser: string;
  os: string;
  device: string;
  sw: number;
  sh: number;
  weight: number;
}

const DEVICES = [
  {
    browser: "Chrome",
    os: "Windows",
    device: "desktop",
    sw: 1920,
    sh: 1080,
    weight: 0.34,
  },
  {
    browser: "Safari",
    os: "macOS",
    device: "desktop",
    sw: 2560,
    sh: 1440,
    weight: 0.18,
  },
  {
    browser: "Chrome",
    os: "macOS",
    device: "desktop",
    sw: 1440,
    sh: 900,
    weight: 0.14,
  },
  {
    browser: "Firefox",
    os: "Windows",
    device: "desktop",
    sw: 1920,
    sh: 1080,
    weight: 0.08,
  },
  {
    browser: "Safari",
    os: "iOS",
    device: "mobile",
    sw: 390,
    sh: 844,
    weight: 0.14,
  },
  {
    browser: "Chrome",
    os: "Android",
    device: "mobile",
    sw: 412,
    sh: 915,
    weight: 0.09,
  },
  {
    browser: "Safari",
    os: "iPadOS",
    device: "tablet",
    sw: 768,
    sh: 1024,
    weight: 0.03,
  },
] as const satisfies Device[];

const SUPPORTER_DESKTOP = DEVICES[0];
const SUPPORTER_PHONE = DEVICES[5];

const PAGES = ["/", "/blog", "/projects", "/about", "/contact"] as const;
const BLOG_PAGES = [
  "/blog/lightweight-analytics",
  "/blog/my-setup-2026",
] as const;
const COFFEE_CENTS = [300, 500, 500, 1000, 1500, 2500, 5000] as const;
const REFUND_RATE = 0.15;
const DISPUTE_RATE = 0.07;
const SUPPORTER_FIRST = ["Andrew", "Jakub", "Alejandro", "Mykolas"] as const;
const SUPPORTER_LAST = ["Smith", "Nowak", "Garcia", "Petrauskas"] as const;

const BOTS = [
  { name: "GPTBot", category: "training", browser: "Unknown", weight: 0.28 },
  { name: "ClaudeBot", category: "training", browser: "WebKit", weight: 0.12 },
  {
    name: "Googlebot",
    category: "search_index",
    browser: "Unknown",
    weight: 0.2,
  },
  {
    name: "Bingbot",
    category: "search_index",
    browser: "Unknown",
    weight: 0.1,
  },
  {
    name: "PerplexityBot",
    category: "ai_crawler",
    browser: "Unknown",
    weight: 0.12,
  },
  {
    name: "ChatGPT-User",
    category: "answer_fetch",
    browser: "WebKit",
    weight: 0.08,
  },
  { name: "Bytespider", category: "training", browser: "Unknown", weight: 0.1 },
] as const satisfies (Weighted & {
  name: string;
  category: string;
  browser: string;
})[];

type Persona = "bounce" | "reader" | "signer" | "supporter";

function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateSeed(opts: SeedOptions): AnalyticsEventRow[] {
  const { websiteId, seed, minRows, windowStart, windowEnd } = opts;
  const rng = makeRng(seed);
  const rows: AnalyticsEventRow[] = [];

  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];
  const int = (lo: number, hi: number) =>
    lo + Math.floor(rng() * (hi - lo + 1));
  const weighted = <T extends Weighted>(arr: readonly T[]): T => {
    const r = rng();
    let sum = 0;
    for (const item of arr) {
      sum += item.weight;
      if (r <= sum) return item;
    }
    return arr[arr.length - 1];
  };

  const uuid = () => {
    const b = new Uint8Array(16);
    for (let i = 0; i < 16; i++) b[i] = Math.floor(rng() * 256);
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const hex = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  };

  const sessionId = () => uuid();

  const B62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const stripeId = (prefix: string, len: number) =>
    prefix +
    Array.from({ length: len }, () => B62[Math.floor(rng() * 62)]).join("");

  const emitVisitor = () => {
    const id = uuid();
    const geo = weighted(COUNTRIES);
    const [region, city] = pick(geo.regions);
    const ip = `${int(1, 223)}.${int(0, 254)}.${int(0, 254)}.${int(1, 254)}`;
    const source = weighted(SOURCES);
    const p = rng();
    const persona: Persona =
      p < 0.4
        ? "bounce"
        : p < 0.8
          ? "reader"
          : p < 0.95
            ? "signer"
            : "supporter";

    const baseDevice = weighted(DEVICES);
    const visitor = {
      id,
      country: geo.code,
      region,
      city,
      tz: geo.tz,
      lang: geo.lang,
      ip,
    };

    const identifyData = (name: string) =>
      JSON.stringify({ name, image: "", user_id: `usr_${id}` });

    const row = (
      dev: Device,
      over: Partial<AnalyticsEventRow>,
    ): AnalyticsEventRow => ({
      website_id: websiteId,
      type: "pageview",
      domain: DOMAIN,
      href: `https://${DOMAIN}/`,
      referrer: "",
      visitor_id: visitor.id,
      session_id: "",
      language: visitor.lang,
      timezone: visitor.tz,
      event_name: "pageview",
      extra_data: "{}",
      country: visitor.country,
      region: visitor.region,
      city: visitor.city,
      browser: dev.browser,
      os: dev.os,
      device: dev.device,
      is_bot: 0,
      bot_category: "generic",
      bot_name: "",
      ip: visitor.ip,
      viewport_w: Math.floor(dev.sw * 0.95),
      viewport_h: Math.floor(dev.sh * 0.88),
      screen_w: dev.sw,
      screen_h: dev.sh,
      session_number: 1,
      revenue_cents: 0,
      timestamp: 0,
      ...over,
    });

    const emitSession = (
      dev: Device,
      snum: number,
      startTs: number,
      landing: boolean,
    ) => {
      const sid = sessionId();
      let ts = startTs;
      let first = true;

      const push = (
        type: string,
        path: string,
        over: Partial<AnalyticsEventRow> = {},
      ) => {
        if (ts >= windowEnd) return;
        const isEntry = first && landing;
        const href =
          isEntry && source.query
            ? `https://${DOMAIN}/?${source.query}`
            : `https://${DOMAIN}${path}`;
        rows.push(
          row(dev, {
            type,
            session_id: sid,
            session_number: snum,
            href,

            referrer: landing ? source.referrer : "",
            event_name: type,
            timestamp: Math.floor(ts),
            ...over,
          }),
        );
        first = false;
      };

      const pageview = (path: string) => push("pageview", path);

      const goal = (name: string, path: string) =>
        push("custom", path, {
          event_name: name,
          extra_data: JSON.stringify({ eventName: name }),
        });

      const paymentAt = (
        at: number,
        cents: number,
        extra: Record<string, string>,
      ) => {
        if (at >= windowEnd) return;
        rows.push({
          ...row(dev, {}),
          type: "payment",
          event_name: "payment",
          session_id: sid,
          domain: "",
          href: "",
          referrer: "",
          language: "",
          timezone: "",
          country: "",
          region: "",
          city: "",
          browser: "",
          os: "",
          device: "",

          bot_category: "",
          ip: "",
          viewport_w: 0,
          viewport_h: 0,
          screen_w: 0,
          screen_h: 0,
          session_number: 0,
          revenue_cents: cents,
          extra_data: JSON.stringify(extra),
          timestamp: Math.floor(at),
        });
      };

      const payment = (cents: number, extra: Record<string, string>) =>
        paymentAt(ts, cents, extra);
      const advance = (min: number, max: number) =>
        (ts += int(min, max) * 1000);

      if (persona === "bounce") {
        const path = rng() < 0.5 ? pick(BLOG_PAGES) : pick(PAGES);
        pageview(path);
        if (path.startsWith("/blog/") && rng() < 0.4) {
          advance(20, 60);
          goal("article_read", path);
        }
      } else if (persona === "reader") {
        pageview("/");
        advance(15, 40);
        const second = rng() < 0.5 ? pick(BLOG_PAGES) : pick(PAGES);
        pageview(second);
        if (second.startsWith("/blog/") && rng() < 0.5) {
          advance(20, 60);
          goal("article_read", second);
          if (rng() < 0.4) {
            advance(2, 5);
            goal("code_copy", second);
          }
        }
        if (rng() < 0.3) {
          advance(4, 8);
          push("external_link", "/projects", {
            event_name: "external_link",
            extra_data: JSON.stringify({
              url: "https://github.com/tabsircg",
              text: "GitHub",
            }),
          });
        }
      } else if (persona === "signer") {
        const newsletter = rng() < 0.6;
        pageview("/blog");
        advance(15, 30);
        if (newsletter) {
          pageview("/newsletter");
          advance(10, 20);
          goal("newsletter_signup", "/newsletter");
        } else {
          pageview("/contact");
          advance(20, 40);
          goal("contact_submit", "/contact");
        }
        push("identify", newsletter ? "/newsletter" : "/contact", {
          event_name: "identify",
          extra_data: identifyData(
            `${pick(SUPPORTER_FIRST)} ${pick(SUPPORTER_LAST)}`,
          ),
        });
      } else {
        pageview("/");
        advance(15, 30);
        pageview("/projects");
        advance(5, 12);
        goal("coffee_click", "/projects");
        advance(3, 8);
        pageview("/success");
        const first = pick(SUPPORTER_FIRST);
        const last = pick(SUPPORTER_LAST);
        const charged = pick(COFFEE_CENTS);
        const identity = {
          customer_name: `${first} ${last}`,
          customer_email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
          customer_id: stripeId("cus_", 14),
          transaction_id: stripeId("pi_", 24),
        };

        payment(charged, {
          stripe_event_id: stripeId("evt_", 24),
          kind: "charge",
          ...identity,
        });

        const reversal = rng();
        if (reversal < REFUND_RATE)
          paymentAt(ts + int(1, 6) * DAY, -Math.round(charged / 2), {
            stripe_event_id: stripeId("evt_", 24),
            kind: "refund",
            ...identity,
          });
        else if (reversal < REFUND_RATE + DISPUTE_RATE)
          paymentAt(ts + int(2, 9) * DAY, -charged, {
            stripe_event_id: stripeId("evt_", 24),
            kind: "dispute",
            ...identity,
          });
        push("identify", "/success", {
          event_name: "identify",
          extra_data: identifyData(`${first} ${last}`),
        });
      }
    };

    if (persona === "supporter") {
      const start = windowStart + rng() * (windowEnd - windowStart - 8 * DAY);
      emitSession(SUPPORTER_DESKTOP, 1, start, true);
      const back = start + int(1, 5) * DAY + rng() * 4 * 3_600_000;
      if (back < windowEnd) emitSession(SUPPORTER_PHONE, 2, back, false);
      return;
    }

    const returning = rng() < 0.25;
    const snum = returning ? int(2, 4) : 1;
    const start = windowStart + rng() * (windowEnd - windowStart - DAY);
    emitSession(baseDevice, snum, start, !returning);
  };

  const targetVisitorRows = Math.floor(minRows * 0.95);
  while (rows.length < targetVisitorRows) emitVisitor();

  const botCount = Math.max(1, Math.floor(rows.length * 0.05));
  for (let i = 0; i < botCount; i++) {
    const bot = weighted(BOTS);
    const path = rng() < 0.5 ? pick(BLOG_PAGES) : pick(PAGES);
    const ts = windowStart + rng() * (windowEnd - windowStart);

    const geo = weighted(COUNTRIES);
    const [region, city] = pick(geo.regions);
    rows.push({
      website_id: websiteId,
      type: "pageview",
      domain: DOMAIN,
      href: `https://${DOMAIN}${path}`,
      referrer: "",
      visitor_id: uuid(),
      session_id: sessionId(),
      language: "en-US",
      timezone: "UTC",
      event_name: "pageview",
      extra_data: "{}",
      country: geo.code,
      region,
      city,
      browser: bot.browser,
      os: "Unknown",
      device: "desktop",
      is_bot: 1,
      bot_category: bot.category,
      bot_name: bot.name,
      ip: `10.0.${int(0, 255)}.${int(0, 255)}`,
      viewport_w: 0,
      viewport_h: 0,
      screen_w: 0,
      screen_h: 0,
      session_number: 1,
      revenue_cents: 0,
      timestamp: Math.floor(ts),
    });
  }

  return rows;
}
