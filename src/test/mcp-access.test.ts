import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("Public MCP exposure boundary", () => {
  it("exposes only module catalog and workflow overview without login", () => {
    const manifest = JSON.parse(readFileSync(".lovable/mcp/manifest.json", "utf8"));
    expect(manifest.auth).toEqual({ type: "none" });
    expect(manifest.path).toBe("/mcp");
    expect(manifest.mcp.tools.map((tool: { name: string }) => tool.name).sort()).toEqual(["get_workflow_overview", "list_modules"]);
  });
});