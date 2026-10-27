import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Upload, Check, Lock, Play, Pause, RotateCcw, Loader2, AlertTriangle } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { planMission } from "@/lib/mission-plan.functions";
import type { MissionPlan } from "@/lib/mission-plan.server";
import { Badge, Btn, PageHeader, Panel } from "@/components/ui-kit";
import { pushAudit } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hub")({
  head: () => ({
    meta: [
      { title: "Mission Hub — YAKUZA Control Tower" },
      { name: "description", content: "Describe a result, approve the mission, follow live orchestration." },
      { property: "og:title", content: "Mission Hub — YAKUZA Control Tower" },
      { property: "og:description", content: "Describe a result, approve the mission, follow live orchestration." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MissionHub,
});

const TOOLS = ["Local Ollama", "Gmail", "CRM", "WhatsApp"];
const DEFAULT_WAVES = [{ n: 1, agent: "Scout" }, { n: 2, agent: "Scribe" }, { n: 3, agent: "QA" }];
const riskTone = { low: "text-success", medium: "text-warning", high: "text-primary", critical: "text-primary" } as const;
type Phase = "describe" | "blueprint" | "live" | "done";

function MissionHub() {
  const [goal, setGoal] = useState("Re-engage all Q4 deals stalled > 14 days with a tailored proposal and update CRM stages.");
  const [tools, setTools] = useState<string[]>(["Local Ollama", "CRM", "Gmail"]);
  const [files, setFiles] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("describe");
  const [wave, setWave] = useState(0);
  const [paused, setPaused] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const [plan, setPlan] = useState<MissionPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const plan$ = useServerFn(planMission);

  const generate = async () => {
    setLoading(true); setError(null); setPlan(null); setPhase("blueprint");
    try {
      const r = await plan$({ data: { goal, connectors: tools } });
      if (r.error || !r.plan) { setError(r.error ?? "No plan returned."); setPhase("describe"); }
      else {
        setPlan(r.plan);
        pushAudit({ agent: "SHOGUN", action: "mission.blueprint_generated", evidence: "ai_gateway · goal intake", mission: "M-2042", payload: { budget_usd: r.plan.recommendedBudgetUsd, gates: r.plan.approvalCheckpoints.length, missing: r.plan.missingFacts.length } });
      }
    } catch { setError("Couldn't reach the planner. Please try again."); setPhase("describe"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (phase !== "live" || paused) return;
    const lines: [string, string][] = [["SHOGUN", `mission accepted · budget cap $${plan?.recommendedBudgetUsd.toFixed(2) ?? "0.15"}`]];
    plan?.waves.forEach((w) => w.tasks.forEach((t) => lines.push([w.agent, t])));
    plan?.missingFacts.forEach((m) => lines.push(["QA", `missing fact: ${m} → marked _DRAFT`]));
    plan?.approvalCheckpoints.forEach((c) => lines.push(["BUSHIDO", `${c.actionType} → risk gate opened`]));
    const t = setInterval(() => {
      setLog((l) => {
        if (l.length >= lines.length) {
          clearInterval(t);
          setPhase("done");
          pushAudit({ agent: "SHOGUN", action: "mission.awaiting_approval", evidence: "wave_3.qa_report", mission: "M-2042", payload: { cost_usd: plan?.waves.reduce((a, w) => a + w.estimatedCostUsd, 0) ?? 0 } });
          return l;
        }
        const [a, m] = lines[l.length] as [string, string];
        setWave(a === "Scout" ? 1 : a === "Scribe" ? 2 : a === "SHOGUN" ? 0 : 3);
        return [...l, `${new Date().toLocaleTimeString("en-GB")}  [${a.padEnd(7)}] ${m}`];
      });
    }, 900);
    return () => clearInterval(t);
  }, [phase, paused]);

  useEffect(() => { logRef.current?.scrollTo({ top: 1e6 }); }, [log]);

  const reset = () => { setPhase("describe"); setLog([]); setWave(0); setPaused(false); setPlan(null); setError(null); };
  const total = plan?.waves.reduce((s, w) => s + w.estimatedCostUsd, 0) ?? 0;
  const eta = plan?.waves.reduce((s, w) => s + w.estimatedMinutes, 0) ?? 0;
  const WAVES = DEFAULT_WAVES;

  return (
    <div>
      <PageHeader code="MOD-01 · SHOGUN" title="Mission Hub" desc="Describe the result. Approve the mission. Follow it live." right={phase !== "describe" && <Btn variant="outline" onClick={reset}><RotateCcw className="size-3.5" />New mission</Btn>} />

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel step="1" title="Describe Goal" meta={phase === "describe" ? <Badge tone="draft" pulse>Editing</Badge> : <Badge tone="success">Locked</Badge>}>
          <textarea value={goal} onChange={(e) => setGoal(e.target.value)} disabled={phase !== "describe"} rows={5}
            className="w-full resize-none rounded-sm border bg-background p-3 text-sm outline-none focus:border-primary disabled:opacity-60" placeholder="What result do you want?" />
          <label className={cn("mt-3 flex cursor-pointer flex-col items-center gap-1 rounded-sm border border-dashed p-4 text-center text-xs text-muted-foreground hover:border-primary hover:text-foreground", phase !== "describe" && "pointer-events-none opacity-50")}>
            <Upload className="size-4" />
            {files.length ? files.join(", ") : "Drop files or click to attach"}
            <input type="file" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files ?? []).map((f) => f.name))} />
          </label>
          <div className="label-mono mt-4 mb-2">Connectors</div>
          <div className="flex flex-wrap gap-1.5">
            {TOOLS.map((t) => {
              const on = tools.includes(t);
              return (
                <button key={t} disabled={phase !== "describe"} onClick={() => setTools(on ? tools.filter((x) => x !== t) : [...tools, t])}
                  className={cn("rounded-sm border px-2 py-1 font-mono text-[11px] transition-colors", on ? "border-primary bg-primary/10 text-foreground" : "text-muted-foreground hover:text-foreground")}>
                  {on ? "● " : "○ "}{t}
                </button>
              );
            })}
          </div>
          {error && <div className="mt-3 flex items-start gap-2 rounded-sm border border-primary/50 bg-primary/10 p-2 text-xs"><AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-primary" />{error}</div>}
          <Btn className="mt-4 w-full" disabled={phase !== "describe" || goal.trim().length < 5 || loading} onClick={generate}>{loading ? <><Loader2 className="size-3.5 animate-spin" />Planning…</> : "Generate AI blueprint →"}</Btn>
        </Panel>

        <Panel step="2" title="Mission Blueprint" className={cn(phase === "describe" && "opacity-40")} meta={phase === "blueprint" ? <Badge tone="warning" pulse>Approval needed</Badge> : phase === "describe" ? <Badge>Waiting</Badge> : <Badge tone="success">Approved</Badge>}>
          {phase === "describe" ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Describe a goal to generate the plan.</p>
          ) : (
            <>
              {loading || !plan ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-muted-foreground"><Loader2 className="size-5 animate-spin text-primary" />SHOGUN is planning Scout, Scribe and QA waves…</div>
              ) : (<>
              <div className="mb-3"><div className="font-semibold">{plan.missionTitle}</div><p className="text-xs text-muted-foreground">{plan.summary}</p></div>
              <ol className="space-y-2">
                {plan.waves.map((w, i) => (
                  <li key={i} className="flex gap-3 rounded-sm border bg-background p-2.5">
                    <span className="font-mono text-xs text-primary">W{i + 1}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{w.agent} <span className="text-xs font-normal text-muted-foreground">· {w.objective}</span></div>
                      <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">{w.tasks.map((t) => <li key={t}>{t}</li>)}</ul>
                      {w.systems.length > 0 && <div className="mt-1 font-mono text-[10px] text-muted-foreground">{w.systems.join(" · ")}</div>}
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">${w.estimatedCostUsd.toFixed(3)}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-sm border p-2"><div className="label-mono">Budget</div><div className="font-mono text-sm">${total.toFixed(3)} / ${plan.recommendedBudgetUsd.toFixed(2)}</div></div>
                <div className="rounded-sm border p-2"><div className="label-mono">ETA</div><div className="font-mono text-sm">~{Math.round(eta)} min</div></div>
                <div className="rounded-sm border p-2"><div className="label-mono">Gates</div><div className="font-mono text-sm text-warning">{plan.approvalCheckpoints.length}</div></div>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">{plan.budgetRationale}</p>
              <div className="mt-3 space-y-1.5 text-xs">
                {plan.approvalCheckpoints.map((c, i) => (
                  <div key={i} className="flex items-start gap-2"><Lock className={cn("mt-0.5 size-3 shrink-0", riskTone[c.riskLevel])} /><span><b className="font-mono">{c.actionType}</b> <span className={riskTone[c.riskLevel]}>· {c.riskLevel}</span> · after {c.afterAgent} — <span className="text-muted-foreground">{c.reason}</span></span></div>
                ))}
              </div>
              {plan.missingFacts.length > 0 && (
                <div className="mt-3 rounded-sm border border-draft/50 bg-draft/10 p-2 text-xs"><div className="label-mono !text-draft">_DRAFT · missing facts</div><ul className="mt-1 list-inside list-disc">{plan.missingFacts.map((m) => <li key={m}>{m}</li>)}</ul></div>
              )}
              <Btn className="mt-4 w-full" disabled={phase !== "blueprint"} onClick={() => { setPhase("live"); pushAudit({ agent: "Human", action: "mission.approved", evidence: "operator:v.vasetsky", mission: "M-2042", payload: { budget_usd: plan.recommendedBudgetUsd } }); }}>
                <Check className="size-3.5" /> Approve mission
              </Btn>
              </>)}
            </>
          )}
        </Panel>

        <Panel step="3" title="Live Mission Feed" className={cn((phase === "describe" || phase === "blueprint") && "opacity-40")}
          meta={phase === "live" ? (paused ? <Badge tone="warning" pulse={false}>Safely paused</Badge> : <Badge tone="primary" pulse>In progress</Badge>) : phase === "done" ? <Badge tone="warning" pulse>Approval needed</Badge> : <Badge>Idle</Badge>}>
          <div className="mb-3 flex items-center gap-1">
            {WAVES.map((w, i) => {
              const state = phase === "done" || wave > w.n ? "done" : wave === w.n && phase === "live" ? "run" : "wait";
              return (
                <div key={w.n} className="flex flex-1 items-center gap-1">
                  <div className={cn("flex-1 rounded-sm border px-2 py-1.5 text-center", state === "run" && "glow-primary", state === "done" && "border-success/50")}>
                    <div className="label-mono">Wave {w.n}</div>
                    <div className={cn("text-xs font-semibold", state === "done" && "text-success", state === "run" && "text-primary")}>{w.agent}</div>
                  </div>
                  {i < 2 && <span className="text-muted-foreground">→</span>}
                </div>
              );
            })}
          </div>
          <div ref={logRef} className="h-56 overflow-y-auto rounded-sm border bg-background p-3 font-mono text-[11px] leading-relaxed">
            {log.length === 0 ? <span className="text-muted-foreground">&gt; awaiting mission approval_</span> :
              log.map((l, i) => <div key={i} className={cn(l.includes("_DRAFT") && "text-draft", l.includes("risk gate") && "text-primary", l.includes("passed") && "text-success")}>{l}</div>)}
          </div>
          <div className="mt-3 flex gap-2">
            {phase === "live" && <Btn variant="outline" className="flex-1" onClick={() => setPaused(!paused)}>{paused ? <><Play className="size-3.5" />Resume</> : <><Pause className="size-3.5" />Pause</>}</Btn>}
            {phase === "done" && <Link to="/approvals" className="flex-1"><Btn className="w-full">Review gates in inbox →</Btn></Link>}
          </div>
        </Panel>
      </div>
    </div>
  );
}
