import { describe, expect, it } from "vitest";
import { escapeSQL } from "@/lib/tinybird";

const literal = (value: string) => `'${escapeSQL(value)}'`;

describe("escapeSQL", () => {
  it("preserves the value instead of deleting characters from it", () => {
    expect(escapeSQL("Let's talk")).toBe("Let\\'s talk");
    expect(escapeSQL("O'Brien")).toBe("O\\'Brien");
    expect(escapeSQL("back\\slash")).toBe("back\\\\slash");
  });

  it("escapes backslashes before quotes so an escape cannot be re-escaped", () => {
    expect(escapeSQL("a\\'b")).toBe("a\\\\\\'b");
  });

  it("leaves ordinary goal names untouched", () => {
    for (const name of ["signup", "checkout_completed", "read-article", "Pricing Seen"]) {
      expect(escapeSQL(name)).toBe(name);
    }
  });

  it("closes the literal it is embedded in, so the predicate cannot be broken out of", () => {
    const injected = literal("x' OR 1=1 --");
    expect(injected).toBe("'x\\' OR 1=1 --'");
    expect(injected.match(/(?<!\\)'/g)).toHaveLength(2);
  });
});
