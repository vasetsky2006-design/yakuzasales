// Intentionally public product information only; never import the demo store here.
export const publicModules = [
  { name: "Mission Hub", path: "/hub", purpose: "Describe a mission goal and generate a Scout, Scribe and QA blueprint." },
  { name: "Approval Inbox", path: "/approvals", purpose: "Review proposed actions and missing facts before human approval." },
  { name: "ProdaVAI", path: "/prodavai", purpose: "Explore the sales call quality demonstration." },
  { name: "Shinobi", path: "/shinobi", purpose: "Explore document extraction and missing-fact flags." },
  { name: "KATANA", path: "/katana", purpose: "Explore staged content in the content studio." },
  { name: "BUSHIDO", path: "/bushido", purpose: "Explore autonomy guardrails and budget controls." },
  { name: "KARMA", path: "/karma", purpose: "Review the demo audit trail." },
];

export const publicWorkflow = "YAKUZA Control Tower is a sales and operations agent-control demo. Mission Hub generates AI blueprints with Scout research, Scribe drafting and QA verification, estimated budgets, approval checkpoints and missing facts. Execution is a simulated feed, not external work. Approval Inbox and KARMA records are browser-local demo state, not remotely accessible records. No email, payment, CRM update or publication is performed by these MCP tools. Demo and waitlist requests are not exposed.";