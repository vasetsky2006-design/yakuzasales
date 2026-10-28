import { defineMcp } from "@lovable.dev/mcp-js";
import listModules from "./tools/list-modules";
import getWorkflow from "./tools/get-workflow";

export default defineMcp({
  name: "yakuzasales",
  title: "Yakuzasales",
  version: "0.1.0",
  instructions: "Public read-only product information for YAKUZA Control Tower. Use list_modules to discover demo screens and get_workflow_overview for the workflow and limitations. No operational records, lead submissions or external actions are accessible.",
  tools: [listModules, getWorkflow],
});