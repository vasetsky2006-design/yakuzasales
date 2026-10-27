import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "success" | "warning" | "draft" | "muted";
const toneCls: Record<Tone, string> = {
  primary: "text-primary border-primary/40 bg-primary/10",
  success: "text-success border-success/40 bg-success/10",
  warning: "text-warning border-warning/40 bg-warning/10",
  draft: "text-draft border-draft/40 bg-draft/10",
  muted: "text-muted-foreground border-border bg-secondary/50",
};
const dotCls: Record<Tone, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  draft: "bg-draft",
  muted: "bg-muted-foreground",
};

export function Badge({ tone = "muted", pulse, children, className }: { tone?: Tone; pulse?: boolean; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider", toneCls[tone], className)}>
      {pulse !== undefined && <span className={cn("size-1.5 rounded-full", dotCls[tone], pulse && "pulse-dot")} />}
      {children}
    </span>
  );
}

export function Panel({ title, meta, children, className, step }: { title?: string; meta?: ReactNode; children: ReactNode; className?: string; step?: string }) {
  return (
    <section className={cn("panel", className)}>
      {title && (
        <header className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
          <div className="flex items-center gap-2">
            {step && <span className="grid size-5 place-items-center rounded-sm bg-primary font-mono text-[10px] font-bold text-primary-foreground">{step}</span>}
            <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          </div>
          {meta}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function PageHeader({ code, title, desc, right }: { code: string; title: string; desc: string; right?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="label-mono">{code}</div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{desc}</p>
      </div>
      {right}
    </div>
  );
}

export function Stat({ label, value, tone }: { label: string; value: string; tone?: Tone }) {
  return (
    <div className="panel px-4 py-3">
      <div className="label-mono">{label}</div>
      <div className={cn("mt-1 font-mono text-xl font-semibold", tone && tone !== "muted" && `text-${tone}`)}>{value}</div>
    </div>
  );
}

export function Btn({ variant = "primary", className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost" }) {
  return (
    <button
      {...p}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-sm px-3 py-2 font-mono text-xs font-semibold uppercase tracking-wider transition-colors disabled:pointer-events-none disabled:opacity-40",
        variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/85",
        variant === "outline" && "border border-border bg-secondary/40 text-foreground hover:bg-secondary",
        variant === "ghost" && "text-muted-foreground hover:bg-secondary hover:text-foreground",
        className,
      )}
    />
  );
}
