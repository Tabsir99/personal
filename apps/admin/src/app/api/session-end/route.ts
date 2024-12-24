import { createData } from "@/lib/commonQuery";
import { Session } from "@/types/dashboardTypes";
import { Collections } from "@/utils/utils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const TrafficSources = z.enum([
  "direct",
  "organic",
  "facebook",
  "linkedin",
  "reddit",
  "twitter",
]);

const PageVisitSchema = z.object({
  entryTime: z.date(), // Entry time must be a Date object
  exitTime: z.date(), // Nullable Date for exit time
  depthScrolled: z.number().nonnegative(), // Depth scrolled must be non-negative
  recommendationClicks: z.number().nonnegative(), // Non-negative number
  recommendationVisible: z.number().nonnegative(), // Non-negative number
});

const SessionSchema = z.object({
  isReturning: z.boolean(), // Boolean for returning status
  sessionId: z.string(), // Session ID must be a string
  startTime: z.date(), // Start time must be a Date object
  endTime: z.date(), // Nullable Date for end time
  referralSource: TrafficSources, // Referral source must match TrafficSources enum
  exitPage: z.string(), // Nullable string for exit page
  pageVisits: z.record(z.string(), PageVisitSchema), // Record with page key and PageVisitSchema as value
  ipAdd: z.string().optional(), // Optional string for IP address
  country: z.string().optional(), // Optional string for country
});

export async function POST(request: NextRequest) {
  const countryCode = request.headers.get("CF-IPCountry") || "unknown";
  const ipAdd = request.headers.get("CF-Connecting-IP") || "unknown";

  try {
    const session = await request.json();
    await SessionSchema.parseAsync(session);
    console.log(session);

    const newSession: Session = {
      ...session,
      country: countryCode!,
      ipAdd: ipAdd!,
    };

    await createData({
      collectionName: Collections.SESSIONS,
      docId: newSession.sessionId,
      data: newSession,
    });
    return NextResponse.json({});
  } catch (error) {
    console.error(error);
    return NextResponse.json({}, { status: 500 });
  }
}
