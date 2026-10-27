import { useSyncExternalStore } from "react";

export type Risk = "low" | "medium" | "high" | "critical";
export type GateStatus = "pending" | "approved" | "rejected";

export interface Gate {
  id: string;
  title: string;
  mission: string;
  agent: string;
  risk: Risk;
  target: string;
  action: string;
  diff: { field: string; current: string | null; proposed: string | null }[];
  status: GateStatus;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  ts: string;
  agent: string;
  action: string;
  evidence: string;
  mission: string;
  payload: Record<string, unknown>;
}

let gates: Gate[] = [
  {
    id: "G-7741",
    title: "Send revised quote to Kovalenko Logistics",
    mission: "M-2041 · Q4 renewal push",
    agent: "ProdaVAI",
    risk: "high",
    target: "Client Email · Gmail",
    action: "send_email",
    diff: [
      { field: "to", current: null, proposed: "o.kovalenko@kovlog.ua" },
      { field: "subject", current: null, proposed: "Revised Q4 proposal — 8% volume discount" },
      { field: "discount_pct", current: "0", proposed: "8" },
      { field: "valid_until", current: null, proposed: "2026-11-15" },
    ],
    status: "pending",
    createdAt: "09:02:14",
  },
  {
    id: "G-7742",
    title: "Update deal stage in CRM",
    mission: "M-2041 · Q4 renewal push",
    agent: "SHOGUN",
    risk: "medium",
    target: "CRM Update · HubSpot",
    action: "update_crm",
    diff: [
      { field: "deal.stage", current: "Qualified", proposed: "Proposal Sent" },
      { field: "deal.amount", current: "$48,000", proposed: "$44,160" },
      { field: "deal.owner", current: "unassigned", proposed: "I. Petrenko" },
    ],
    status: "pending",
    createdAt: "09:02:19",
  },
  {
    id: "G-7743",
    title: "Execute supplier payout · Invoice INV-3390",
    mission: "M-2038 · AP reconciliation",
    agent: "Shinobi",
    risk: "critical",
    target: "Payout · Bank API",
    action: "execute_payout",
    diff: [
      { field: "amount", current: null, proposed: "₴ 186,400.00" },
      { field: "beneficiary", current: null, proposed: "TOV Agro-Pak" },
      { field: "invoice_no", current: null, proposed: null },
    ],
    status: "pending",
    createdAt: "08:57:41",
  },
  {
    id: "G-7744",
    title: "Publish LinkedIn post · Product launch",
    mission: "M-2040 · Launch campaign",
    agent: "KATANA",
    risk: "low",
    target: "Social · LinkedIn",
    action: "publish_post",
    diff: [
      { field: "status", current: "draft", proposed: "scheduled" },
      { field: "publish_at", current: null, proposed: "2026-10-28 10:00" },
    ],
    status: "pending",
    createdAt: "08:41:03",
  },
];

let audit: AuditEntry[] = [
  { id: "K-90412", ts: "2026-10-27 09:02:19.441", agent: "SHOGUN", action: "gate.created", evidence: "wave_2.output#deal_stage", mission: "M-2041", payload: { gate: "G-7742", risk: "medium" } },
  { id: "K-90411", ts: "2026-10-27 09:02:14.102", agent: "ProdaVAI", action: "gate.created", evidence: "call_0931.transcript@04:12", mission: "M-2041", payload: { gate: "G-7741", risk: "high" } },
  { id: "K-90410", ts: "2026-10-27 09:01:58.870", agent: "Scribe", action: "draft.generated", evidence: "catalog.pricing_rules#R-14", mission: "M-2041", payload: { tokens: 1840, cost_usd: 0.0112 } },
  { id: "K-90409", ts: "2026-10-27 09:01:22.015", agent: "Scout", action: "crm.read", evidence: "hubspot.deals/48821", mission: "M-2041", payload: { records: 12 } },
  { id: "K-90408", ts: "2026-10-27 08:57:41.330", agent: "Shinobi", action: "nogs.flagged_draft", evidence: "INV-3390.pdf p1 — invoice_no empty", mission: "M-2038", payload: { missing: ["invoice_no"], status: "_DRAFT" } },
  { id: "K-90407", ts: "2026-10-27 08:41:03.902", agent: "KATANA", action: "content.staged", evidence: "brand_kit.v3", mission: "M-2040", payload: { channel: "linkedin", words: 182 } },
  { id: "K-90406", ts: "2026-10-27 08:30:00.000", agent: "BUSHIDO", action: "wallet.topup", evidence: "operator:v.vasetsky", mission: "—", payload: { amount_usd: 25 } },
  { id: "K-90405", ts: "2026-10-27 08:12:45.118", agent: "Human", action: "mission.approved", evidence: "operator:i.petrenko", mission: "M-2041", payload: { budget_usd: 0.15 } },
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const nowTs = () => new Date().toISOString().replace("T", " ").slice(0, 23);

export function pushAudit(e: Omit<AuditEntry, "id" | "ts">) {
  const n = 90413 + (audit.length - 8);
  audit = [{ ...e, id: `K-${n}`, ts: nowTs() }, ...audit];
  emit();
}

export function decideGate(id: string, status: GateStatus) {
  const g = gates.find((x) => x.id === id);
  gates = gates.map((x) => (x.id === id ? { ...x, status } : x));
  if (g) {
    pushAudit({
      agent: "Human",
      action: status === "approved" ? "gate.approved" : "gate.rejected",
      evidence: "operator:v.vasetsky",
      mission: g.mission.split(" ")[0],
      payload: { gate: id, action: g.action },
    });
  }
  emit();
}

export const useGates = () => useSyncExternalStore(subscribe, () => gates, () => gates);
export const useAudit = () => useSyncExternalStore(subscribe, () => audit, () => audit);
