const FORBIDDEN_KEYWORDS = [
  "insert",
  "alter",
  "drop",
  "truncate",
  "create",
  "attach",
  "detach",
  "rename",
  "optimize",
  "system",
  "grant",
  "revoke",
  "delete",
  "update",
  "into",
];

export const DEFAULT_ROW_LIMIT = 200;

function stripComments(sql: string): string {
  return sql.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/--[^\n]*/g, " ");
}

function stripLiterals(sql: string): string {
  return sql.replace(/'(?:[^'\\]|\\.)*'/g, "''");
}

export function guardReadOnlySql(
  sql: string,
  rowLimit = DEFAULT_ROW_LIMIT,
): string {
  const statement = stripComments(sql).trim().replace(/;\s*$/, "");
  if (statement.length === 0) throw new Error("Query is empty.");

  const scannable = stripLiterals(statement);

  if (scannable.includes(";")) {
    throw new Error("Multiple statements are not allowed.");
  }

  if (!/^(select|with)\b/i.test(scannable)) {
    throw new Error("Only SELECT and WITH queries are allowed.");
  }

  const offending = FORBIDDEN_KEYWORDS.find((keyword) =>
    new RegExp(`\\b${keyword}\\b`, "i").test(scannable),
  );
  if (offending) {
    throw new Error(
      `"${offending}" is not allowed — this tool runs read-only queries.`,
    );
  }

  return /\blimit\b\s+\d+/i.test(scannable)
    ? statement
    : `${statement}\nLIMIT ${rowLimit}`;
}
