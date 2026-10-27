import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Upload, Check, Lock, Play, Pause, RotateCcw, Loader2, AlertTriangle } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { planMission } from "@/lib/mission-plan.functions";
import type { MissionPlan } from "@/lib/mission-plan.server";
import { Badge, Btn, PageHeader, Panel } from "@/components/ui-kit";
import { pushAudit } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useT, useLang } from "@/lib/i18n";


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
  const t = useT();
  const lang = useLang();
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
      const r = await plan$({ data: { goal, connectors: tools, lang } });
      if (r.error || !r.plan) { setError(r.error ?? t("No plan returned.", "План не отримано.")); setPhase("describe"); }
      else {
        setPlan(r.plan);
        pushAudit({ agent: "SHOGUN", action: "mission.blueprint_generated", evidence: "ai_gateway · goal intake", mission: "M-2042", payload: { budget_usd: r.plan.recommendedBudgetUsd, gates: r.plan.approvalCheckpoints.length, missing: r.plan.missingFacts.length } });
      }
    } catch { setError(t("Couldn't reach the planner. Please try again.", "Не вдалося зв'язатися з планувальником. Спробуйте ще раз.")); setPhase("describe"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (phase !== "live" || paused) return;
    const uk = lang === "uk";
    const budget = plan?.recommendedBudgetUsd.toFixed(2) ?? "0.15";
    const lines: [string, string][] = [["SHOGUN", uk ? `місію прийнято · ліміт бюджету $${budget}` : `mission accepted · budget cap $${budget}`]];
    plan?.waves.forEach((w) => w.tasks.forEach((t) => lines.push([w.agent, t])));
    plan?.missingFacts.forEach((m) => lines.push(["QA", uk ? `бракує факту: ${m} → позначено _DRAFT` : `missing fact: ${m} → marked _DRAFT`]));
    plan?.approvalCheckpoints.forEach((c) => lines.push(["BUSHIDO", uk ? `${c.actionType} → відкрито шлюз ризику` : `${c.actionType} → risk gate opened`]));
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
      <PageHeader code="MOD-01 · SHOGUN" title={t("Mission Hub", "Центр місій")} desc={t("Describe the result. Approve the mission. Follow it live.", "Опишіть результат. Погодьте місію. Стежте наживо.")} right={phase !== "describe" && <Btn variant="outline" onClick={reset}><RotateCcw className="size-3.5" />{t("New mission", "Нова місія")}</Btn>} />

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel step="1" title={t("Describe Goal", "Опишіть ціль")} meta={phase === "describe" ? <Badge tone="draft" pulse>{t("Editing", "Редагування")}</Badge> : <Badge tone="success">{t("Locked", "Зафіксовано")}</Badge>}>
          <textarea value={goal} onChange={(e) => setGoal(e.target.value)} disabled={phase !== "describe"} rows={5}
            className="w-full resize-none rounded-sm border bg-background p-3 text-sm outline-none focus:border-primary disabled:opacity-60" placeholder={t("What result do you want?", "Який результат вам потрібен?")} />
          <label className={cn("mt-3 flex cursor-pointer flex-col items-center gap-1 rounded-sm border border-dashed p-4 text-center text-xs text-muted-foreground hover:border-primary hover:text-foreground", phase !== "describe" && "pointer-events-none opacity-50")}>
            <Upload className="size-4" />
            {files.length ? files.join(", ") : t("Drop files or click to attach", "Перетягніть файли або натисніть, щоб додати")}
            <input type="file" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files ?? []).map((f) => f.name))} />
          </label>
          <div className="label-mono mt-4 mb-2">{t("Connectors", "Інтеграції")}</div>
          <div className="flex flex-wrap gap-1.5">
            {TOOLS.map((tool) => {
              const on = tools.includes(tool);
              return (
                <button key={tool} disabled={phase !== "describe"} onClick={() => setTools(on ? tools.filter((x) => x !== tool) : [...tools, tool])}
                  className={cn("rounded-sm border px-2 py-1 font-mono text-[11px] transition-colors", on ? "border-primary bg-primary/10 text-foreground" : "text-muted-foreground hover:text-foreground")}>
                  {on ? "● " : "○ "}{tool}
                </button>
              );
            })}
          </div>
          {error && <div className="mt-3 flex items-start gap-2 rounded-sm border border-primary/50 bg-primary/10 p-2 text-xs"><AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-primary" />{error}</div>}
          <Btn className="mt-4 w-full" disabled={phase !== "describe" || goal.trim().length < 5 || loading} onClick={generate}>{loading ? <><Loader2 className="size-3.5 animate-spin" />{t("Planning…", "Планування…")}</> : t("Generate AI blueprint →", "Згенерувати план ШІ →")}</Btn>
        </Panel>

        <Panel step="2" title={t("Mission Blueprint", "План місії")} className={cn(phase === "describe" && "opacity-40")} meta={phase === "blueprint" ? <Badge tone="warning" pulse>{t("Approval needed", "Потрібне погодження")}</Badge> : phase === "describe" ? <Badge>{t("Waiting", "Очікування")}</Badge> : <Badge tone="success">{t("Approved", "Погоджено")}</Badge>}>
          {phase === "describe" ? (
            <p className="py-10 text-center text-sm text-muted-foreground">{t("Describe a goal to generate the plan.", "Опишіть ціль, щоб згенерувати план.")}</p>
          ) : (
            <>
              {loading || !plan ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-muted-foreground"><Loader2 className="size-5 animate-spin text-primary" />{t("SHOGUN is planning Scout, Scribe and QA waves…", "SHOGUN планує хвилі Scout, Scribe і QA…")}</div>
              ) : (<>
              <div className="mb-3"><div className="font-semibold">{plan.missionTitle}</div><p className="text-xs text-muted-foreground">{plan.summary}</p></div>
              <ol className="space-y-2">
                {plan.waves.map((w, i) => (
                  <li key={i} className="flex gap-3 rounded-sm border bg-background p-2.5">
                    <span className="font-mono text-xs text-primary">W{i + 1}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{w.agent} <span className="text-xs font-normal text-muted-foreground">· {w.objective}</span></div>
                      <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">{w.tasks.map((x) => <li key={x}>{x}</li>)}</ul>
                      {w.systems.length > 0 && <div className="mt-1 font-mono text-[10px] text-muted-foreground">{w.systems.join(" · ")}</div>}
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">${w.estimatedCostUsd.toFixed(3)}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-sm border p-2"><div className="label-mono">{t("Budget", "Бюджет")}</div><div className="font-mono text-sm">${total.toFixed(3)} / ${plan.recommendedBudgetUsd.toFixed(2)}</div></div>
                <div className="rounded-sm border p-2"><div className="label-mono">{t("ETA", "Час")}</div><div className="font-mono text-sm">~{Math.round(eta)} {t("min", "хв")}</div></div>
                <div className="rounded-sm border p-2"><div className="label-mono">{t("Gates", "Шлюзи")}</div><div className="font-mono text-sm text-warning">{plan.approvalCheckpoints.length}</div></div>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">{plan.budgetRationale}</p>
              <div className="mt-3 space-y-1.5 text-xs">
                {plan.approvalCheckpoints.map((c, i) => (
                  <div key={i} className="flex items-start gap-2"><Lock className={cn("mt-0.5 size-3 shrink-0", riskTone[c.riskLevel])} /><span><b className="font-mono">{c.actionType}</b> <span className={riskTone[c.riskLevel]}>· {t(c.riskLevel, ({ low: "низький", medium: "середній", high: "високий", critical: "критичний" } as const)[c.riskLevel])}</span> · {t("after", "після")} {c.afterAgent} — <span className="text-muted-foreground">{c.reason}</span></span></div>
                ))}
              </div>
              {plan.missingFacts.length > 0 && (
                <div className="mt-3 rounded-sm border border-draft/50 bg-draft/10 p-2 text-xs"><div className="label-mono !text-draft">_DRAFT · {t("missing facts", "бракує фактів")}</div><ul className="mt-1 list-inside list-disc">{plan.missingFacts.map((m) => <li key={m}>{m}</li>)}</ul></div>
              )}
              <Btn className="mt-4 w-full" disabled={phase !== "blueprint"} onClick={() => { setPhase("live"); pushAudit({ agent: "Human", action: "mission.approved", evidence: "operator:v.vasetsky", mission: "M-2042", payload: { budget_usd: plan.recommendedBudgetUsd } }); }}>
                <Check className="size-3.5" /> {t("Approve mission", "Погодити місію")}
              </Btn>
              </>)}
            </>
          )}
        </Panel>

        <Panel step="3" title={t("Live Mission Feed", "Хід місії наживо")} className={cn((phase === "describe" || phase === "blueprint") && "opacity-40")}
          meta={phase === "live" ? (paused ? <Badge tone="warning" pulse={false}>{t("Safely paused", "Безпечно призупинено")}</Badge> : <Badge tone="primary" pulse>{t("In progress", "Виконується")}</Badge>) : phase === "done" ? <Badge tone="warning" pulse>{t("Approval needed", "Потрібне погодження")}</Badge> : <Badge>{t("Idle", "Очікує")}</Badge>}>
          <div className="mb-3 flex items-center gap-1">
            {WAVES.map((w, i) => {
              const state = phase === "done" || wave > w.n ? "done" : wave === w.n && phase === "live" ? "run" : "wait";
              return (
                <div key={w.n} className="flex flex-1 items-center gap-1">
                  <div className={cn("flex-1 rounded-sm border px-2 py-1.5 text-center", state === "run" && "glow-primary", state === "done" && "border-success/50")}>
                    <div className="label-mono">{t("Wave", "Хвиля")} {w.n}</div>
                    <div className={cn("text-xs font-semibold", state === "done" && "text-success", state === "run" && "text-primary")}>{w.agent}</div>
                  </div>
                  {i < 2 && <span className="text-muted-foreground">→</span>}
                </div>
              );
            })}
          </div>
          <div ref={logRef} className="h-56 overflow-y-auto rounded-sm border bg-background p-3 font-mono text-[11px] leading-relaxed">
            {log.length === 0 ? <span className="text-muted-foreground">&gt; {t("awaiting mission approval_", "очікує погодження місії_")}</span> :
              log.map((l, i) => <div key={i} className={cn(l.includes("_DRAFT") && "text-draft", (l.includes("risk gate") || l.includes("шлюз ризику")) && "text-primary", (l.includes("passed") || l.includes("пройдено")) && "text-success")}>{l}</div>)}
          </div>
          <div className="mt-3 flex gap-2">
            {phase === "live" && <Btn variant="outline" className="flex-1" onClick={() => setPaused(!paused)}>{paused ? <><Play className="size-3.5" />{t("Resume", "Продовжити")}</> : <><Pause className="size-3.5" />{t("Pause", "Пауза")}</>}</Btn>}
            {phase === "done" && <Link to="/approvals" className="flex-1"><Btn className="w-full">{t("Review gates in inbox →", "Переглянути шлюзи →")}</Btn></Link>}
          </div>
        </Panel>
      </div>
    </div>
  );
}
