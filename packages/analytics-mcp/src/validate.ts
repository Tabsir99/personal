import {
  EVENT_NAME_KEY,
  EXTRA_DATA_KEY_PATTERN,
  EXTRA_DATA_MAX_BYTES,
  EXTRA_DATA_MAX_KEY_LENGTH,
  EXTRA_DATA_MAX_PROPERTIES,
  EXTRA_DATA_MAX_VALUE_LENGTH,
  extraDataSchema,
} from "./contract.js";

export interface ValidationReport {
  valid: boolean;
  wire: Record<string, string>;
  transformations: string[];
  problems: string[];
}

function marshal(data: Record<string, unknown>): { wire: Record<string, string>; transformations: string[] } {
  const wire: Record<string, string> = {};
  const transformations: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    const outKey = key === EVENT_NAME_KEY ? key : key.toLowerCase();
    if (outKey !== key) transformations.push(`key "${key}" is lowercased to "${outKey}"`);

    const asString = value == null ? "" : String(value).trim();
    if (typeof value !== "string" && value != null) {
      transformations.push(`value of "${outKey}" is ${typeof value} ${JSON.stringify(value)}, sent as "${asString}"`);
    }

    if (asString.length > EXTRA_DATA_MAX_VALUE_LENGTH) {
      transformations.push(
        `value of "${outKey}" is ${asString.length} characters and is truncated to ${EXTRA_DATA_MAX_VALUE_LENGTH}`,
      );
    }
    wire[outKey] = asString.slice(0, EXTRA_DATA_MAX_VALUE_LENGTH);
  }

  return { wire, transformations };
}

function problemsIn(wire: Record<string, string>): string[] {
  const problems: string[] = [];
  const keys = Object.keys(wire);

  const counted = keys.filter((key) => key !== EVENT_NAME_KEY);
  if (counted.length > EXTRA_DATA_MAX_PROPERTIES) {
    problems.push(
      `${counted.length} properties, but at most ${EXTRA_DATA_MAX_PROPERTIES} are allowed (${EVENT_NAME_KEY} is exempt). Drop ${counted.length - EXTRA_DATA_MAX_PROPERTIES} or combine them into one value.`,
    );
  }

  for (const key of keys) {
    if (key === EVENT_NAME_KEY) continue;
    if (key.length === 0) {
      problems.push("An empty property name is not allowed.");
    } else if (key.length > EXTRA_DATA_MAX_KEY_LENGTH) {
      problems.push(`Property "${key}" is ${key.length} characters; the limit is ${EXTRA_DATA_MAX_KEY_LENGTH}.`);
    } else if (!EXTRA_DATA_KEY_PATTERN.test(key)) {
      const suggestion = key.replace(/[^a-z0-9_-]+/g, "_").slice(0, EXTRA_DATA_MAX_KEY_LENGTH);
      problems.push(
        `Property "${key}" contains characters outside ${EXTRA_DATA_KEY_PATTERN.source}. Rename it to "${suggestion}".`,
      );
    }
  }

  const size = JSON.stringify(wire).length;
  if (size > EXTRA_DATA_MAX_BYTES) {
    problems.push(`Serialised properties are ${size} characters; the limit is ${EXTRA_DATA_MAX_BYTES}.`);
  }

  return problems;
}

export function validateEvent(eventName: string, data: Record<string, unknown> = {}): ValidationReport {
  const { wire, transformations } = marshal({ ...data, [EVENT_NAME_KEY]: eventName });
  const problems = problemsIn(wire);

  if (!eventName.trim()) {
    problems.unshift("The event name is empty. Every custom event needs a name; it becomes event_name in Tinybird.");
  }

  return { valid: extraDataSchema.safeParse(wire).success && problems.length === 0, wire, transformations, problems };
}

export function formatReport(eventName: string, report: ValidationReport): string {
  const lines: string[] = [];

  lines.push(report.valid ? "VALID - the Worker will accept this event." : "INVALID - the Worker will reject this with HTTP 400, and the whole event is lost.");
  lines.push("");
  lines.push(`analytics.trackEvent(${JSON.stringify(eventName)}, ...) sends:`);
  lines.push(`  type column: "custom"`);
  lines.push(`  extra_data: ${JSON.stringify(report.wire, null, 2).split("\n").join("\n  ")}`);

  if (report.problems.length > 0) {
    lines.push("");
    lines.push("Problems:");
    for (const problem of report.problems) lines.push(`  - ${problem}`);
  }

  if (report.transformations.length > 0) {
    lines.push("");
    lines.push("The tracker changes your input before sending:");
    for (const change of report.transformations) lines.push(`  - ${change}`);
  }

  return lines.join("\n");
}
