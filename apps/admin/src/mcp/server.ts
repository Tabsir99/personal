import "server-only";
import { McpServer } from "@modelcontextprotocol/server";
import { registerContextTools } from "./tools/context";
import { registerAnalyticsTools } from "./tools/analytics";
import { registerBlogTools } from "./tools/blog";
import { registerConfigTools } from "./tools/config";
import { registerResources } from "./resources";
import { registerPrompts } from "./prompts";

const INSTRUCTIONS = `Admin control plane for tabsircg.com — the blog CMS, the
portfolio content, and the analytics warehouse behind both.

Two data stores sit behind these tools. Firestore holds blog posts, drafts and
config. Tinybird holds the analytics_events table, one row per tracked event.

Call admin_context first. It returns the operating rules, the analytics column
contract and revenue model, the Firestore collection map, the registered
website ids and the live blog taxonomy in one call — everything the resources
carry, without needing to read four of them. This matters most outside the
admin's own repo, where no project documentation is loaded.

Two things are easy to get wrong. Revenue is three separate figures — charge,
refund and dispute — and summing revenue_cents without splitting on kind
overstates income. Published posts are never edited in place: blog_update_draft
opens a draft, and nothing reaches the public site until blog_publish.`;

export function buildAdminMcpServer(): McpServer {
  const server = new McpServer(
    { name: "tabsircg-admin", version: "0.1.0" },
    { instructions: INSTRUCTIONS },
  );

  registerResources(server);
  registerPrompts(server);
  registerContextTools(server);
  registerAnalyticsTools(server);
  registerBlogTools(server);
  registerConfigTools(server);

  return server;
}
