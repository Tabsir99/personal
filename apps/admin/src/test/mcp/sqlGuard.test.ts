import { describe, expect, it } from "vitest";
import { guardReadOnlySql } from "@/mcp/sql";

describe("guardReadOnlySql", () => {
  it("passes a plain SELECT through and appends the row limit", () => {
    expect(guardReadOnlySql("SELECT 1", 50)).toBe("SELECT 1\nLIMIT 50");
  });

  it("keeps a LIMIT the caller already wrote", () => {
    expect(guardReadOnlySql("SELECT 1 LIMIT 5", 50)).toBe("SELECT 1 LIMIT 5");
  });

  it("allows a leading WITH clause", () => {
    expect(
      guardReadOnlySql("WITH x AS (SELECT 1) SELECT * FROM x", 10),
    ).toContain("LIMIT 10");
  });

  it.each([
    ["DROP TABLE analytics_events"],
    ["ALTER TABLE analytics_events DELETE WHERE 1"],
    ["INSERT INTO analytics_events VALUES (1)"],
    ["TRUNCATE TABLE analytics_events"],
  ])("rejects %s", (sql) => {
    expect(() => guardReadOnlySql(sql)).toThrow();
  });

  it("rejects a second statement", () => {
    expect(() => guardReadOnlySql("SELECT 1; DROP TABLE t")).toThrow(
      /Multiple statements/,
    );
  });

  it("rejects a keyword hidden behind a block comment", () => {
    expect(() =>
      guardReadOnlySql("SELECT 1 /* x */ ; INSERT INTO t VALUES (1)"),
    ).toThrow(/Multiple statements/);
  });

  it("rejects a keyword hidden behind a line comment", () => {
    expect(() =>
      guardReadOnlySql("SELECT 1\n-- harmless\n; DROP TABLE t"),
    ).toThrow(/Multiple statements/);
  });

  it("does not mistake a banned word inside a string literal for a keyword", () => {
    const sql = "SELECT count() FROM t WHERE event_name = 'delete'";
    expect(guardReadOnlySql(sql, 20)).toBe(`${sql}\nLIMIT 20`);
  });

  it("does not mistake a semicolon inside a string literal for a separator", () => {
    const sql = "SELECT count() FROM t WHERE href = 'a;b'";
    expect(guardReadOnlySql(sql, 20)).toBe(`${sql}\nLIMIT 20`);
  });

  it("rejects an empty query", () => {
    expect(() => guardReadOnlySql("   ")).toThrow(/empty/);
  });

  it("strips a trailing semicolon rather than rejecting it", () => {
    expect(guardReadOnlySql("SELECT 1;", 5)).toBe("SELECT 1\nLIMIT 5");
  });
});
