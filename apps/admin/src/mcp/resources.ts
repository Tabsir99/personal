import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { McpServer } from "@modelcontextprotocol/server";
import { analyticsSchemaDoc, firestoreSchemaDoc, sitesDoc } from "./docs";

export function registerResources(server: McpServer) {
  server.registerResource(
    "analytics-schema",
    "analytics://schema/events",
    {
      title: "analytics_events table contract",
      description:
        "Columns, event types, the revenue split model and query conventions for the Tinybird analytics table. Read before writing analytics_query SQL.",
      mimeType: "text/markdown",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: analyticsSchemaDoc(),
        },
      ],
    }),
  );

  server.registerResource(
    "firestore-schema",
    "admin://schema/firestore",
    {
      title: "Firestore collections and the blog model",
      description:
        "What lives in each Firestore collection, plus the draft/published and featured-post rules that the blog tools enforce.",
      mimeType: "text/markdown",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: firestoreSchemaDoc(),
        },
      ],
    }),
  );

  server.registerResource(
    "websites",
    "admin://sites",
    {
      title: "Registered analytics websites",
      description:
        "Live list of tracked sites with their ids, for the websiteId argument on the analytics tools.",
      mimeType: "text/markdown",
    },
    async (uri) => ({
      contents: [
        { uri: uri.href, mimeType: "text/markdown", text: await sitesDoc() },
      ],
    }),
  );

  server.registerResource(
    "analytics-guide",
    "admin://guide/analytics",
    {
      title: "Analytics design notes",
      description:
        "The repo's own ANALYTICS.md: what a session is here, how revenue is attributed to visitors, and how goals and funnels are modelled.",
      mimeType: "text/markdown",
    },
    async (uri) => {
      const file = path.join(process.cwd(), "ANALYTICS.md");
      const text = await readFile(file, "utf8").catch(
        () => "ANALYTICS.md was not found next to the running admin app.",
      );
      return {
        contents: [{ uri: uri.href, mimeType: "text/markdown", text }],
      };
    },
  );
}
