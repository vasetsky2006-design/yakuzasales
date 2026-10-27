import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Target, Zap, PhoneCall, FileText, Palette, Shield, ScrollText, Menu, X, Cpu, Wallet, Building2 } from "lucide-react";
import { useGates } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/hub", label: "Mission Hub", sub: "UX Contract", icon: Target },
  { to: "/approvals", label: "Approval Inbox", sub: "Risk Gates", icon: Zap, badge: true },
  { to: "/prodavai", label: "ProdaVAI", sub: "Sales QA", icon: PhoneCall },
  { to: "/shinobi", label: "Shinobi", sub: "Doc Parser", icon: FileText },
  { to: "/katana", label: "KATANA", sub: "Content Studio", icon: Palette },
  { to: "/bushido", label: "BUSHIDO", sub: "Guardrails", icon: Shield },
  { to: "/karma", label: "KARMA", sub: "Audit Trail", icon: ScrollText },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const pending = useGates().filter((g) => g.status === "pending").length;
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside className={cn("fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r bg-panel transition-transform lg:static lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center gap-2.5 border-b px-4 py-4">
          <div className="grid size-8 place-items-center bg-primary font-mono text-sm font-black text-primary-foreground">√</div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-[0.2em]">YAKUZA</div>
            <div className="label-mono !text-[9px]">Control Tower</div>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="size-4" /></button>
        </div>
        <nav className="flex-1 space-y-0.5 p-2">
          {nav.map((n) => {
            const active = path.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                className={cn("group flex items-center gap-3 rounded-sm border-l-2 px-3 py-2 transition-colors",
                  active ? "border-primary bg-secondary text-foreground" : "border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground")}>
                <Icon className={cn("size-4", active && "text-primary")} />
                <div className="flex-1 leading-tight">
                  <div className="text-sm font-medium">{n.label}</div>
                  <div className="font-mono text-[9px] uppercase tracking-wider opacity-60">{n.sub}</div>
                </div>
                {"badge" in n && pending > 0 && (
                  <span className="grid min-w-5 place-items-center rounded-sm bg-primary px-1 font-mono text-[10px] font-bold text-primary-foreground">{pending}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4">
          <div className="label-mono">Autonomy mode</div>
          <div className="mt-1 text-sm font-semibold text-warning">Supervised</div>
          <div className="mt-0.5 text-xs text-muted-foreground">External writes halt at risk gates</div>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-background/70 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-2 overflow-x-auto border-b bg-background/90 px-4 py-2 backdrop-blur">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="size-5" /></button>
          <div className="ml-auto flex shrink-0 items-center gap-2 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 rounded-sm border px-2 py-1"><Cpu className="size-3 text-success" /><span className="size-1.5 rounded-full bg-success pulse-dot" />Local LLM: <b className="text-success">Online</b> <span className="hidden text-muted-foreground sm:inline">(Ollama Qwen 2.5)</span></span>
            <span className="flex items-center gap-1.5 rounded-sm border px-2 py-1"><Wallet className="size-3 text-warning" />Wallet: <b>$42.50</b></span>
            <span className="flex items-center gap-1.5 rounded-sm border px-2 py-1"><Building2 className="size-3 text-primary" />Tenant: <b>Enterprise-01</b></span>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
