import { NextRequest } from "next/server";
import { wrapRoute } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import { queryAE, F } from "@/lib/analyticsEngine";
import type { RealtimeResponse } from "@/lib/analyticsTypes";

export const GET = wrapRoute<RealtimeResponse>(async (req: NextRequest) => {
  await requireAuth();
  const websiteId = req.nextUrl.searchParams.get("websiteId");
  if (!websiteId) throw new Error("websiteId is required");
  if (!/^[\w-]+$/.test(websiteId)) throw new Error("Invalid websiteId");

  const tenMinAgo = Date.now() - 10 * 60 * 1000;

  const res = await queryAE<{ count: number }>(`
    SELECT COUNT(DISTINCT ${F.visitorId}) as count
    FROM ${F.engine}
    WHERE ${F.websiteId} = '${websiteId}'
      AND ${F.type} = 'pageview'
      AND ${F.isBot} = 0
      AND ${F.timestamp} >= ${tenMinAgo}
  `);

  return { count: Number(res.data[0]?.count ?? 0) };
});
