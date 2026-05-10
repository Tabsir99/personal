type Block = { type: string; text?: string; name?: string; input?: unknown };
type McpServer = { name: string; status: string };

export function logAgentMessage(message: unknown) {
  const m = message as Record<string, unknown>;

  if (m.type === "system" && m.subtype === "init") {
    const tools = (m.tools as string[]).join(", ") || "none";
    const mcp =
      ((m.mcp_servers as McpServer[]) ?? [])
        .map((s) => `${s.name}(${s.status})`)
        .join(", ") || "none";
    console.log(`[Agent] ready  model=${m.model}  tools=${tools}  mcp=${mcp}`);
    return;
  }

  if (m.type === "assistant") {
    const msg = m.message as { content: Block[]; usage?: { output_tokens: number } };
    const toolCalls = msg.content
      .filter((b) => b.type === "tool_use")
      .map((b) => `${b.name}(${JSON.stringify(b.input).slice(0, 50)})`);
    const text = msg.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .replace(/\n+/g, " ")
      .slice(0, 80);
    const out = msg.usage ? ` out:${msg.usage.output_tokens}` : "";
    if (toolCalls.length) {
      console.log(`[Agent] tool   → ${toolCalls.join(", ")}${out}`);
    } else if (text) {
      console.log(`[Agent] turn   → "${text}"${out}`);
    }
    return;
  }

  if (m.type === "result") {
    const r = m as {
      subtype: string;
      num_turns: number;
      duration_ms: number;
      total_cost_usd: number;
      usage: {
        input_tokens: number;
        output_tokens: number;
        cache_read_input_tokens: number;
        cache_creation_input_tokens: number;
      };
      structured_output?: unknown;
      result?: string;
    };
    const { input_tokens, output_tokens, cache_read_input_tokens, cache_creation_input_tokens } = r.usage;
    const cacheStatus =
      cache_read_input_tokens > 0 && cache_creation_input_tokens === 0
        ? "hit"
        : cache_creation_input_tokens > 0
          ? "cold"
          : "none";
    const output = r.structured_output
      ? JSON.stringify(r.structured_output).slice(0, 100)
      : `"${(r.result ?? "").slice(0, 100)}"`;
    console.log(
      `[Agent] ${r.subtype}  turns=${r.num_turns}  time=${(r.duration_ms / 1000).toFixed(1)}s` +
        `  in=${input_tokens} out=${output_tokens} cache=${cacheStatus}` +
        `  cost=$${r.total_cost_usd.toFixed(4)}  → ${output}`,
    );
  }
}
