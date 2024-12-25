import { NextRequest } from "next/server";
import { z } from "zod";

const TrafficSources = z.enum([
  "direct",
  "organic",
  "facebook",
  "linkedin",
  "reddit",
  "twitter",
]);

const isoDate = z.string().refine(
  (value) => !isNaN(Date.parse(value)), // Check if it's a valid ISO string
  { message: "Invalid ISO date string" }
);

const PageVisitSchema = z.object({
  entryTime: isoDate, // Entry time must be a Date object
  exitTime: isoDate, // Nullable Date for exit time
  depthScrolled: z.number().nonnegative(), // Depth scrolled must be non-negative
  recommendationClicks: z.number().nonnegative(), // Non-negative number
  recommendationVisible: z.number().nonnegative(), // Non-negative number
});

const SessionSchema = z.object({
  isReturning: z.boolean(), // Boolean for returning status
  sessionId: z.string(), // Session ID must be a string
  startTime: isoDate, // Start time must be a Date object
  endTime: isoDate, // Nullable Date for end time
  referralSource: TrafficSources, // Referral source must match TrafficSources enum
  exitPage: z.string(), // Nullable string for exit page
  pageVisits: z.record(z.string(), PageVisitSchema), // Record with page key and PageVisitSchema as value
  ipAdd: z.string().optional(), // Optional string for IP address
  country: z.string().optional(), // Optional string for country
});

export async function validateSession(request: NextRequest) {
  try {
    const session = await request.json();
    await SessionSchema.parseAsync(session);
    return true;
  } catch (error) {
    return false;
  }
}
