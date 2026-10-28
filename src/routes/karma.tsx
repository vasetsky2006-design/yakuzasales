import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useState } from "react";
import { Search, Lock } from "lucide-react";
import { Badge, PageHeader } from "@/components/ui-kit";
import { useAudit } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { useWebMCP } from "use-webmcp-tool";
import { runWebMCPTool } from "@/lib/webmcp-telemetry";


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
  const t = useT();
  const audit = useAudit();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const rows = audit.filter((a) => JSON.stringify(a).toLowerCase().includes(q.toLowerCase()));

  useWebMCP({
    name: "read_audit_view",
    description: "Read up to twenty audit entries matching the current screen search; does not change the search or records.",
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: () => runWebMCPTool("read_audit_view", () => rows.length
      ? `${rows.length} matching entries.\n${rows.slice(0, 20).map((r) => `${r.id}: ${r.ts} | ${r.agent} | ${r.action} | ${r.mission} | ${r.evidence}`).join("\n")}`
      : "No matching entries in the current view."),
  });

  return (
    <div>
      <PageHeader code="MOD-07 · AUDIT" title={t("KARMA · Immutable Audit Trail", "KARMA · Незмінний журнал аудиту")} desc={t("Append-only. Every prompt, decision and approval with its evidence.", "Лише додавання. Кожен запит, рішення й погодження з доказами.")} right={<Badge tone="success"><Lock className="size-3" />{t("Append-only · hash-chained", "Лише додавання · хеш-ланцюг")}</Badge>} />
      <div className="relative mb-3 max-w-md">
        <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search agent, action, mission, evidence…", "Пошук за агентом, дією, місією, доказом…")} className="w-full rounded-sm border bg-card py-2 pl-9 pr-3 font-mono text-xs outline-none focus:border-primary" />
      </div>
      <div className="panel overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-secondary/50"><tr>{t(["ID", "Timestamp (UTC)", "Agent", "Action", "Mission", "Evidence"], ["ID", "Час (UTC)", "Агент", "Дія", "Місія", "Доказ"]).map((h) => <th key={h} className="label-mono whitespace-nowrap px-3 py-2 text-left">{h}</th>)}</tr></thead>
          <tbody className="font-mono">
            {rows.map((r) => (
              <Fragment key={r.id}>
                <tr onClick={() => setOpen(open === r.id ? null : r.id)} className="cursor-pointer border-t hover:bg-secondary/30">
                  <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{r.id}</td>
                  <td className="whitespace-nowrap px-3 py-2">{r.ts}</td>
                  <td className="px-3 py-2"><span className={r.agent === "Human" ? "text-warning" : "text-primary"}>{r.agent === "Human" ? t("Human", "Людина") : r.agent}</span></td>
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
        {rows.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">{t("No matching entries.", "Нічого не знайдено.")}</div>}
      </div>
    </div>
  );
}
