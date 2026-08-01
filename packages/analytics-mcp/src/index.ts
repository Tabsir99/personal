#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { formatReport, validateEvent } from "./validate.js";
import { inspectSetup } from "./inspect.js";
import { REFERENCE } from "./reference.js";

const server = new McpServer({ name: "tabsircg-analytics", version: "0.1.0" });

server.registerResource(
  "reference",
  "analytics://reference",
  {
    title: "@tabsircg/analytics instrumentation guide",
    description: "How to install the tracker, what it collects automatically, the event model and the extraData rules",
    mimeType: "text/markdown",
  },
  async (uri) => ({ contents: [{ uri: uri.href, mimeType: "text/markdown", text: REFERENCE }] }),
);

server.registerTool(
  "validate_event",
  {
    title: "Validate a custom event",
    description:
      "Check a trackEvent call against the rules the analytics Worker actually enforces, before writing the code. Returns the exact extra_data that would be sent, every transformation the tracker applies to your input, and any violation that would make the Worker reject the whole event with a 400. Use this whenever you add or change a trackEvent call.",
    inputSchema: {
      eventName: z.string().describe("The event name passed to trackEvent, e.g. 'checkout_completed'"),
      data: z
        .record(z.string(), z.unknown())
        .optional()
        .describe("The properties object passed to trackEvent. Values may be any type; the tracker stringifies them."),
    },
  },
  async ({ eventName, data }) => {
    const report = validateEvent(eventName, data ?? {});
    return {
      content: [{ type: "text", text: formatReport(eventName, report) }],
      isError: !report.valid,
    };
  },
);

server.registerTool(
  "inspect_setup",
  {
    title: "Inspect the tracker setup in a project",
    description:
      "Scan a project directory for the @tabsircg/analytics installation: the resolved version, where it is initialised, whether both the script tag and the SDK are wired up, and config flags that should not ship to production.",
    inputSchema: {
      projectRoot: z.string().describe("Absolute path to the project root to scan"),
    },
  },
  async ({ projectRoot }) => ({
    content: [{ type: "text", text: await inspectSetup(projectRoot) }],
  }),
);

await server.connect(new StdioServerTransport());
