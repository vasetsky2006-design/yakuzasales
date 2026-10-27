import { createFileRoute } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { Badge, PageHeader, Panel, Stat } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shinobi")({
  head: () => ({
    meta: [
      { title: "Shinobi Doc Parser — YAKUZA Control Tower" },
      { name: "description", content: "Extract invoice and receipt line items into a canonical catalog. Missing data is flagged, never guessed." },
      { property: "og:title", content: "Shinobi Doc Parser — YAKUZA Control Tower" },
      { property: "og:description", content: "Invoice parsing with a strict no-guessing rule." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shinobi,
});

const DOCS = [
  { file: "INV-3390.pdf", vendor: "TOV Agro-Pak", no: null, total: "₴ 186,400.00", date: "2026-10-24" },
  { file: "receipt_1027.jpg", vendor: "Epicentr K", no: "R-55120", total: "₴ 4,218.60", date: "2026-10-27" },
  { file: "INV-0812.pdf", vendor: "Nova Poshta", no: "NP-0812", total: "₴ 12,940.00", date: "2026-10-22" },
];
const LINES = [
  { sku: "PKG-BOX-40", desc: "Carton box 40×30×30", qty: "1,200", unit: "₴ 38.00", total: "₴ 45,600.00" },
  { sku: "PKG-FILM-ST", desc: "Stretch film 500mm", qty: "320", unit: "₴ 290.00", total: "₴ 92,800.00" },
  { sku: null, desc: "Pallet labels (custom)", qty: "4,000", unit: "₴ 12.00", total: "₴ 48,000.00" },
];

function Shinobi() {
  return (
    <div>
      <PageHeader code="MOD-04 · BACK-OFFICE" title="Shinobi · Document Parser" desc="Empty is not zero. Any missing fact keeps the record in draft until a human fills it in." />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Docs today" value="27" />
        <Stat label="Auto-verified" value="24" tone="success" />
        <Stat label="Drafts" value="3" tone="draft" />
        <Stat label="Catalog SKUs" value="1,482" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Inbox">
          <label className="mb-3 flex cursor-pointer flex-col items-center gap-1 rounded-sm border border-dashed p-5 text-xs text-muted-foreground hover:border-primary hover:text-foreground">
            <Upload className="size-4" />Drop invoice or receipt<input type="file" className="hidden" />
          </label>
          <ul className="space-y-2">
            {DOCS.map((d, i) => (
              <li key={d.file} className={cn("rounded-sm border bg-background p-2.5", i === 0 && "border-draft/60")}>
                <div className="flex items-center justify-between"><span className="font-mono text-xs">{d.file}</span>{d.no ? <Badge tone="success">Verified</Badge> : <Badge tone="draft">Draft</Badge>}</div>
                <div className="mt-1 text-xs text-muted-foreground">{d.vendor} · {d.total}</div>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="INV-3390.pdf · Extracted" className="lg:col-span-2" meta={<Badge tone="draft" pulse>DRAFT: Missing Invoice #</Badge>}>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[["Vendor", "TOV Agro-Pak"], ["Invoice #", null], ["Date", "2026-10-24"], ["Total", "₴ 186,400.00"]].map(([k, v]) => (
              <div key={k} className={cn("rounded-sm border p-2.5", v === null && "border-draft/60 bg-draft/5")}>
                <div className="label-mono">{k}</div>
                <div className={cn("mt-0.5 font-mono text-sm", v === null && "text-draft")}>{v ?? "∅ not found"}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 overflow-x-auto rounded-sm border">
            <table className="w-full text-xs">
              <thead className="bg-secondary/50"><tr>{["Catalog SKU", "Description", "Qty", "Unit", "Total"].map((h) => <th key={h} className="label-mono px-3 py-2 text-left">{h}</th>)}</tr></thead>
              <tbody className="font-mono">
                {LINES.map((l) => (
                  <tr key={l.desc} className="border-t">
                    <td className="px-3 py-2">{l.sku ?? <Badge tone="draft">_DRAFT · no match</Badge>}</td>
                    <td className="px-3 py-2 font-sans">{l.desc}</td>
                    <td className="px-3 py-2">{l.qty}</td><td className="px-3 py-2">{l.unit}</td><td className="px-3 py-2">{l.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Payout for this invoice is blocked in the Approval Inbox until the invoice number is supplied.</p>
        </Panel>
      </div>
    </div>
  );
}
