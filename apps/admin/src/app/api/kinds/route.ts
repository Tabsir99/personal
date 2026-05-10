import { wrapRoute } from "@/lib/appUtils";
import { readConfigField } from "@/actions/configActions";

export const GET = wrapRoute(async () => readConfigField("kinds"));
