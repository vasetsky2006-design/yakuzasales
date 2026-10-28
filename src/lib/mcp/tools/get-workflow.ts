import { defineTool } from "@lovable.dev/mcp-js";
import { publicWorkflow } from "../catalog";

export default defineTool({
  name: "get_workflow_overview",
  title: "Get YAKUZA workflow overview",
  description: "Explain the public mission workflow and current demo limitations without accessing mission or lead records.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({ content: [{ type: "text", text: publicWorkflow }] }),
});