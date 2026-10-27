import { createFileRoute } from "@tanstack/react-router";
import { Badge, Btn, PageHeader, Panel } from "@/components/ui-kit";

export const Route = createFileRoute("/katana")({
  head: () => ({
    meta: [
      { title: "KATANA Content Studio — YAKUZA Control Tower" },
      { name: "description", content: "AI-staged posts, emails and docs held in draft until approved." },
      { property: "og:title", content: "KATANA Content Studio — YAKUZA Control Tower" },
      { property: "og:description", content: "AI-staged content held in draft until approved." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Katana,
});

const ITEMS = [
  { ch: "LinkedIn", title: "Launch: Control Tower for logistics ops", status: "Approval needed", tone: "warning" as const, body: "Most ops teams don't lack data — they lack a control plane. Today we're launching…" },
  { ch: "Email", title: "Q4 renewal — Kovalenko Logistics", status: "Approval needed", tone: "warning" as const, body: "Hi Olena, following our call on Thursday, here's the revised proposal with an 8% volume discount…" },
  { ch: "Blog", title: "Why 'empty is not zero' matters for AI in finance", status: "Draft", tone: "draft" as const, body: "When an AI fills a blank field with a plausible number, you've lost your audit trail…" },
  { ch: "Instagram", title: "Behind the scenes: warehouse automation", status: "Verified", tone: "success" as const, body: "Caption staged · 3 images · brand kit v3 applied" },
];

function Katana() {
  return (
    <div>
      <PageHeader code="MOD-05 · CONTENT" title="KATANA · Content Studio" desc="Draft-mode autonomy: everything is generated locally and nothing is published without a gate." right={<Btn>+ New brief</Btn>} />
      <div className="grid gap-4 md:grid-cols-2">
        {ITEMS.map((i) => (
          <Panel key={i.title} title={i.title} meta={<Badge tone={i.tone} pulse={i.tone === "warning"}>{i.status}</Badge>}>
            <div className="label-mono mb-2">{i.ch}</div>
            <p className="text-sm text-muted-foreground">{i.body}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
