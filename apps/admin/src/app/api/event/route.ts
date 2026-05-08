import {
  AnalyticsEvent,
  PageExitEvent,
  PageViewEvent,
  SessionStartEvent,
  analyticsEventSchema,
} from "@/schemas/dashboardSchemas";
import { NextRequest, NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";
import { db } from "@/config/firebaseAdmin";
import { firestore } from "firebase-admin";

type FirestoreData = Record<string, firestore.FieldValue | string | number>;

const dailyStats = db.collection("daily_stats");
const geoStats = db.collection("geo_stats");
const pagePerformance = db.collection("page_performance");
const trafficSources = db.collection("traffic_sources");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = analyticsEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }
    const session = parsed.data;

    const country = request.headers.get("xCountry") || "unknown";

    let newSession: AnalyticsEvent = session;
    if (session.type === "session_start") {
      const ipAdd = request.headers.get("xIp") || "unknown";
      const userAgent = request.headers.get("user-agent") || "unknown";

      const parser = new UAParser(userAgent);
      const device = parser.getDevice().type;

      newSession = {
        ...session,
        ip: ipAdd,
        country,
        device,
      };
    }

    if (process.env.RUNTIME === "local") {
      console.info(newSession);
    }

    const date = new Date(newSession.timestamp).toISOString().split("T")[0];

    switch (newSession.type) {
      case "session_start":
        await handleSessionStart(newSession as SessionStartEvent, date);
        break;

      case "page_view":
        await handlePageView(newSession as PageViewEvent, date, country);
        break;

      case "page_exit":
        await handlePageExit(newSession as PageExitEvent, date, country);
        break;

      case "portfolio_view":
        await handlePortfolioView(date);
        break;
    }

    return NextResponse.json({});
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

async function handleSessionStart(event: SessionStartEvent, date: string) {
  const batch = db.batch();

  const dsRef = dailyStats.doc(date);
  batch.set(
    dsRef,
    {
      date,
      sessions: firestore.FieldValue.increment(1),
      uniqueVisits: firestore.FieldValue.increment(
        event.data.isReturning ? 0 : 1,
      ),
      pageViews: firestore.FieldValue.increment(0),
      bounces: firestore.FieldValue.increment(0),
      portfolioClicks: firestore.FieldValue.increment(0),
      totalSessionDuration: firestore.FieldValue.increment(0),
    },
    { merge: true },
  );

  const gsRef = geoStats.doc(`${date}_${event.country}`);
  batch.set(
    gsRef,
    {
      date,
      country: event.country,
      sessions: firestore.FieldValue.increment(1),
      uniqueVisits: firestore.FieldValue.increment(
        event.data.isReturning ? 0 : 1,
      ),
      [`devices.${event.device || "unknown"}`]:
        firestore.FieldValue.increment(1),
      pageViews: firestore.FieldValue.increment(0),
    },
    { merge: true },
  );

  const tsRef = trafficSources.doc(`${date}_${event.data.referralSource}`);
  batch.set(
    tsRef,
    {
      date,
      source: event.data.referralSource,
      sessions: firestore.FieldValue.increment(1),
      pageViews: firestore.FieldValue.increment(0),
      bounces: firestore.FieldValue.increment(0),
    },
    { merge: true },
  );

  await batch.commit();
}

async function handlePageView(
  event: PageViewEvent,
  date: string,
  country: string,
) {
  const batch = db.batch();

  const dsRef = dailyStats.doc(date);
  batch.set(
    dsRef,
    {
      date,
      pageViews: firestore.FieldValue.increment(1),
    },
    { merge: true },
  );

  const safePath = encodeURIComponent(event.path);
  const ppRef = pagePerformance.doc(`${date}_${safePath}`);
  batch.set(
    ppRef,
    {
      date,
      path: event.path,
      views: firestore.FieldValue.increment(1),
      totalTimeOnPage: firestore.FieldValue.increment(0),
      bounces: firestore.FieldValue.increment(0),
      exitCount: firestore.FieldValue.increment(0),
    },
    { merge: true },
  );

  const gsRef = geoStats.doc(`${date}_${country}`);
  batch.set(
    gsRef,
    {
      date,
      country,
      pageViews: firestore.FieldValue.increment(1),
    },
    { merge: true },
  );

  await batch.commit();
}

async function handlePageExit(
  event: PageExitEvent,
  date: string,
  country: string,
) {
  const batch = db.batch();

  const safePath = encodeURIComponent(event.path);
  const ppRef = pagePerformance.doc(`${date}_${safePath}`);

  const pageExitData: FirestoreData = {
    date,
    path: event.path,
    totalTimeOnPage: firestore.FieldValue.increment(event.data.timeOnPage),
    exitCount: firestore.FieldValue.increment(1),
  };

  const dailyStatsData: FirestoreData = {
    date,
    totalSessionDuration: firestore.FieldValue.increment(event.data.timeOnPage),
  };

  if (event.data.timeOnPage < 10) {
    pageExitData.bounces = firestore.FieldValue.increment(1);
    dailyStatsData.bounces = firestore.FieldValue.increment(1);

    const gsRef = geoStats.doc(`${date}_${country}`);
    batch.set(
      gsRef,
      {
        date,
        country,
        bounces: firestore.FieldValue.increment(1),
      },
      { merge: true },
    );
  }

  batch.set(ppRef, pageExitData, { merge: true });

  const dsRef = dailyStats.doc(date);
  batch.set(dsRef, dailyStatsData, { merge: true });

  await batch.commit();
}

async function handlePortfolioView(date: string) {
  const dsRef = dailyStats.doc(date);
  await dsRef.set(
    {
      date,
      portfolioClicks: firestore.FieldValue.increment(1),
    },
    { merge: true },
  );
}
