import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X, CircleCheck, CircleX } from "lucide-react";
import { Badge, Btn, PageHeader, Stat } from "@/components/ui-kit";
import { decideGate, useGates, type Risk } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";


export const Route = createFileRoute("/approvals")({
  head: () => ({
    meta: [
      { title: "Approval Inbox — YAKUZA Control Tower" },
      { name: "description", content: "Human-in-the-loop risk gates for AI actions that change external systems." },
      { property: "og:title", content: "Approval Inbox — YAKUZA Control Tower" },
      { property: "og:description", content: "Human-in-the-loop risk gates for AI actions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Approvals,
});

const riskTone: Record<Risk, "success" | "warning" | "primary"> = { low: "success", medium: "warning", high: "primary", critical: "primary" };

function Approvals() {
  const t = useT();
  const RISK = { low: "низький", medium: "середній", high: "високий", critical: "критичний" } as const;
  const gates = useGates();
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const list = filter === "pending" ? gates.filter((g) => g.status === "pending") : gates;
  const count = (s: string) => gates.filter((g) => g.status === s).length;

  return (
    <div>
      <PageHeader code="MOD-02 · BUSHIDO GATE" title={t("Approval Inbox", "Вхідні погодження")} desc={t("AI actions that would change external systems are halted here until a human signs off.", "Дії ШІ, що змінюють зовнішні системи, зупиняються тут, доки людина не погодить.")} />
      <div className="mb-5 grid grid-cols-3 gap-3">
        <Stat label={t("Pending", "Очікують")} value={String(count("pending"))} tone="warning" />
        <Stat label={t("Approved today", "Погоджено сьогодні")} value={String(count("approved"))} tone="success" />
        <Stat label={t("Rejected", "Відхилено")} value={String(count("rejected"))} tone="primary" />
      </div>
      <div className="mb-3 flex gap-1">
        {(["pending", "all"] as const).map((f) => (
          <Btn key={f} variant={filter === f ? "outline" : "ghost"} onClick={() => setFilter(f)}>{f === "pending" ? t("pending", "очікують") : t("all", "усі")}</Btn>
        ))}
      </div>

      {list.length === 0 && <div className="panel p-10 text-center text-sm text-muted-foreground">{t("Inbox clear. No actions awaiting consent.", "Усе розглянуто. Немає дій, що чекають погодження.")}</div>}

      <div className="space-y-3">
        {list.map((g) => {
          const missing = g.diff.some((d) => d.proposed === null);
          return (
            <article key={g.id} className={cn("panel overflow-hidden", g.risk === "critical" && g.status === "pending" && "border-primary/60")}>
              <header className="flex flex-wrap items-center gap-2 border-b px-4 py-2.5">
                <span className="font-mono text-xs text-muted-foreground">{g.id}</span>
                <Badge tone={riskTone[g.risk]} pulse={g.risk === "critical"}>{t(`${g.risk} risk`, `${RISK[g.risk]} ризик`)}</Badge>
                <Badge>{g.target}</Badge>
                {missing && <Badge tone="draft">_DRAFT · {t("missing field", "бракує поля")}</Badge>}
                <span className="ml-auto font-mono text-[11px] text-muted-foreground">{g.agent} · {g.createdAt}</span>
              </header>
              <div className="p-4">
                <h3 className="font-semibold">{t(g.title, g.titleUk ?? g.title)}</h3>
                <div className="text-xs text-muted-foreground">{t(g.mission, g.missionUk ?? g.mission)} · <span className="font-mono">{g.action}</span></div>
                <div className="mt-3 overflow-x-auto rounded-sm border">
                  <table className="w-full font-mono text-xs">
                    <thead className="bg-secondary/50"><tr><th className="label-mono px-3 py-1.5 text-left">{t("Field", "Поле")}</th><th className="label-mono px-3 py-1.5 text-left">{t("Current state", "Зараз")}</th><th className="label-mono px-3 py-1.5 text-left">{t("AI proposed", "Пропозиція ШІ")}</th></tr></thead>
                    <tbody>
                      {g.diff.map((d) => (
                        <tr key={d.field} className="border-t">
                          <td className="px-3 py-1.5 text-muted-foreground">{d.field}</td>
                          <td className="px-3 py-1.5 text-primary/80">{d.current === null ? <span className="text-muted-foreground">∅ {t("empty", "порожньо")}</span> : <span className="line-through">{d.current}</span>}</td>
                          <td className="px-3 py-1.5">{d.proposed === null ? <span className="text-draft">∅ {t("unknown — AI never guesses", "невідомо — ШІ не вгадує")}</span> : <span className="text-success">{d.proposed}</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {g.status === "pending" ? (
                    <>
                      <Btn onClick={() => decideGate(g.id, "approved")} disabled={missing} title={missing ? t("Fill missing facts first", "Спершу заповніть бракуючі дані") : undefined}><Check className="size-3.5" />{t("Approve & execute", "Погодити й виконати")}</Btn>
                      <Btn variant="outline" onClick={() => decideGate(g.id, "rejected")}><X className="size-3.5" />{t("Reject & revise", "Відхилити на доопрацювання")}</Btn>
                      {missing && <span className="text-xs text-draft">{t("Approval locked until missing data is supplied.", "Погодження заблоковане, доки не додано бракуючі дані.")}</span>}
                    </>
                  ) : g.status === "approved" ? (
                    <div className="flex items-center gap-2 text-sm font-medium text-success animate-in fade-in zoom-in-95"><CircleCheck className="size-4" />{t("Approved · executed and logged to KARMA", "Погоджено · виконано й записано в KARMA")}</div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground animate-in fade-in"><CircleX className="size-4" />{t("Rejected · returned to agent for revision", "Відхилено · повернуто агенту на доопрацювання")}</div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
