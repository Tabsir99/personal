import { wrapRoute } from "@/lib/appUtils";
import { readTags } from "@/actions/tagActions";

export const GET = wrapRoute(async () => readTags());
