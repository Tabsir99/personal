import { wrapRoute } from "@/lib/appUtils";
import { readConfigFields } from "@/actions/configActions";

export const GET = wrapRoute(async () => readConfigFields());
