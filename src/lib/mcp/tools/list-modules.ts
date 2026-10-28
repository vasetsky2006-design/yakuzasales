import { defineTool } from "@lovable.dev/mcp-js";
import { publicModules } from "../catalog";

export default defineTool({
  name: "list_modules",
  title: "List YAKUZA modules",
  description: "List the intentionally public YAKUZA demo modules, paths and purposes; does not read operational records.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({ content: [{ type: "text", text: publicModules.map((m) => `${m.name} (${m.path}): ${m.purpose}`).join("\n") }] }),
});