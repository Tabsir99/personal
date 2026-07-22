import { describe, it, expect } from "vitest";
import { breakdown } from "@/lib/analyticsQuery";
import { F } from "@/lib/tinybird";

function parensBalanced(sql: string): boolean {
  let depth = 0;
  for (const c of sql) {
    if (c === "(") depth++;
    else if (c === ")") depth--;
    if (depth < 0) return false;
  }
  return depth === 0;
}

function expectWellFormed(sql: string): void {
  expect(parensBalanced(sql), "unbalanced parens").toBe(true);
  expect(sql, "dangling AND").not.toMatch(/AND\s*\n/);
  expect(sql, "trailing comma before FROM").not.toMatch(/,\s*FROM/);
  expect(sql, "empty LEFT JOIN").not.toMatch(/LEFT JOIN\s*\n/);
}

describe("breakdown()", () => {
  it("uv mode: distinct count, grouping sets, revenue join, no split machinery", () => {
    const sql = breakdown("site", 0, 100)
      .level("browsers", "browser", F.browser)
      .level("os", "os", F.os)
      .level("devices", "device", F.device)
      .revenue()
      .top(20)
      .build();

    expectWellFormed(sql);
    expect(sql).toContain("uniqExact(vid) as uv");
    expect(sql).toContain("GROUP BY GROUPING SETS ((browser), (os), (device))");
    expect(sql).toContain("ORDER BY uv DESC");
    expect(sql).toContain("LIMIT 20 BY level");
    expect(sql).toContain("LEFT JOIN");
    expect(sql).not.toContain("minSess");
    expect(sql).not.toContain("bucketMin");
  });

  it("split mode: new/returning via window over the same scan, extra column", () => {
    const sql = breakdown("site", 0, 100)
      .level("referrers", "referrer", F.referrer)
      .level("channels", "channel", "CHANNEL_EXPR")
      .revenue()
      .splitVisitors()
      .column("any(channel) as channel")
      .top(50)
      .build();

    expectWellFormed(sql);
    expect(sql).toContain("uniqExactIf(vid, minSess = 1) as newVisitors");
    expect(sql).toContain("uniqExactIf(vid, minSess > 1) as returningVisitors");
    expect(sql).toContain(`min(${F.sessionNumber}) as bucketMin`);
    expect(sql).toContain(
      "min(d.bucketMin) OVER (PARTITION BY d.vid) as minSess",
    );
    expect(sql).toContain("ORDER BY newVisitors + returningVisitors DESC");
    expect(sql).toContain("any(channel) as channel");
  });

  it("filter: ANDs a scope predicate into the pageview scan only, once", () => {
    const sql = breakdown("site", 0, 100)
      .level("regions", "region", F.region)
      .revenue()
      .filter(`${F.country} = 'US'`)
      .build();

    expectWellFormed(sql);
    expect(sql).toContain("AND country = 'US'");
    expect(sql.match(/country = 'US'/g)).toHaveLength(1);
  });

  it("no revenue: zero literal, no join", () => {
    const sql = breakdown("site", 0, 100).level("os", "os", F.os).build();

    expectWellFormed(sql);
    expect(sql).toContain("0 as rev");
    expect(sql).not.toContain("LEFT JOIN");
  });

  it("time range lands in the slice predicate", () => {
    const sql = breakdown("mysite", 1000, 2000).level("os", "os", F.os).build();

    expect(sql).toContain(`${F.websiteId} = 'mysite'`);
    expect(sql).toContain(`${F.timestamp} >= 1000`);
    expect(sql).toContain(`${F.timestamp} < 2000`);
    expect(sql).toContain(`${F.type} = 'pageview'`);
  });

  it("stable shape (snapshot)", () => {
    const sql = breakdown("site", 0, 100)
      .level("countries", "country", F.country)
      .level("regions", "region", F.region)
      .level("cities", "city", F.city)
      .revenue()
      .column("any(country) as country")
      .top(30)
      .build();

    expect(sql).toMatchSnapshot();
  });
});
