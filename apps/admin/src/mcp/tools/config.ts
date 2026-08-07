import "server-only";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import { siteConfigSchema } from "@tabsircg/schemas/site";
import {
  readConfigFields,
  addConfigValue,
  readSiteConfig,
  updateSiteConfig,
  readPortfolioPageData,
  readPortfolioCatalog,
  addPortfolioSkill,
} from "@/actions/configActions";
import { guarded, unwrap } from "../result";

export function registerConfigTools(server: McpServer) {
  server.registerTool(
    "config_read",
    {
      title: "Read admin configuration",
      description:
        "The blog taxonomy (tags, kinds, schemaTypes), the site config that drives the portfolio's blog landing page, and the portfolio skill catalog. Read this before adding a tag or kind so you reuse an existing one.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () =>
      guarded(async () => {
        const [blog, site, catalog] = await Promise.all([
          readConfigFields(),
          readSiteConfig(),
          readPortfolioCatalog(),
        ]);

        return [
          "## Blog taxonomy",
          `tags:        ${blog.tags.join(", ") || "none"}`,
          `kinds:       ${blog.kinds.join(", ") || "none"}`,
          `schemaTypes: ${blog.schemaTypes.join(", ") || "none"}`,
          "",
          "## Site config",
          JSON.stringify(site, null, 2),
          "",
          "## Portfolio skill catalog",
          catalog.skillCatalog.join(", ") || "none",
        ].join("\n");
      }),
  );

  server.registerTool(
    "config_add_value",
    {
      title: "Add a blog tag, kind or schema type",
      description:
        "Append a value to the blog taxonomy and revalidate the portfolio's blog-config cache. Tags are lowercased. Adding a value that already exists is a no-op.",
      inputSchema: z.object({
        field: z.enum(["tags", "kinds", "schemaTypes"]),
        value: z.string().trim().min(1),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async ({ field, value }) =>
      guarded(async () => {
        const result = unwrap(await addConfigValue(field, value));
        return `${field} now: ${result.values.join(", ")}`;
      }),
  );

  server.registerTool(
    "config_update_site",
    {
      title: "Update site config",
      description:
        "Patch the site config behind the portfolio's blog landing page (hero heading, tagline, meta, now-reading list, currently-building block) and revalidate it. Only the top-level keys you pass are replaced. Read config_read first to see the current shape.",
      inputSchema: z.object({
        patch: z
          .record(z.string(), z.unknown())
          .describe(
            "Partial site config. Valid top-level keys: blogLanding, nowReading, currentlyBuilding.",
          ),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        openWorldHint: true,
      },
    },
    async ({ patch }) =>
      guarded(async () => {
        const allowed = Object.keys(siteConfigSchema.shape);
        const unknown = Object.keys(patch).filter(
          (key) => !allowed.includes(key),
        );
        if (unknown.length > 0) {
          throw new Error(
            `Unknown site config key(s): ${unknown.join(", ")}. Valid: ${allowed.join(", ")}`,
          );
        }

        const merged = unwrap(await updateSiteConfig(patch));
        return `Site config updated and revalidated.\n${JSON.stringify(merged, null, 2)}`;
      }),
  );

  server.registerTool(
    "config_add_skill",
    {
      title: "Add a portfolio skill",
      description:
        "Append a skill to the portfolio skill catalog. Case-insensitive duplicates are ignored.",
      inputSchema: z.object({ value: z.string().trim().min(1) }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: false,
      },
    },
    async ({ value }) =>
      guarded(async () => {
        const result = unwrap(await addPortfolioSkill(value));
        return `Skill catalog now: ${result.values.join(", ")}`;
      }),
  );

  server.registerTool(
    "portfolio_read_page_data",
    {
      title: "Read portfolio page data",
      description:
        "The structured content behind the public portfolio page — hero, projects, experience and the rest. Returns null when nothing has been authored yet.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () =>
      guarded(async () => {
        const data = await readPortfolioPageData();
        return data === null
          ? "No portfolio page data has been authored yet."
          : JSON.stringify(data, null, 2);
      }),
  );
}
