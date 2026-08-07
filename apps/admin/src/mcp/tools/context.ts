import "server-only";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import { readConfigFields } from "@/actions/configActions";
import { listFunnels } from "@/actions/funnelActions";
import { readWebsiteConfig } from "@/lib/analyticsWebsites";
import { analyticsSchemaDoc, firestoreSchemaDoc, sitesDoc } from "../docs";
import { guarded } from "../result";

const OPERATING_RULES = `# How to work on this admin

You are talking to the control plane for tabsircg.com: a Next.js admin that
owns the blog CMS and the portfolio's content, plus the Tinybird warehouse
behind the analytics dashboard.

Rules that are easy to get wrong and expensive to get wrong:

1. Revenue is three figures, never one. charge is money in; refund and dispute
   are money out, stored as separate positive rows. Net is
   charge - refund - dispute. Summing revenue_cents without splitting on kind
   overstates income.

2. Published posts are never edited in place. blog_update_draft opens (or
   reuses) a draft against the published post; nothing reaches the public site
   until blog_publish. Do not try to write a published doc directly.

3. Publishing and status changes are public. blog_publish, blog_set_status,
   blog_feature, config_add_value and config_update_site all revalidate the
   live portfolio. Confirm with the user before firing them.

4. Featuring is one-way. featuredAt is a timestamp, not a boolean; featuring a
   post replaces whichever was featured before and there is no unfeature.

5. Filter analytics on is_bot = 0 unless you specifically want crawlers. A
   traffic spike that does not convert is usually a crawler wave.

6. Prefer analytics_overview for headline numbers. Reach for analytics_query
   when you need something it does not cover; it takes ClickHouse SQL and
   accepts SELECT/WITH only.`;

async function taxonomyDoc(): Promise<string> {
  const config = await readConfigFields();
  return [
    "# Current blog taxonomy",
    "",
    `- tags: ${config.tags.join(", ") || "none"}`,
    `- kinds: ${config.kinds.join(", ") || "none"}`,
    `- schemaTypes: ${config.schemaTypes.join(", ") || "none"}`,
    "",
    "Reuse these rather than inventing new ones. Ask before adding a value.",
  ].join("\n");
}

async function funnelDoc(): Promise<string> {
  const { websites } = await readWebsiteConfig();
  const perSite = await Promise.all(
    websites.map(async (site) => {
      const funnels = await listFunnels(site.id);
      return funnels.length === 0
        ? `- ${site.name}: no funnels defined`
        : `- ${site.name}: ${funnels.map((f) => `${f.name} (${f.slug})`).join(", ")}`;
    }),
  );

  return ["# Funnels", "", ...perSite].join("\n");
}

export function registerContextTools(server: McpServer) {
  server.registerTool(
    "admin_context",
    {
      title: "Brief yourself on this admin",
      description:
        "One call that returns everything needed to work here safely: the operating rules, the analytics_events column contract and revenue model, the Firestore collection map and blog draft/published rules, the registered websites with their ids, the live blog taxonomy, and the defined funnels. Call this first in any session that touches this admin — especially outside its repo, where no project documentation is loaded.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () =>
      guarded(async () => {
        const [sites, taxonomy, funnels] = await Promise.all([
          sitesDoc(),
          taxonomyDoc(),
          funnelDoc(),
        ]);

        return [
          OPERATING_RULES,
          sites,
          taxonomy,
          funnels,
          analyticsSchemaDoc(),
          firestoreSchemaDoc(),
        ].join("\n\n---\n\n");
      }),
  );
}
