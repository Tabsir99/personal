/// <reference types="node" />
// We will import Node's native crypto
import nodeCrypto from "crypto";
import { DevEventPayload } from "../schema";

const WEBSITE_ID = "my-portfolio-blog";
const DOMAIN = "tabsircg.com";
const TOTAL_EVENTS_TARGET = 1000;

const TARGET_URL =
  "https://analytics-backend-dev.tabsirsfc.workers.dev/api/events";

console.log(`🚀 Starting seed script targeting: ${TARGET_URL}`);
console.log(`Website ID: ${WEBSITE_ID}`);
console.log(`Domain: ${DOMAIN}\n`);

// Helper: UUID generator
function generateUUID(): string {
  return nodeCrypto.randomUUID();
}

// Data Lists for realism
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

// Country & timezone profiles
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

// Helper to choose item from weighted array
function selectWeighted<T extends { weight: number }>(items: T[]): T {
  const r = Math.random();
  let sum = 0;
  for (const item of items) {
    sum += item.weight;
    if (r <= sum) return item;
  }
  return items[items.length - 1];
}

// Helper to generate a coherent visitor
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
  firstReferrer: string | null;
  firstUtm: string | null;
}

function generateVisitor(): VisitorProfile {
  const visitorId = generateUUID();

  // Coherent location
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

  // Realistic IP mock
  const ip = `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`;

  // Coherent device type
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
      { w: 390, h: 844 }, // iPhone 13/14
      { w: 412, h: 915 }, // Pixel 7
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

  // Persona
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

  // Acquisition channel referrers
  const channelRand = Math.random();
  let firstReferrer: string | null = null;
  let firstUtm: string | null = null;

  if (channelRand < 0.4) {
    // Search Engine
    firstReferrer = "https://www.google.com";
  } else if (channelRand < 0.65) {
    // Direct
    firstReferrer = null;
  } else if (channelRand < 0.8) {
    // Twitter/X
    firstReferrer = "https://t.co/";
  } else if (channelRand < 0.9) {
    // Hacker News
    firstReferrer = "https://news.ycombinator.com/";
  } else if (channelRand < 0.95) {
    // GitHub
    firstReferrer = "https://github.com/";
  } else {
    // Paid Campaign
    firstReferrer = "https://www.google.com";
    firstUtm = "utm_source=google&utm_medium=cpc&utm_campaign=blog_promo";
  }

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
    firstReferrer,
    firstUtm,
  };
}

// Rejection sampling for Diurnal & Weekly traffic curves
function getTrafficWeight(timeMs: number, timezone: string): number {
  const date = new Date(timeMs);

  // Calculate hour and day in visitor's local timezone
  let hour = 12;
  let day = 3;
  try {
    const localString = date.toLocaleString("en-US", { timeZone: timezone });
    const localDate = new Date(localString);
    hour = localDate.getHours();
    day = localDate.getDay();
  } catch {
    // Fallback if timezone is invalid
    hour = date.getUTCHours();
    day = date.getUTCDay();
  }

  // Hour curve (high traffic at 10-12 and 14-17, low at 2-4 AM)
  let hourWeight = 0.2;
  if (hour >= 9 && hour <= 18) {
    hourWeight = 0.8 + 0.2 * Math.sin(((hour - 9) * Math.PI) / 9); // Peaks around 13-14 (1.0)
  } else if (hour > 18 && hour <= 23) {
    hourWeight = 0.8 - 0.6 * ((hour - 18) / 5); // Drops to 0.2
  } else {
    hourWeight = 0.2 - 0.1 * (hour / 8); // Very low in early morning
  }

  // Weekly curve (weekend traffic drops by ~45%)
  const isWeekend = day === 0 || day === 6;
  const dayWeight = isWeekend ? 0.55 : 1.0;

  return hourWeight * dayWeight;
}

// Timeline configs
const NOW = Date.now();
const THIRTY_DAYS_AGO = NOW - 30 * 24 * 60 * 60 * 1000;

function getRandomTimestamp(timezone: string): number {
  // Rejection sampling loop
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

// Generate the full pool of events
console.log("🎨 Simulating realistic visitor sessions...");
const allEvents: DevEventPayload[] = [];
let generatedVisitorCount = 0;

// Continue generating visitors until we have safely exceeded the target, then sort and slice.
while (allEvents.length < TOTAL_EVENTS_TARGET + 500) {
  const visitor = generateVisitor();
  generatedVisitorCount++;

  // Determine visitor's first seen date
  const baseTimestamp = getRandomTimestamp(visitor.timezone);
  const firstSeenStr = new Date(baseTimestamp).toISOString();

  // Simulate one or more sessions
  const numSessions =
    visitor.persona === "supporter" ? 2 : Math.random() < 0.2 ? 2 : 1;
  let sessionTime = baseTimestamp;

  for (let sNum = 1; sNum <= numSessions; sNum++) {
    // Regenerate session ID and advance time if it's a returning session
    const sessionId = generateUUID();
    if (sNum > 1) {
      sessionTime +=
        (Math.floor(Math.random() * 5) + 1) * 24 * 60 * 60 * 1000 +
        Math.random() * 4 * 60 * 60 * 1000; // 1 to 5 days later
    }

    if (sessionTime > NOW) continue; // Don't generate events in the future

    let currentOffset = 0;

    const buildPayload = (
      type: string,
      path: string,
      extraData?: Record<string, string>,
    ) => {
      const url = `https://${DOMAIN}${path}`;
      const referrer =
        sNum === 1 && currentOffset === 0 ? visitor.firstReferrer : null;

      // Add query parameters for UTM campaigns
      let finalHref = url;
      if (sNum === 1 && currentOffset === 0 && visitor.firstUtm) {
        finalHref += `?${visitor.firstUtm}`;
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
        visitorFirstSeenAt: firstSeenStr,
        visitorSessionNumber: sNum,
        language: visitor.language,
        timezone: visitor.timezone,
        screenWidth: visitor.screenWidth,
        screenHeight: visitor.screenHeight,
        type,
        extraData,
        cfOverride: {
          country: visitor.country,
          region: visitor.region,
          city: visitor.city,
          ip: visitor.ip,
          timestamp: Math.floor(sessionTime + currentOffset),
          userAgent: visitor.userAgent,
        },
      };
    };

    // Simulate persona journey
    if (visitor.persona === "bounce") {
      const landPages = [
        "/",
        "/blog/building-a-lightweight-analytics-engine",
        "/blog/my-setup-2026",
        "/projects",
      ];
      const page = landPages[Math.floor(Math.random() * landPages.length)];
      allEvents.push(buildPayload("pageview", page));
    } else if (visitor.persona === "explorer") {
      // Lands on Home
      allEvents.push(buildPayload("pageview", "/"));

      // Page 2 (about or blog)
      currentOffset += (Math.floor(Math.random() * 25) + 15) * 1000; // 15-40s reading time
      const nextPages = ["/blog", "/projects", "/about"];
      const page2 = nextPages[Math.floor(Math.random() * nextPages.length)];
      allEvents.push(buildPayload("pageview", page2));

      // Optional external link click
      if (page2 === "/projects" && Math.random() < 0.3) {
        currentOffset += 5000;
        allEvents.push(
          buildPayload("external_link", page2, {
            url: "https://github.com/tabsircg/project",
            text: "View on GitHub",
          }),
        );
      } else if (page2 === "/about" && Math.random() < 0.3) {
        currentOffset += 5000;
        allEvents.push(
          buildPayload("external_link", page2, {
            url: "https://twitter.com/tabsircg",
            text: "@tabsircg",
          }),
        );
      }

      // Page 3
      if (Math.random() < 0.5) {
        currentOffset += (Math.floor(Math.random() * 30) + 15) * 1000;
        const page3 =
          page2 === "/blog"
            ? "/blog/building-a-lightweight-analytics-engine"
            : "/contact";
        allEvents.push(buildPayload("pageview", page3));
      }
    } else if (visitor.persona === "signer") {
      // Submitting newsletter or contact form
      const isNewsletter = Math.random() < 0.6;
      const firstName =
        FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lastName =
        LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${EMAIL_DOMAINS[Math.floor(Math.random() * EMAIL_DOMAINS.length)]}`;

      if (isNewsletter) {
        allEvents.push(buildPayload("pageview", "/blog"));
        currentOffset += 20000;
        allEvents.push(buildPayload("pageview", "/newsletter"));
        currentOffset += 15000;

        // Newsletter subscription event
        allEvents.push(
          buildPayload("newsletter_subscribed", "/newsletter", { email }),
        );
        allEvents.push(
          buildPayload("identify", "/newsletter", {
            user_id: `sub_${visitor.visitorId.slice(0, 8)}`,
            name: `${firstName} ${lastName}`,
          }),
        );
      } else {
        allEvents.push(buildPayload("pageview", "/"));
        currentOffset += 20000;
        allEvents.push(buildPayload("pageview", "/contact"));
        currentOffset += 30000;

        // Contact submission
        const subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
        allEvents.push(
          buildPayload("contact_form_submitted", "/contact", {
            email,
            subject,
          }),
        );
        allEvents.push(
          buildPayload("identify", "/contact", {
            user_id: `lead_${visitor.visitorId.slice(0, 8)}`,
            name: `${firstName} ${lastName}`,
          }),
        );
        currentOffset += 2000;
        allEvents.push(buildPayload("pageview", "/thank-you"));
      }
    } else if (visitor.persona === "supporter") {
      // Buy me a coffee supporter
      const firstName =
        FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lastName =
        LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${EMAIL_DOMAINS[Math.floor(Math.random() * EMAIL_DOMAINS.length)]}`;

      if (sNum === 1) {
        // Session 1: Makes a coffee supporter payment
        allEvents.push(buildPayload("pageview", "/"));
        currentOffset += 15000;
        allEvents.push(buildPayload("pageview", "/projects"));
        currentOffset += 20000;

        // Click buy me coffee
        allEvents.push(buildPayload("buy_me_a_coffee_click", "/projects"));
        currentOffset += 5000;

        // Redirects to Stripe success page
        const stripeSessionId = `cs_live_${generateUUID().replace(/-/g, "").slice(0, 24)}`;
        allEvents.push(
          buildPayload("pageview", `/success?session_id=${stripeSessionId}`),
        );
        allEvents.push(
          buildPayload("payment", `/success?session_id=${stripeSessionId}`, {
            stripe_session_id: stripeSessionId,
            email,
          }),
        );
        allEvents.push(
          buildPayload("identify", `/success?session_id=${stripeSessionId}`, {
            user_id: `supporter_${visitor.visitorId.slice(0, 8)}`,
            name: `${firstName} ${lastName}`,
          }),
        );
      } else {
        // Session 2: Just returns to read blogs
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
              user_id: `supporter_${visitor.visitorId.slice(0, 8)}`,
              name: `${firstName} ${lastName}`,
            },
          ),
        );
      }
    }
  }
}

// Simulate bot traffic (~5% of total)
const BOT_USER_AGENTS = [
  "Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)",
  "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
  "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
  "Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com)",
  "CCBot/2.0 (https://commoncrawl.org/faq/)",
  "ChatGPT-User Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko)",
];

const botEventCount = Math.floor(TOTAL_EVENTS_TARGET * 0.05);
for (let i = 0; i < botEventCount; i++) {
  const botUA = BOT_USER_AGENTS[Math.floor(Math.random() * BOT_USER_AGENTS.length)];
  const botTimestamp = Math.floor(
    THIRTY_DAYS_AGO + Math.random() * (NOW - THIRTY_DAYS_AGO),
  );
  const pages = ["/", "/blog", "/projects", "/about", "/blog/building-a-lightweight-analytics-engine"];
  const page = pages[Math.floor(Math.random() * pages.length)];

  allEvents.push({
    websiteId: WEBSITE_ID,
    domain: DOMAIN,
    href: `https://${DOMAIN}${page}`,
    referrer: null,
    viewport: { width: 0, height: 0 },
    visitorId: generateUUID(),
    sessionId: generateUUID(),
    visitorFirstSeenAt: new Date(botTimestamp).toISOString(),
    visitorSessionNumber: 1,
    language: "en-US",
    timezone: "UTC",
    screenWidth: 0,
    screenHeight: 0,
    type: "pageview",
    cfOverride: {
      country: "US",
      region: "Unknown",
      city: "Unknown",
      ip: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      timestamp: botTimestamp,
      userAgent: botUA,
    },
  });
}

// Chronologically sort all events
console.log("🧹 Sorting events chronologically...");
allEvents.sort(
  (a, b) => (a.cfOverride?.timestamp ?? 0) - (b.cfOverride?.timestamp ?? 0),
);

// Slice to EXACTLY the target number of events
const finalEvents = allEvents;
console.log(
  `✨ Generated exactly ${finalEvents.length} events from ${generatedVisitorCount} unique simulated visitors.`,
);
console.log(
  `Timeline spans from: ${new Date(finalEvents[0].cfOverride?.timestamp ?? 0).toLocaleString()} to ${new Date(finalEvents[finalEvents.length - 1].cfOverride?.timestamp ?? 0).toLocaleString()}\n`,
);

// 2. Perform HTTP ingestion requests to backend worker with concurrency limit
const CONCURRENCY_LIMIT = 80;

async function seedIngestion() {
  console.log(
    `📥 Sending events in batches of ${CONCURRENCY_LIMIT} to ${TARGET_URL}...`,
  );
  let successCount = 0;
  let failureCount = 0;

  const progressStep = Math.max(1, Math.floor(TOTAL_EVENTS_TARGET / 10));

  const tasks = finalEvents.map((event, idx) => {
    return async () => {
      const userAgent = event.cfOverride?.userAgent ?? "";

      try {
        const res = await fetch(TARGET_URL, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
            "User-Agent": userAgent,
            Origin: `https://${DOMAIN}`,
          },
          body: JSON.stringify(event),
        });

        if (res.status === 200) {
          successCount++;
        } else {
          failureCount++;
          const text = await res.text();
          console.warn(
            `[Idx ${idx}] Ingestion failed with status ${res.status}: ${text.slice(0, 100)}`,
          );
        }
      } catch (err: any) {
        failureCount++;
        if (err.code === "ECONNREFUSED") {
          console.error(
            `🔴 Critical Error: Local worker is not running! Run "pnpm --filter analytics-backend dev" first.`,
          );
          process.exit(1);
        } else {
          console.warn(`[Idx ${idx}] Network error: ${err.message}`);
        }
      }

      // Log progress dynamically (e.g. every 10% of total target)
      const totalSent = successCount + failureCount;
      if (totalSent % progressStep === 0) {
        console.log(
          `Progress: ${totalSent}/${TOTAL_EVENTS_TARGET} sent (${successCount} successful, ${failureCount} failed)`,
        );
      }
    };
  });

  const start = Date.now();
  await runWithConcurrencyLimit(tasks, CONCURRENCY_LIMIT);
  const duration = ((Date.now() - start) / 1000).toFixed(1);

  console.log(`\n🎉 Seeding Completed in ${duration}s!`);
  console.log(`   ✅ Successful Ingestions: ${successCount}`);
  console.log(`   ❌ Failed Ingestions: ${failureCount}`);
}

async function runWithConcurrencyLimit(
  tasks: (() => Promise<void>)[],
  limit: number,
) {
  const active = new Set<Promise<void>>();
  for (const task of tasks) {
    const promise = task();
    active.add(promise);
    promise.finally(() => active.delete(promise));
    if (active.size >= limit) {
      await Promise.allSettled(active);
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  await Promise.all(active);
}

// Execute the HTTP seeding pipeline
seedIngestion().catch((err) => {
  console.error("Fatal execution error during seeding:", err);
  process.exit(1);
});
