import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, Check, X } from "lucide-react";
import { Badge, Btn, PageHeader, Panel } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/prodavai")({
  head: () => ({
    meta: [
      { title: "ProdaVAI Sales QA — YAKUZA Control Tower" },
      { name: "description", content: "Score sales calls against a 10-point checklist with timestamped evidence." },
      { property: "og:title", content: "ProdaVAI Sales QA — YAKUZA Control Tower" },
      { property: "og:description", content: "Score sales calls with timestamped evidence and a 30-day action plan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProdaVAI,
});

const CHECK = [
  { item: "Greeting & introduction", ok: true, ts: "00:04" },
  { item: "Needs discovery questions", ok: true, ts: "01:12" },
  { item: "Decision-maker identified", ok: false, ts: "—" },
  { item: "Budget qualified", ok: true, ts: "03:40" },
  { item: "Value proposition tied to pain", ok: true, ts: "04:12" },
  { item: "Objection handled (price)", ok: false, ts: "06:55" },
  { item: "Social proof / case study", ok: false, ts: "—" },
  { item: "Clear next step proposed", ok: true, ts: "08:31" },
  { item: "Timeline confirmed", ok: true, ts: "08:58" },
  { item: "Recap & follow-up promise", ok: true, ts: "09:20" },
];
const PLAN = [
  ["Week 1", "Roleplay price objections — 3 sessions with lead"],
  ["Week 2", "Add decision-maker mapping to discovery script"],
  ["Week 3", "Build 2 case-study one-pagers for logistics vertical"],
  ["Week 4", "Re-score 10 calls · target ≥ 85%"],
];

function ProdaVAI() {
  const [state, setState] = useState<"idle" | "analysing" | "done">("done");
  const score = CHECK.filter((c) => c.ok).length * 10;
  const run = () => { setState("analysing"); setTimeout(() => setState("done"), 1800); };

  return (
    <div>
      <PageHeader code="MOD-03 · REVENUE" title="ProdaVAI · Sales QA" desc="Upload a call recording or transcript. Every finding cites the exact moment in the conversation." right={
        <label className="cursor-pointer"><input type="file" className="hidden" accept="audio/*,.txt" onChange={run} /><span className="inline-flex items-center gap-2 rounded-sm bg-primary px-3 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-primary/85"><Upload className="size-3.5" />Upload call</span></label>
      } />
      {state === "analysing" ? (
        <div className="panel p-16 text-center"><Badge tone="primary" pulse>Analysing call_0931.mp3</Badge><p className="mt-3 text-sm text-muted-foreground">Transcribing and scoring against checklist…</p></div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title="call_0931 · Kovalenko Logistics" meta={<span className="font-mono text-[11px] text-muted-foreground">09:41 · I. Petrenko</span>}>
            <div className="flex items-end gap-2">
              <span className={cn("font-mono text-6xl font-bold", score >= 80 ? "text-success" : "text-warning")}>{score}</span>
              <span className="mb-2 font-mono text-muted-foreground">/100</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-warning" style={{ width: `${score}%` }} /></div>
            <div className="label-mono mt-5 mb-2">Lost-deal bottlenecks</div>
            <ul className="space-y-2 text-sm">
              <li className="rounded-sm border-l-2 border-primary bg-background p-2">Price objection deflected, not handled <span className="font-mono text-xs text-muted-foreground">@06:55</span></li>
              <li className="rounded-sm border-l-2 border-primary bg-background p-2">No decision-maker confirmed — deal may stall</li>
              <li className="rounded-sm border-l-2 border-warning bg-background p-2">No proof offered when client said "we tried this before" <span className="font-mono text-xs text-muted-foreground">@05:18</span></li>
            </ul>
          </Panel>
          <Panel title="10-point checklist" meta={<Badge tone="warning">{CHECK.filter((c) => !c.ok).length} misses</Badge>}>
            <ul className="divide-y">
              {CHECK.map((c) => (
                <li key={c.item} className="flex items-center gap-2 py-1.5 text-sm">
                  {c.ok ? <Check className="size-3.5 text-success" /> : <X className="size-3.5 text-primary" />}
                  <span className={cn("flex-1", !c.ok && "text-muted-foreground")}>{c.item}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{c.ts}</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="30-day action plan" meta={<Badge tone="draft">Auto-generated</Badge>}>
            <ol className="space-y-3">
              {PLAN.map(([w, t]) => (
                <li key={w} className="flex gap-3"><span className="label-mono w-14 shrink-0 pt-0.5">{w}</span><span className="text-sm">{t}</span></li>
              ))}
            </ol>
            <Btn variant="outline" className="mt-5 w-full">Send plan to rep (needs approval)</Btn>
          </Panel>
        </div>
      )}
    </div>
  );
}
