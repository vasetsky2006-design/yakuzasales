import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge, PageHeader, Panel, Stat } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bushido")({
  head: () => ({
    meta: [
      { title: "BUSHIDO Guardrails — YAKUZA Control Tower" },
      { name: "description", content: "Autonomy levels, token wallets and budget limits for every agent." },
      { property: "og:title", content: "BUSHIDO Guardrails — YAKUZA Control Tower" },
      { property: "og:description", content: "Autonomy levels, token wallets and budget limits." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Bushido,
});

const LEVELS = [
  { id: "advisor", name: "Advisor", d: "Read-only analysis. Zero external change." },
  { id: "draft", name: "Draft", d: "Generates local assets. No external writes." },
  { id: "supervised", name: "Supervised", d: "External writes halt at risk gates." },
  { id: "autopilot", name: "Autopilot", d: "Scheduled routines within pre-approved budgets." },
];
const AGENTS = [
  { a: "ProdaVAI", used: 3.12, cap: 10, level: "supervised" },
  { a: "Shinobi", used: 1.4, cap: 5, level: "supervised" },
  { a: "KATANA", used: 4.6, cap: 6, level: "draft" },
  { a: "Scout", used: 0.38, cap: 2, level: "advisor" },
];

function Bushido() {
  const [level, setLevel] = useState("supervised");
  return (
    <div>
      <PageHeader code="MOD-06 · GUARDRAILS" title="BUSHIDO · Guardrails & Wallets" desc="Set how far agents may act on their own, and how much they may spend." />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Wallet balance" value="$42.50" tone="warning" />
        <Stat label="Spent (MTD)" value="$9.50" />
        <Stat label="Local LLM share" value="71%" tone="success" />
        <Stat label="Blocked actions" value="14" tone="primary" />
      </div>
      <Panel title="Tenant autonomy level" className="mb-4">
        <div className="grid gap-2 md:grid-cols-4">
          {LEVELS.map((l, i) => (
            <button key={l.id} onClick={() => setLevel(l.id)} className={cn("rounded-sm border p-3 text-left transition-colors", level === l.id ? "glow-primary bg-primary/5" : "hover:bg-secondary/50")}>
              <div className="label-mono">Level {i + 1}</div>
              <div className="mt-1 font-semibold">{l.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">{l.d}</div>
            </button>
          ))}
        </div>
      </Panel>
      <Panel title="Agent token wallets">
        <div className="space-y-3">
          {AGENTS.map((g) => {
            const pct = (g.used / g.cap) * 100;
            return (
              <div key={g.a} className="grid grid-cols-[100px_1fr_auto] items-center gap-3">
                <span className="text-sm font-medium">{g.a}</span>
                <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className={cn("h-full", pct > 70 ? "bg-primary" : "bg-success")} style={{ width: `${pct}%` }} /></div>
                <div className="flex items-center gap-2"><span className="font-mono text-xs">${g.used.toFixed(2)} / ${g.cap}</span><Badge>{g.level}</Badge></div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
