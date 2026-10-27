import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useState } from "react";
import { Search, Lock } from "lucide-react";
import { Badge, PageHeader } from "@/components/ui-kit";
import { useAudit } from "@/lib/store";

export const Route = createFileRoute("/karma")({
  head: () => ({
    meta: [
      { title: "KARMA Audit Trail — YAKUZA Control Tower" },
      { name: "description", content: "Immutable, searchable log of every agent decision and human approval." },
      { property: "og:title", content: "KARMA Audit Trail — YAKUZA Control Tower" },
      { property: "og:description", content: "Immutable log of every agent decision and human approval." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Karma,
});

function Karma() {
  const audit = useAudit();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const rows = audit.filter((a) => JSON.stringify(a).toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PageHeader code="MOD-07 · AUDIT" title="KARMA · Immutable Audit Trail" desc="Append-only. Every prompt, decision and approval with its evidence." right={<Badge tone="success"><Lock className="size-3" />Append-only · hash-chained</Badge>} />
      <div className="relative mb-3 max-w-md">
        <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search agent, action, mission, evidence…" className="w-full rounded-sm border bg-card py-2 pl-9 pr-3 font-mono text-xs outline-none focus:border-primary" />
      </div>
      <div className="panel overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-secondary/50"><tr>{["ID", "Timestamp (UTC)", "Agent", "Action", "Mission", "Evidence"].map((h) => <th key={h} className="label-mono whitespace-nowrap px-3 py-2 text-left">{h}</th>)}</tr></thead>
          <tbody className="font-mono">
            {rows.map((r) => (
              <Fragment key={r.id}>
                <tr onClick={() => setOpen(open === r.id ? null : r.id)} className="cursor-pointer border-t hover:bg-secondary/30">
                  <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{r.id}</td>
                  <td className="whitespace-nowrap px-3 py-2">{r.ts}</td>
                  <td className="px-3 py-2"><span className={r.agent === "Human" ? "text-warning" : "text-primary"}>{r.agent}</span></td>
                  <td className="whitespace-nowrap px-3 py-2">{r.action}</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.mission}</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.evidence}</td>
                </tr>
                {open === r.id && (
                  <tr className="bg-background"><td colSpan={6} className="px-3 py-2"><pre className="text-success">{JSON.stringify(r.payload, null, 2)}</pre></td></tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No matching entries.</div>}
      </div>
    </div>
  );
}
