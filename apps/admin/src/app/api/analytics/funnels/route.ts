import { NextRequest } from "next/server";
import { wrapRoute } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import { listFunnels } from "@/actions/funnelActions";
import type { FunnelsListResponse } from "@/lib/analyticsTypes";

export const GET = wrapRoute<FunnelsListResponse>(async (req: NextRequest) => {
  await requireAuth();
  const websiteId = req.nextUrl.searchParams.get("websiteId") ?? "";
  const funnels = await listFunnels(websiteId);
  return { funnels };
});
