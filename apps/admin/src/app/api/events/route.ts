import type {
  AnalyticsEvent,
  PageExitEvent,
  PageViewEvent,
  SessionStartEvent,
} from "@/types/dashboardTypes";
import { NextRequest, NextResponse } from "next/server";
import {
  getDailyStatsCollection,
  getGeoStatsCollection,
  getPagePerformanceCollection,
  getTrafficSourceCollection,
} from "@/lib/analyticsDb";
import browser from "bowser";

const [dailyStats, geoStats, pagePerformance, trafficSource] =
  await Promise.all([
    getDailyStatsCollection(),
    getGeoStatsCollection(),
    getPagePerformanceCollection(),
    getTrafficSourceCollection(),
  ]);

export async function POST(request: NextRequest) {
  try {
    const session = await request.json();

    let newSession: AnalyticsEvent = session;
    if (session.type === "session_start") {
      const countryCode = request.headers.get("xCountry") || "unknown";
      const ipAdd = request.headers.get("xIp") || "unknown";
      const userAgent = request.headers.get("user-agent") || "unknown";
      const device = browser.parse(userAgent).platform.type;
      newSession = {
        ...session,
        ip: ipAdd!,
        country: countryCode!,
        device,
      };
    }

    if (process.env.RUNTIME === "local") {
      console.log(newSession);
    }

    // return NextResponse.json({});
    const date = new Date(newSession.timestamp).toISOString().split("T")[0]; // YYYY-MM-DD

    switch (newSession.type) {
      case "session_start":
        await handleSessionStart(newSession, date);
        break;

      case "page_view":
        await handlePageView(newSession, date);
        break;

      case "page_exit":
        await handlePageExit(newSession, date);
        break;

      case "portfolio_view":
        await handlePortfolioView(date);
        break;
    }

    return NextResponse.json({});
  } catch (error) {
    console.error(error);
    return NextResponse.json({});
  }
}

async function handleSessionStart(event: SessionStartEvent, date: string) {
  // Update daily_stats
  await dailyStats.updateOne(
    { date },
    {
      $inc: {
        sessions: 1,
        uniqueVisits: event.data.isReturning ? 0 : 1,
      },
      $setOnInsert: {
        pageViews: 0,
        bounces: 0,
        portfolioClicks: 0,
        totalSessionDuration: 0,
      },
    },
    { upsert: true }
  );

  // Update geo_stats
  await geoStats.updateOne(
    { date, country: event.country },
    {
      $inc: {
        sessions: 1,
        uniqueVisits: event.data.isReturning ? 0 : 1,
        [`devices.${event.device || "unknown"}`]: 1,
      },
      $setOnInsert: { pageViews: 0 },
    },
    { upsert: true }
  );

  // Update traffic_sources
  await trafficSource.updateOne(
    { date, source: event.data.referralSource },
    {
      $inc: { sessions: 1 },
      $setOnInsert: {
        pageViews: 0,
        bounces: 0,
        totalSessionDuration: 0,
      },
    },
    { upsert: true }
  );
}

async function handlePageView(event: PageViewEvent, date: string) {
  // Update daily_stats
  await dailyStats.updateOne(
    { date },
    { $inc: { pageViews: 1 } },
    { upsert: true }
  );

  // Update page_performance
  await pagePerformance.updateOne(
    { date, path: event.path },
    {
      $inc: { views: 1 },
      $setOnInsert: {
        totalTimeOnPage: 0,
        bounces: 0,
        exitCount: 0,
      },
    },
    { upsert: true }
  );
}

async function handlePageExit(event: PageExitEvent, date: string) {
  // Update page_performance with time and scroll data
  await pagePerformance.updateOne(
    { date, path: event.path },
    {
      $inc: {
        totalTimeOnPage: event.data.timeOnPage,
        exitCount: 1,
      },
    },
    { upsert: true }
  );

  await dailyStats.updateOne(
    { date },
    { $inc: { totalSessionDuration: event.data.timeOnPage } }
  );

  // Note: You'll calculate avgTimeOnPage = totalTimeOnPage / exitCount on read
}

async function handlePortfolioView(date: string) {
  await dailyStats.updateOne(
    { date },
    { $inc: { portfolioClicks: 1 } },
    { upsert: true }
  );
}
