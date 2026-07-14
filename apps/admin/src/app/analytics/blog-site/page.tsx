import { readSiteConfig } from "@/actions/configActions";
import SiteConfigEditor from "@/components/blog-site/SiteConfigEditor";

export const dynamic = "force-dynamic";

export default async function BlogSitePage() {
  const initial = await readSiteConfig();
  return <SiteConfigEditor initial={initial} />;
}
