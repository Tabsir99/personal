import { wrapRoute } from "@/lib/appUtils";
import { readSiteConfig } from "@/actions/configActions";

export const GET = wrapRoute(async () => readSiteConfig());
