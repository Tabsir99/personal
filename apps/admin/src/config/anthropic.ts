import { query, Options } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { logAgentMessage } from "@/lib/agentLog";

// Derived from ToolInputSchemas in @anthropic-ai/claude-agent-sdk/sdk-tools.d.ts
// No ToolName union is exported by the SDK — this mirrors the known built-in tools.
type ClaudeTool =
  | "Agent"
  | "AskUserQuestion"
  | "Bash"
  | "Edit"
  | "EnterWorktree"
  | "ExitPlanMode"
  | "ExitWorktree"
  | "Glob"
  | "Grep"
  | "NotebookEdit"
  | "Read"
  | "StructuredOutput"
  | "TodoWrite"
  | "WebFetch"
  | "WebSearch"
  | "Write";

const ENABLED_TOOLS: ClaudeTool[] = ["WebSearch", "WebFetch"];

const DEFAULT_OPTIONS: Options = {
  // Model
  model: "claude-opus-4-7",
  effort: "xhigh",
  thinking: { type: "disabled" },

  // Tools — only StructuredOutput for schema support; everything else off
  tools: ENABLED_TOOLS,

  // Session behaviour
  maxTurns: 7,
  promptSuggestions: false,
  agentProgressSummaries: false,
  includeHookEvents: false,
  debug: false,

  // No filesystem settings (SDK isolation mode)
  settingSources: [],
  skills: [],
  plugins: [],
  hooks: {},

  // Suppress all hooks, MCP servers, and background features via settings layer
  settings: {
    disableAllHooks: true,
    disableBackgroundAgents: true,
    disableRemoteControl: true,
    disableSkillShellExecution: true,
    allowedMcpServers: [],
    allowManagedMcpServersOnly: true,
    skillOverrides: {
      debug: "off",
      loop: "off",
      "claude-api": "off",
      schedule: "off",
      batch: "off",
      "update-config": "off",
      "fewer-permission-prompts": "off",
      simplify: "off",
    },
    permissions: {
      deny: ["*"],
      defaultMode: "dontAsk",
    },
  },

  systemPrompt:
    "You are Claude, a helpful AI assistant made by Anthropic. " +
    "Respond naturally and directly. Do not act as a coding agent or terminal assistant.",
  env: {
    ANTHROPIC_AUTH_TOKEN: process.env.ANTHROPIC_AUTH_TOKEN,
  },
};

type SendPromptOptions<T extends z.ZodType = never> = Omit<
  Options,
  "outputFormat"
> & {
  schema?: T;
};

export async function sendPrompt<T extends z.ZodType = never>(
  prompt: string,
  options?: SendPromptOptions<T>,
): Promise<[T] extends [never] ? string : z.infer<T>> {
  const { schema, ...restOptions } = options ?? {};

  const resolvedOptions = {
    ...DEFAULT_OPTIONS,
    ...restOptions,
    ...(schema && {
      outputFormat: {
        type: "json_schema" as const,
        schema: z.toJSONSchema(schema, { target: "draft-7" }) as Record<
          string,
          unknown
        >,
      },
    }),
  };

  const stream = query({ prompt, options: resolvedOptions });

  for await (const message of stream) {
    logAgentMessage(message);
    if (message.type !== "result") continue;
    if (message.subtype !== "success")
      throw new Error(`sendPrompt failed: ${message.subtype}`);
    return (
      schema ? schema.parse(message.structured_output) : message.result
    ) as never;
  }

  throw new Error("sendPrompt: no result received");
}
