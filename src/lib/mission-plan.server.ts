import { createOpenAI } from "@ai-sdk/openai";
import { NoObjectGeneratedError, Output, streamText } from "ai";
import { z } from "zod";

const LOVABLE_AIG_RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

function createRunIdFetch() {
  let runId: string | undefined;
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (runId && !headers.has(LOVABLE_AIG_RUN_ID_HEADER)) headers.set(LOVABLE_AIG_RUN_ID_HEADER, runId);
    const res = await fetch(input, { ...init, headers });
    runId ??= res.headers.get(LOVABLE_AIG_RUN_ID_HEADER)?.trim() || undefined;
    return res;
  };
}

export const planSchema = z.object({
  missionTitle: z.string(),
  summary: z.string(),
  waves: z.array(
    z.object({
      agent: z.enum(["Scout", "Scribe", "QA"]),
      objective: z.string(),
      tasks: z.array(z.string()),
      systems: z.array(z.string()),
      estimatedCostUsd: z.number(),
      estimatedMinutes: z.number(),
    }),
  ),
  recommendedBudgetUsd: z.number(),
  budgetRationale: z.string(),
  approvalCheckpoints: z.array(
    z.object({
      title: z.string(),
      actionType: z.string(),
      riskLevel: z.enum(["low", "medium", "high", "critical"]),
      afterAgent: z.enum(["Scout", "Scribe", "QA"]),
      reason: z.string(),
    }),
  ),
  missingFacts: z.array(z.string()),
});

export type MissionPlan = z.infer<typeof planSchema>;

const INSTRUCTIONS = `You are SHOGUN, the mission planner of the YAKUZA AI Control Tower, a business operating system for operations managers.
Turn the manager's goal into an execution plan with exactly three waves in order: Scout (read-only data gathering and analysis), Scribe (drafting assets locally: emails, documents, CRM changes, posts), QA (verification of every fact against source data).
Rules:
- 2-5 concise tasks per wave. "systems" lists only connectors relevant to the wave, chosen from the enabled connectors when possible.
- Costs are AI token costs in USD, realistic and small (typically $0.005-$0.15 per wave). recommendedBudgetUsd = sum of wave costs plus a 20-30% safety margin, rounded to 2 decimals.
- Add an approval checkpoint for EVERY action that changes an external system (send_email, update_crm, execute_payout, publish_post, send_message, etc.). Payments are always critical. Read-only work needs no checkpoint.
- No-Guessing rule: never invent facts. List any information the goal lacks (recipients, amounts, dates, criteria) in missingFacts; use an empty array if none.`;

export async function generateMissionPlan(goal: string, connectors: string[], signal?: AbortSignal) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured for this app.");

  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: createRunIdFetch(),
  });

  let failure: unknown;
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system: INSTRUCTIONS,
    prompt: `Goal: ${goal}\nEnabled connectors: ${connectors.length ? connectors.join(", ") : "none"}`,
    output: Output.object({ schema: planSchema }),
    ...(signal ? { abortSignal: signal } : {}),
    maxRetries: 0,
    onError: ({ error }) => {
      failure = error;
    },
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  try {
    return await result.output;
  } catch (error) {
    const err = (failure ?? error) as { statusCode?: number; message?: string };
    console.error("mission plan failed", err);
    if (NoObjectGeneratedError.isInstance(error)) throw new Error("The AI returned an incomplete plan. Please try again.");
    if (err.statusCode === 429) throw new Error("Too many requests right now. Wait a moment and try again.");
    if (err.statusCode === 402) throw new Error("AI credits are used up. Add credits in workspace settings to continue.");
    if (err.statusCode === 403) throw new Error("AI access is blocked for this workspace.");
    throw new Error("Couldn't generate the plan. Please try again.");
  }
}
