/// <reference types="node" />
import nodeCrypto from "crypto";
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { type BrowserPayload } from "../schema";
import { parseUA } from "../parseUA";
import { toUint16, toEventName, encodeExtraData } from "../utils";
import {
  ANALYTICS_TABLE,
  type BotCategory,
  type AnalyticsEventInput,
  type BrowserEventInput,
  type CrawlEventInput,
  type PaymentEventInput,
} from "@tabsircg/schemas/analytics";

interface SeedCrawler {
  name: string;
  category: BotCategory;
}

interface SeedContext {
  ip: string;
  timestamp: number;
}

interface SeedVisitorContext extends SeedContext {
  country: string;
  region: string;
  city: string;
  userAgent: string;
}

type SeedBrowserEvent = BrowserPayload & { at: SeedVisitorContext };

interface SeedCrawlEvent {
  websiteId: string;
  domain: string;
  href: string;
  referrer?: string;
  type: "pageview";
  crawler: SeedCrawler;
  at: SeedContext;
}

type SeedEvent = SeedBrowserEvent | SeedCrawlEvent;

function isCrawlEvent(event: SeedEvent): event is SeedCrawlEvent {
  return "crawler" in event;
}

const WEBSITE_ID =
  process.env.SEED_WEBSITE_ID ?? "3c2896b2-ce03-4bed-a2f9-91409bf37bc7";
const DOMAIN = process.env.SEED_DOMAIN ?? "tabsircg.com";
const TOTAL_EVENTS_TARGET = Number(process.env.SEED_EVENTS ?? 100_00);

console.log(`🚀 Seeding analytics for ${WEBSITE_ID} (${DOMAIN})\n`);

function generateUUID(): string {
  return nodeCrypto.randomUUID();
}

const FIRST_NAMES = [
  "Alex",
  "Jordan",
  "Taylor",
  "Morgan",
  "Sam",
  "Jamie",
  "Casey",
  "Robin",
  "Drew",
  "Skyler",
  "Chris",
  "Pat",
  "Terry",
  "Kim",
  "Lee",
  "Sarah",
  "John",
  "Emily",
  "David",
  "Jessica",
];
const LAST_NAMES = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Miller",
  "Davis",
  "Garcia",
  "Rodriguez",
  "Wilson",
  "Martinez",
  "Anderson",
  "Taylor",
  "Thomas",
  "Hernandez",
  "White",
  "Lopez",
  "Martin",
  "Lee",
  "Clark",
];
const EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "icloud.com",
  "protonmail.com",
  "hey.com",
];
const SUBJECTS = [
  "Collaboration Project",
  "Consulting Inquiry",
  "Freelance Work",
  "Quick Question",
  "Job Opening",
  "Love your blog!",
];
const COFFEE_AMOUNTS_CENTS = [300, 500, 500, 500, 1000, 1000, 1500, 2500, 5000];

const DAY_MS = 86_400_000;
const DISPUTE_RATE = 0.07;
const REFUND_RATE = 0.15;
const MAX_REVERSAL_DELAY_DAYS = 20;

const stripeEventId = () =>
  `evt_${generateUUID().replace(/-/g, "").slice(0, 24)}`;

interface Reversal {
  kind: "refund" | "dispute";
  cents: number;
  delay: number;
}

function reversalFor(chargeCents: number): Reversal | null {
  const roll = Math.random();
  const delay =
    (1 + Math.floor(Math.random() * MAX_REVERSAL_DELAY_DAYS)) * DAY_MS;

  if (roll < DISPUTE_RATE) {
    return { kind: "dispute", cents: chargeCents, delay };
  }
  if (roll < DISPUTE_RATE + REFUND_RATE) {
    return { kind: "refund", cents: Math.round(chargeCents / 2), delay };
  }
  return null;
}

interface AcquisitionSource {
  referrer: string | null;
  weight: number;
  utm?: {
    source: string;
    medium: string;
    campaign: string;
    content?: string;
    term?: string;
  };
  ref?: string;
}

const ACQUISITION_SOURCES: AcquisitionSource[] = [
  { referrer: "https://www.google.com/", weight: 0.26 },
  { referrer: "https://www.bing.com/", weight: 0.05 },
  { referrer: "https://duckduckgo.com/", weight: 0.05 },
  { referrer: null, weight: 0.18 },
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
    utm: {
      source: "newsletter",
      medium: "email",
      campaign: "weekly_digest",
      content: "header_link",
    },
  },
  { referrer: "https://github.com/tabsircg", weight: 0.02 },
  {
    referrer: "https://www.producthunt.com/",
    weight: 0.012,
    ref: "producthunt",
  },
  { referrer: "https://indiehackers.com/", weight: 0.008, ref: "indiehackers" },
  {
    referrer: "https://www.google.com/",
    weight: 0.018,
    utm: {
      source: "google",
      medium: "cpc",
      campaign: "blog_promo",
      content: "text_ad_a",
      term: "self_hosted_analytics",
    },
  },
  {
    referrer: "https://x.com/",
    weight: 0.015,
    utm: {
      source: "twitter",
      medium: "paid_social",
      campaign: "launch_2026",
      content: "carousel_1",
    },
  },
  {
    referrer: "https://www.reddit.com/",
    weight: 0.007,
    utm: {
      source: "reddit",
      medium: "cpc",
      campaign: "devtools",
      content: "promoted_post",
      term: "privacy_analytics",
    },
  },
];

interface CountryProfile {
  code: string;
  timezone: string[];
  language: string[];
  regions: { code: string; city: string }[];
  weight: number;
}

const COUNTRIES: CountryProfile[] = [
  {
    code: "US",
    timezone: [
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
    ],
    language: ["en-US"],
    regions: [
      { code: "NY", city: "New York" },
      { code: "CA", city: "Los Angeles" },
      { code: "CA", city: "San Francisco" },
      { code: "TX", city: "Austin" },
      { code: "IL", city: "Chicago" },
    ],
    weight: 0.5,
  },
  {
    code: "GB",
    timezone: ["Europe/London"],
    language: ["en-GB"],
    regions: [
      { code: "ENG", city: "London" },
      { code: "ENG", city: "Manchester" },
      { code: "SCT", city: "Edinburgh" },
    ],
    weight: 0.15,
  },
  {
    code: "DE",
    timezone: ["Europe/Berlin"],
    language: ["de-DE"],
    regions: [
      { code: "BE", city: "Berlin" },
      { code: "BY", city: "Munich" },
      { code: "HE", city: "Frankfurt" },
    ],
    weight: 0.1,
  },
  {
    code: "FR",
    timezone: ["Europe/Paris"],
    language: ["fr-FR"],
    regions: [
      { code: "IDF", city: "Paris" },
      { code: "ARA", city: "Lyon" },
    ],
    weight: 0.08,
  },
  {
    code: "JP",
    timezone: ["Asia/Tokyo"],
    language: ["ja-JP"],
    regions: [
      { code: "13", city: "Tokyo" },
      { code: "27", city: "Osaka" },
    ],
    weight: 0.07,
  },
  {
    code: "CA",
    timezone: ["America/Toronto", "America/Vancouver"],
    language: ["en-CA"],
    regions: [
      { code: "ON", city: "Toronto" },
      { code: "BC", city: "Vancouver" },
    ],
    weight: 0.05,
  },
  {
    code: "IN",
    timezone: ["Asia/Kolkata"],
    language: ["en-IN"],
    regions: [
      { code: "MH", city: "Mumbai" },
      { code: "KA", city: "Bengaluru" },
      { code: "DL", city: "Delhi" },
    ],
    weight: 0.05,
  },
];

function selectWeighted<T extends { weight: number }>(items: T[]): T {
  const r = Math.random();
  let sum = 0;
  for (const item of items) {
    sum += item.weight;
    if (r <= sum) return item;
  }
  return items[items.length - 1];
}

interface VisitorProfile {
  visitorId: string;
  country: string;
  region: string;
  city: string;
  timezone: string;
  language: string;
  ip: string;
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  persona: "bounce" | "explorer" | "signer" | "supporter";
  firstName: string;
  lastName: string;
  email: string;
  userId: string;
  firstReferrer: string | null;
  firstQuery: string | null;
}

function generateVisitor(): VisitorProfile {
  const visitorId = generateUUID();

  const countryProfile = selectWeighted(COUNTRIES);
  const regionProfile =
    countryProfile.regions[
      Math.floor(Math.random() * countryProfile.regions.length)
    ];
  const timezone =
    countryProfile.timezone[
      Math.floor(Math.random() * countryProfile.timezone.length)
    ];
  const language =
    countryProfile.language[
      Math.floor(Math.random() * countryProfile.language.length)
    ];

  const ip = `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`;

  const deviceType =
    Math.random() < 0.7
      ? "desktop"
      : Math.random() < 0.85
        ? "mobile"
        : "tablet";
  let screenWidth = 1920;
  let screenHeight = 1080;
  let userAgent = "";

  if (deviceType === "desktop") {
    const resolutions = [
      { w: 1920, h: 1080 },
      { w: 1440, h: 900 },
      { w: 2560, h: 1440 },
    ];
    const res = resolutions[Math.floor(Math.random() * resolutions.length)];
    screenWidth = res.w;
    screenHeight = res.h;

    const uas = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    ];
    userAgent = uas[Math.floor(Math.random() * uas.length)];
  } else if (deviceType === "mobile") {
    const resolutions = [
      { w: 390, h: 844 },
      { w: 412, h: 915 },
    ];
    const res = resolutions[Math.floor(Math.random() * resolutions.length)];
    screenWidth = res.w;
    screenHeight = res.h;

    const uas = [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/605.1.15",
      "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    ];
    userAgent = uas[Math.floor(Math.random() * uas.length)];
  } else {
    screenWidth = 768;
    screenHeight = 1024;
    userAgent =
      "Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/605.1.15";
  }

  const viewportWidth = Math.floor(screenWidth * 0.95);
  const viewportHeight = Math.floor(screenHeight * 0.88);

  const personaRand = Math.random();
  let persona: "bounce" | "explorer" | "signer" | "supporter" = "bounce";
  if (personaRand < 0.4) {
    persona = "bounce";
  } else if (personaRand < 0.8) {
    persona = "explorer";
  } else if (personaRand < 0.95) {
    persona = "signer";
  } else {
    persona = "supporter";
  }

  const source = selectWeighted(ACQUISITION_SOURCES);
  const firstReferrer = source.referrer;
  let firstQuery: string | null = null;
  if (source.utm) {
    const u = source.utm;
    const parts = [
      `utm_source=${u.source}`,
      `utm_medium=${u.medium}`,
      `utm_campaign=${u.campaign}`,
    ];
    if (u.content) parts.push(`utm_content=${u.content}`);
    if (u.term) parts.push(`utm_term=${u.term}`);
    firstQuery = parts.join("&");
  } else if (source.ref) {
    firstQuery = `ref=${source.ref}`;
  }

  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const emailDomain =
    EMAIL_DOMAINS[Math.floor(Math.random() * EMAIL_DOMAINS.length)];

  return {
    visitorId,
    country: countryProfile.code,
    region: regionProfile.code,
    city: regionProfile.city,
    timezone,
    language,
    ip,
    userAgent,
    screenWidth,
    screenHeight,
    viewportWidth,
    viewportHeight,
    persona,
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${emailDomain}`,
    userId: `usr_${visitorId.slice(0, 8)}`,
    firstReferrer,
    firstQuery,
  };
}

function getTrafficWeight(timeMs: number, timezone: string): number {
  const date = new Date(timeMs);

  let hour = 12;
  let day = 3;
  try {
    const localString = date.toLocaleString("en-US", { timeZone: timezone });
    const localDate = new Date(localString);
    hour = localDate.getHours();
    day = localDate.getDay();
  } catch {
    hour = date.getUTCHours();
    day = date.getUTCDay();
  }

  let hourWeight = 0.2;
  if (hour >= 9 && hour <= 18) {
    hourWeight = 0.8 + 0.2 * Math.sin(((hour - 9) * Math.PI) / 9);
  } else if (hour > 18 && hour <= 23) {
    hourWeight = 0.8 - 0.6 * ((hour - 18) / 5);
  } else {
    hourWeight = 0.2 - 0.1 * (hour / 8);
  }

  const isWeekend = day === 0 || day === 6;
  const dayWeight = isWeekend ? 0.55 : 1.0;

  return hourWeight * dayWeight;
}

const NOW = Date.now();
const THIRTY_DAYS_AGO = NOW - 30 * 24 * 60 * 60 * 1000;

function getRandomTimestamp(timezone: string): number {
  while (true) {
    const randomTime = Math.floor(
      THIRTY_DAYS_AGO + Math.random() * (NOW - THIRTY_DAYS_AGO),
    );
    const weight = getTrafficWeight(randomTime, timezone);
    if (Math.random() < weight) {
      return randomTime;
    }
  }
}

console.log("🎨 Simulating realistic visitor sessions...");
const allEvents: SeedEvent[] = [];
let generatedVisitorCount = 0;

while (allEvents.length < TOTAL_EVENTS_TARGET + 500) {
  const visitor = generateVisitor();
  generatedVisitorCount++;

  const baseTimestamp = getRandomTimestamp(visitor.timezone);

  const numSessions =
    visitor.persona === "supporter" ? 2 : Math.random() < 0.2 ? 2 : 1;
  let sessionTime = baseTimestamp;

  for (let sNum = 1; sNum <= numSessions; sNum++) {
    const sessionId = generateUUID();
    if (sNum > 1) {
      sessionTime +=
        (Math.floor(Math.random() * 5) + 1) * 24 * 60 * 60 * 1000 +
        Math.random() * 4 * 60 * 60 * 1000;
    }

    if (sessionTime > NOW) continue;

    let currentOffset = 0;

    const buildPayload = (
      type: string,
      path: string,
      extraData?: Record<string, string>,
    ) => {
      const url = `https://${DOMAIN}${path}`;
      const referrer =
        sNum === 1 && currentOffset === 0
          ? (visitor.firstReferrer ?? undefined)
          : undefined;

      let finalHref = url;
      if (sNum === 1 && currentOffset === 0 && visitor.firstQuery) {
        finalHref += `?${visitor.firstQuery}`;
      }

      return {
        websiteId: WEBSITE_ID,
        domain: DOMAIN,
        href: finalHref,
        referrer,
        viewport: {
          width: visitor.viewportWidth,
          height: visitor.viewportHeight,
        },
        visitorId: visitor.visitorId,
        sessionId,
        visitorSessionNumber: sNum,
        language: visitor.language,
        timezone: visitor.timezone,
        screenWidth: visitor.screenWidth,
        screenHeight: visitor.screenHeight,
        type,
        extraData,
        at: {
          country: visitor.country,
          region: visitor.region,
          city: visitor.city,
          ip: visitor.ip,
          timestamp: Math.floor(sessionTime + currentOffset),
          userAgent: visitor.userAgent,
        },
      };
    };

    const buildGoal = (
      goalName: string,
      path: string,
      data?: Record<string, string>,
    ) => buildPayload("custom", path, { eventName: goalName, ...data });

    if (visitor.persona === "bounce") {
      const landPages = [
        "/",
        "/blog/building-a-lightweight-analytics-engine",
        "/blog/my-setup-2026",
        "/projects",
      ];
      const page = landPages[Math.floor(Math.random() * landPages.length)];
      allEvents.push(buildPayload("pageview", page));

      if (page.startsWith("/blog/")) {
        if (Math.random() < 0.35) {
          currentOffset += (Math.floor(Math.random() * 40) + 20) * 1000;
          allEvents.push(
            buildGoal("article_read", page, {
              scroll_percentage: "100",
              threshold: "0.9",
              delay: "0",
            }),
          );
        }
        if (Math.random() < 0.2) {
          currentOffset += 3000;
          allEvents.push(
            buildGoal("code_copy", page, { language: "typescript" }),
          );
        }
      }
      if (Math.random() < 0.07) {
        currentOffset += 2000;
        allEvents.push(buildGoal("theme_toggle", page, { theme: "dark" }));
      }
    } else if (visitor.persona === "explorer") {
      allEvents.push(buildPayload("pageview", "/"));

      if (Math.random() < 0.06) {
        currentOffset += 3000;
        allEvents.push(buildGoal("theme_toggle", "/", { theme: "dark" }));
      }

      currentOffset += (Math.floor(Math.random() * 25) + 15) * 1000;
      const nextPages = ["/blog", "/projects", "/about"];
      const page2 = nextPages[Math.floor(Math.random() * nextPages.length)];
      allEvents.push(buildPayload("pageview", page2));

      if (page2 === "/projects") {
        if (Math.random() < 0.4) {
          currentOffset += 4000;
          allEvents.push(
            buildGoal("project_click", page2, { project: "analytics-engine" }),
          );
        }
        if (Math.random() < 0.15) {
          currentOffset += 6000;
          allEvents.push(
            buildGoal("demo_click", page2, { project: "analytics-engine" }),
          );
        }
        if (Math.random() < 0.3) {
          currentOffset += 5000;
          allEvents.push(
            buildPayload("external_link", page2, {
              url: "https://github.com/tabsircg/project",
              text: "View on GitHub",
            }),
          );
        }
      } else if (page2 === "/blog") {
        if (Math.random() < 0.3) {
          currentOffset += 5000;
          allEvents.push(
            buildGoal("search_performed", page2, { query: "analytics" }),
          );
        }
        if (Math.random() < 0.08) {
          currentOffset += 3000;
          allEvents.push(buildGoal("rss_subscribe", page2, { format: "rss" }));
        }
      } else if (page2 === "/about") {
        if (Math.random() < 0.25) {
          currentOffset += 6000;
          allEvents.push(buildGoal("cv_download", page2, { format: "pdf" }));
        }
        if (Math.random() < 0.3) {
          currentOffset += 5000;
          allEvents.push(
            buildGoal("social_follow", page2, { network: "twitter" }),
          );
          currentOffset += 1500;
          allEvents.push(
            buildPayload("external_link", page2, {
              url: "https://twitter.com/tabsircg",
              text: "@tabsircg",
            }),
          );
        }
      }

      if (Math.random() < 0.5) {
        currentOffset += (Math.floor(Math.random() * 30) + 15) * 1000;
        const page3 =
          page2 === "/blog"
            ? "/blog/building-a-lightweight-analytics-engine"
            : "/contact";
        allEvents.push(buildPayload("pageview", page3));

        if (page3.startsWith("/blog/")) {
          if (Math.random() < 0.4) {
            currentOffset += (Math.floor(Math.random() * 40) + 20) * 1000;
            allEvents.push(
              buildGoal("article_read", page3, {
                scroll_percentage: "100",
                threshold: "0.9",
                delay: "0",
              }),
            );
          }
          if (Math.random() < 0.2) {
            currentOffset += 3000;
            allEvents.push(
              buildGoal("code_copy", page3, { language: "typescript" }),
            );
          }
        }
      }
    } else if (visitor.persona === "signer") {
      const isNewsletter = Math.random() < 0.6;

      if (isNewsletter) {
        allEvents.push(buildPayload("pageview", "/blog"));
        currentOffset += 20000;
        allEvents.push(buildPayload("pageview", "/newsletter"));
        currentOffset += 15000;

        allEvents.push(
          buildGoal("newsletter_signup", "/newsletter", { source: "blog" }),
        );
        allEvents.push(
          buildPayload("identify", "/newsletter", {
            user_id: visitor.userId,
            name: `${visitor.firstName} ${visitor.lastName}`,
            image: "",
          }),
        );
      } else {
        allEvents.push(buildPayload("pageview", "/"));
        currentOffset += 20000;
        allEvents.push(buildPayload("pageview", "/contact"));
        currentOffset += 30000;

        const subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
        allEvents.push(buildGoal("contact_submit", "/contact", { subject }));
        allEvents.push(
          buildPayload("identify", "/contact", {
            user_id: visitor.userId,
            name: `${visitor.firstName} ${visitor.lastName}`,
            image: "",
          }),
        );
        currentOffset += 2000;
        allEvents.push(buildPayload("pageview", "/thank-you"));
      }
    } else if (visitor.persona === "supporter") {
      if (sNum === 1) {
        allEvents.push(buildPayload("pageview", "/"));
        currentOffset += 15000;
        allEvents.push(buildPayload("pageview", "/projects"));
        currentOffset += 20000;

        allEvents.push(
          buildGoal("coffee_click", "/projects", { location: "projects" }),
        );
        currentOffset += 5000;

        const stripeSessionId = `cs_live_${generateUUID().replace(/-/g, "").slice(0, 24)}`;
        const amountCents =
          COFFEE_AMOUNTS_CENTS[
            Math.floor(Math.random() * COFFEE_AMOUNTS_CENTS.length)
          ];
        const successPath = `/success?session_id=${stripeSessionId}`;
        const identity = {
          customer_name: `${visitor.firstName} ${visitor.lastName}`,
          customer_email: visitor.email,
          customer_id: `cus_${generateUUID().replace(/-/g, "").slice(0, 14)}`,
          transaction_id: `pi_${generateUUID().replace(/-/g, "").slice(0, 24)}`,
        };

        allEvents.push(buildPayload("pageview", successPath));
        currentOffset += 4000;
        allEvents.push(
          buildPayload("payment", successPath, {
            stripe_event_id: stripeEventId(),
            kind: "charge",
            ...identity,
            amount_cents: String(amountCents),
          }),
        );
        currentOffset += 2000;
        allEvents.push(
          buildPayload("identify", successPath, {
            user_id: visitor.userId,
            name: `${visitor.firstName} ${visitor.lastName}`,
            image: "",
          }),
        );

        const reversal = reversalFor(amountCents);
        if (reversal && sessionTime + currentOffset + reversal.delay <= NOW) {
          currentOffset += reversal.delay;
          allEvents.push(
            buildPayload("payment", successPath, {
              stripe_event_id: stripeEventId(),
              kind: reversal.kind,
              ...identity,
              amount_cents: String(-reversal.cents),
            }),
          );
        }
      } else {
        allEvents.push(buildPayload("pageview", "/"));
        currentOffset += 15000;
        allEvents.push(
          buildPayload(
            "pageview",
            "/blog/building-a-lightweight-analytics-engine",
          ),
        );
        allEvents.push(
          buildPayload(
            "identify",
            "/blog/building-a-lightweight-analytics-engine",
            {
              user_id: visitor.userId,
              name: `${visitor.firstName} ${visitor.lastName}`,
              image: "",
            },
          ),
        );
      }
    }
  }
}

const SEED_CRAWLERS: Array<{
  userAgent: string;
  name: string;
  category: BotCategory;
}> = [
  {
    userAgent:
      "Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)",
    name: "GPTBot",
    category: "training",
  },
  {
    userAgent:
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
    name: "ClaudeBot",
    category: "training",
  },
  {
    userAgent:
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    name: "Googlebot",
    category: "search_index",
  },
  {
    userAgent:
      "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    name: "Bingbot",
    category: "search_index",
  },
  {
    userAgent:
      "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
    name: "PerplexityBot",
    category: "ai_crawler",
  },
  {
    userAgent:
      "Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com)",
    name: "Bytespider",
    category: "training",
  },
  {
    userAgent: "CCBot/2.0 (https://commoncrawl.org/faq/)",
    name: "CCBot",
    category: "training",
  },
  {
    userAgent:
      "ChatGPT-User Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko)",
    name: "ChatGPT-User",
    category: "answer_fetch",
  },
];

const botEventCount = Math.floor(TOTAL_EVENTS_TARGET * 0.05);
for (let i = 0; i < botEventCount; i++) {
  const crawler =
    SEED_CRAWLERS[Math.floor(Math.random() * SEED_CRAWLERS.length)];
  const botTimestamp = Math.floor(
    THIRTY_DAYS_AGO + Math.random() * (NOW - THIRTY_DAYS_AGO),
  );
  const pages = [
    "/",
    "/blog",
    "/projects",
    "/about",
    "/blog/building-a-lightweight-analytics-engine",
  ];
  const page = pages[Math.floor(Math.random() * pages.length)];

  allEvents.push({
    websiteId: WEBSITE_ID,
    domain: DOMAIN,
    href: `https://${DOMAIN}${page}`,
    type: "pageview",
    crawler: { name: crawler.name, category: crawler.category },
    at: {
      ip: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      timestamp: botTimestamp,
    },
  });
}

console.log("🧹 Sorting events chronologically...");
allEvents.sort((a, b) => a.at.timestamp - b.at.timestamp);

function applyPageviewThrottle(events: SeedEvent[]): SeedEvent[] {
  const lastSeen = new Map<string, number>();

  return events.filter((e) => {
    if (isCrawlEvent(e) || e.type !== "pageview") return true;
    const key = `${e.visitorId}|${e.href}`;
    const at = e.at.timestamp;
    const previous = lastSeen.get(key);
    if (previous !== undefined && at - previous < 60_000) return false;
    lastSeen.set(key, at);
    return true;
  });
}

const throttled = applyPageviewThrottle(allEvents);
const droppedByThrottle = allEvents.length - throttled.length;
const finalEvents = throttled;
console.log(
  `✨ Generated ${finalEvents.length} events (incl. ~5% bot traffic) from ${generatedVisitorCount} simulated visitors.`,
);
console.log(
  `   ${droppedByThrottle} repeat pageviews dropped by the SDK's 60s throttle.`,
);
console.log(
  `Timeline spans from: ${new Date(finalEvents[0].at.timestamp).toLocaleString()} to ${new Date(finalEvents[finalEvents.length - 1].at.timestamp).toLocaleString()}\n`,
);

function toPaymentRow(p: SeedBrowserEvent): PaymentEventInput {
  const { amount_cents, ...extra } = (p.extraData ?? {}) as Record<
    string,
    string
  >;

  return {
    website_id: p.websiteId,
    type: "payment",
    visitor_id: p.visitorId,
    session_id: p.sessionId,
    extra_data: encodeExtraData(extra),
    revenue_cents: Number(amount_cents ?? 0),
    timestamp: p.at.timestamp,
  };
}

function toCrawlRow(p: SeedCrawlEvent): CrawlEventInput {
  return {
    website_id: p.websiteId,
    type: p.type,
    domain: p.domain,
    href: p.href,
    ...(p.referrer ? { referrer: p.referrer } : {}),
    is_bot: 1,
    bot_category: p.crawler.category,
    bot_name: p.crawler.name,
    ip: p.at.ip,
    timestamp: p.at.timestamp,
  };
}

function toBrowserRow(p: SeedBrowserEvent): BrowserEventInput {
  const { browser, os, device } = parseUA(p.at.userAgent);
  const extra = (p.extraData ?? {}) as Record<string, string>;

  return {
    website_id: p.websiteId,
    type: p.type,
    domain: p.domain,
    href: p.href,
    ...(p.referrer ? { referrer: p.referrer } : {}),
    visitor_id: p.visitorId,
    session_id: p.sessionId,
    language: p.language,
    timezone: p.timezone,
    event_name: toEventName(extra, p.type),
    extra_data: encodeExtraData(extra),
    country: p.at.country,
    region: p.at.region,
    city: p.at.city,
    browser,
    os,
    device,
    ip: p.at.ip,
    viewport_w: toUint16(p.viewport.width),
    viewport_h: toUint16(p.viewport.height),
    screen_w: toUint16(p.screenWidth),
    screen_h: toUint16(p.screenHeight),
    session_number: toUint16(p.visitorSessionNumber),
    timestamp: p.at.timestamp,
  };
}

function toRow(p: SeedEvent): AnalyticsEventInput {
  if (isCrawlEvent(p)) return toCrawlRow(p);
  if (p.type === "payment") return toPaymentRow(p);
  return toBrowserRow(p);
}

function findRepoRoot(start: string): string {
  let dir = start;
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, "pnpm-workspace.yaml"))) return dir;
    dir = dirname(dir);
  }
  return start;
}

function loadTinybirdCreds(): { host: string; token: string } {
  if (process.env.TINYBIRD_HOST && process.env.TINYBIRD_TOKEN) {
    return {
      host: process.env.TINYBIRD_HOST,
      token: process.env.TINYBIRD_TOKEN,
    };
  }
  const tinyb = join(
    findRepoRoot(process.cwd()),
    "apps/analytics-worker/.tinyb",
  );
  if (existsSync(tinyb)) {
    const parsed = JSON.parse(readFileSync(tinyb, "utf8"));
    if (parsed.host && parsed.token) {
      return { host: parsed.host, token: parsed.token };
    }
  }
  throw new Error(
    "Tinybird credentials not found. Set TINYBIRD_HOST + TINYBIRD_TOKEN, or run `tb login` from apps/analytics-worker.",
  );
}

const BATCH_SIZE = 1000;

async function seedTinybird() {
  const { host, token } = loadTinybirdCreds();
  const url = `${host}/v0/events?name=${ANALYTICS_TABLE}`;
  const total = finalEvents.length;

  console.log(
    `📥 Inserting ${total} rows into ${host} (${ANALYTICS_TABLE})...`,
  );
  let inserted = 0;
  let quarantined = 0;
  let failed = 0;

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = finalEvents.slice(i, i + BATCH_SIZE);
    const body = batch.map((p) => JSON.stringify(toRow(p))).join("\n");

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-ndjson",
      },
      body,
    });

    if (res.ok) {
      const result = (await res.json().catch(() => ({}))) as {
        successful_rows?: number;
        quarantined_rows?: number;
      };
      inserted += result.successful_rows ?? batch.length;
      quarantined += result.quarantined_rows ?? 0;
    } else {
      failed += batch.length;
      console.warn(
        `Batch @${i} failed (${res.status}): ${(await res.text()).slice(0, 200)}`,
      );
    }

    const done = Math.min(i + BATCH_SIZE, total);
    if ((i / BATCH_SIZE) % 20 === 0 || done === total) {
      console.log(`  ${done}/${total}`);
    }
  }

  console.log(
    `\n🎉 Done. ✅ ${inserted} inserted, ⚠️ ${quarantined} quarantined, ❌ ${failed} failed.`,
  );
}

seedTinybird().catch((err) => {
  console.error("Fatal error during seeding:", err);
  process.exit(1);
});
