import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Upload, Check, Lock, Play, Pause, RotateCcw } from "lucide-react";
import { Badge, Btn, PageHeader, Panel } from "@/components/ui-kit";
import { pushAudit } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
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
const WAVES = [
  { n: 1, agent: "Scout", task: "Read CRM deals & last 30 days of calls", cost: 0.021 },
  { n: 2, agent: "Scribe", task: "Draft personalised proposals from pricing catalog", cost: 0.064 },
  { n: 3, agent: "QA", task: "Verify facts against catalog · No-Guessing Gate", cost: 0.032 },
];
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

  useEffect(() => {
    if (phase !== "live" || paused) return;
    const lines = [
      ["SHOGUN", "mission M-2042 accepted · budget cap $0.15"],
      ["Scout", "hubspot.deals → 12 stalled records loaded"],
      ["Scout", "ollama/qwen2.5 · summarised 31 call transcripts"],
      ["Scribe", "drafting proposals · catalog.pricing_rules#R-14"],
      ["Scribe", "3 proposals missing contact email → marked _DRAFT"],
      ["QA", "fact-check 9/9 passed · 0 guesses"],
      ["BUSHIDO", "external write detected → risk gate opened"],
    ];
    const t = setInterval(() => {
      setLog((l) => {
        if (l.length >= lines.length) {
          clearInterval(t);
          setPhase("done");
          pushAudit({ agent: "SHOGUN", action: "mission.awaiting_approval", evidence: "wave_3.qa_report", mission: "M-2042", payload: { cost_usd: 0.117 } });
          return l;
        }
        const [a, m] = lines[l.length]!;
        setWave(a === "Scout" ? 1 : a === "Scribe" ? 2 : a === "SHOGUN" ? 0 : 3);
        return [...l, `${new Date().toLocaleTimeString("en-GB")}  [${a.padEnd(7)}] ${m}`];
      });
    }, 900);
    return () => clearInterval(t);
  }, [phase, paused]);

  useEffect(() => { logRef.current?.scrollTo({ top: 1e6 }); }, [log]);

  const reset = () => { setPhase("describe"); setLog([]); setWave(0); setPaused(false); };
  const total = WAVES.reduce((s, w) => s + w.cost, 0);

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
          <Btn className="mt-4 w-full" disabled={phase !== "describe" || !goal.trim()} onClick={() => setPhase("blueprint")}>Generate blueprint →</Btn>
        </Panel>

        <Panel step="2" title="Mission Blueprint" className={cn(phase === "describe" && "opacity-40")} meta={phase === "blueprint" ? <Badge tone="warning" pulse>Approval needed</Badge> : phase === "describe" ? <Badge>Waiting</Badge> : <Badge tone="success">Approved</Badge>}>
          {phase === "describe" ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Describe a goal to generate the plan.</p>
          ) : (
            <>
              <ol className="space-y-2">
                {WAVES.map((w) => (
                  <li key={w.n} className="flex gap-3 rounded-sm border bg-background p-2.5">
                    <span className="font-mono text-xs text-primary">W{w.n}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{w.agent}</div>
                      <div className="text-xs text-muted-foreground">{w.task}</div>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">${w.cost.toFixed(3)}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-sm border p-2"><div className="label-mono">Budget</div><div className="font-mono text-sm">${total.toFixed(3)} / $0.15</div></div>
                <div className="rounded-sm border p-2"><div className="label-mono">ETA</div><div className="font-mono text-sm">~4 min</div></div>
                <div className="rounded-sm border p-2"><div className="label-mono">Gates</div><div className="font-mono text-sm text-warning">2</div></div>
              </div>
              <div className="mt-3 space-y-1 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground"><Lock className="size-3 text-primary" /> send_email · requires human approval</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Lock className="size-3 text-primary" /> update_crm · requires human approval</div>
              </div>
              <Btn className="mt-4 w-full" disabled={phase !== "blueprint"} onClick={() => { setPhase("live"); pushAudit({ agent: "Human", action: "mission.approved", evidence: "operator:v.vasetsky", mission: "M-2042", payload: { budget_usd: 0.15 } }); }}>
                <Check className="size-3.5" /> Approve mission
              </Btn>
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
            {phase === "done" && <Link to="/approvals" className="flex-1"><Btn className="w-full">Review 2 gates in inbox →</Btn></Link>}
          </div>
        </Panel>
      </div>
    </div>
  );
}
