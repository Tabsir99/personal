import { beforeAll, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const MCP_TOKEN = "mcp-secret";
const SERVER_TOKEN = "portfolio-secret";

vi.mock("@/config/env.server", () => ({
  env: {
    JWT_SECRET: "jwt-secret",
    COOKIE_NAME: "t",
    SERVER_TOKEN,
    MCP_TOKEN,
    ADMIN_ORIGIN: "http://localhost:5000",
  },
}));

let middleware: (request: NextRequest) => Promise<Response>;

beforeAll(async () => {
  delete process.env.BYPASS_AUTH;
  middleware = (await import("@/proxy")).default;
});

const mcpRequest = (headers: Record<string, string> = {}) =>
  new NextRequest("http://localhost:5000/api/mcp", { method: "POST", headers });

describe("proxy auth for /api/mcp", () => {
  it("allows a correct bearer token", async () => {
    const response = await middleware(
      mcpRequest({ authorization: `Bearer ${MCP_TOKEN}` }),
    );
    expect(response.status).toBe(200);
  });

  it("rejects a missing token", async () => {
    const response = await middleware(mcpRequest());
    expect(response.status).toBe(401);
  });

  it("rejects a wrong token", async () => {
    const response = await middleware(
      mcpRequest({ authorization: "Bearer nope" }),
    );
    expect(response.status).toBe(401);
  });

  it("rejects a bare token without the Bearer scheme", async () => {
    const response = await middleware(mcpRequest({ authorization: MCP_TOKEN }));
    expect(response.status).toBe(401);
  });

  it("does not accept portfolio's serverToken", async () => {
    const response = await middleware(
      mcpRequest({ serverToken: SERVER_TOKEN }),
    );
    expect(response.status).toBe(401);
  });

  it("does not let the MCP token reach other admin routes", async () => {
    const response = await middleware(
      new NextRequest("http://localhost:5000/api/blogs", {
        method: "GET",
        headers: { authorization: `Bearer ${MCP_TOKEN}` },
      }),
    );
    expect(response.status).toBe(401);
  });
});
