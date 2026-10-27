import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { generateMissionPlan } from "./mission-plan.server";

export const planMission = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ goal: z.string().trim().min(5).max(2000), connectors: z.array(z.string().max(40)).max(10) }).parse(d),
  )
  .handler(async ({ data }) => {
    try {
      const plan = await generateMissionPlan(data.goal, data.connectors, getRequest()?.signal);
      return { plan, error: null as string | null };
    } catch (e) {
      return { plan: null, error: e instanceof Error ? e.message : "Couldn't generate the plan." };
    }
  });
