import { wrapRoute } from "@/lib/appUtils";
import { readPortfolioCatalog } from "@/actions/configActions";

export const GET = wrapRoute(async () => readPortfolioCatalog());
