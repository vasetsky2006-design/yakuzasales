import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { ShieldCheck, Lock, ScrollText, Wallet, PhoneCall, Cpu, ArrowRight, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { LangToggle } from "@/components/LangToggle";

const TITLE = "YAKUZA Control Tower — Human approval and audit for AI sales agents";
const DESC = "Let AI agents do the sales and ops work, but nothing reaches a customer or your CRM without sign-off. Approval gates, budget caps and a full audit trail.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://yakuzasales.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://yakuzasales.lovable.app/" }],
  }),
  component: Landing,
});

const featuresUk = [
  "Шлюзи погодження|Листи, зміни в CRM, ціни та платежі чекають на шлюзі ризику, доки менеджер не погодить.",
  "Ліміт бюджету на місію|Кожна ціль отримує плановий кошторис і жорсткий ліміт ще до старту агентів.",
  "Повний журнал аудиту|Кожна дія агента й рішення людини записуються з доказами, готові до перевірки.",
  "Ваші власні обмеження|Визначте, скільки кожен агент може робити сам — від лише читання до записів під наглядом.",
  "Контроль якості дзвінків|Оцінюйте дзвінки за вашим скриптом і бачте угоди під загрозою.",
  "Працює на вашому ШІ|Використовуйте локальну модель, щоб дані угод не виходили за межі компанії.",
].map((x) => x.split("|"));

const stepsUk = [
  ["Опишіть результат", "«Повернути угоди Q4, що застрягли понад 14 днів, і оновити етапи в CRM.»"],
  ["Погодьте план", "ШІ готує кроки дослідження, написання та перевірки з бюджетом і контрольними точками."],
  ["Підтвердіть ризиковані дії", "Нічого не надсилається й не змінюється, доки ви не погодите це у вхідних."],
];

const features = [
  { icon: Lock, title: "Approval gates", text: "Emails, CRM updates, pricing and payments stop at a risk gate until a manager approves." },
  { icon: Wallet, title: "Budget caps per mission", text: "Each goal gets a planned cost and a hard limit before any agent starts." },
  { icon: ScrollText, title: "Full audit trail", text: "Every agent action and human decision is logged with evidence, ready for review." },
  { icon: ShieldCheck, title: "Guardrails you set", text: "Choose how much each agent can do alone, from read-only to supervised writes." },
  { icon: PhoneCall, title: "Sales call QA", text: "Score calls against your script and flag deals at risk." },
  { icon: Cpu, title: "Runs on your own AI", text: "Use a local model so sensitive deal data stays inside your company." },
];

const steps = [
  ["Describe the result", "\"Re-engage Q4 deals stalled over 14 days and update CRM stages.\""],
  ["Approve the plan", "AI drafts research, writing and QA steps with a budget and checkpoints."],
  ["Sign off risky actions", "Nothing is sent or changed until you approve it in the inbox."],
];

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  company: z.string().trim().max(150),
  role: z.string().trim().max(100),
  message: z.string().trim().max(1000),
});

function Landing() {
  const t = useT();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <div className="grid size-8 place-items-center bg-primary font-mono text-sm font-black text-primary-foreground">√</div>
          <div className="text-sm font-bold tracking-[0.2em]">YAKUZA</div>
          <nav className="ml-auto flex items-center gap-2 text-sm">
            <LangToggle />
            <Link to="/hub" className="rounded-sm px-3 py-1.5 text-muted-foreground hover:text-foreground">{t("Try the demo", "Спробувати демо")}</Link>
            <a href="#book" className="rounded-sm bg-primary px-3 py-1.5 font-medium text-primary-foreground hover:bg-primary/90">{t("Book a demo", "Записатися на демо")}</a>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 md:pt-24">
        <div className="label-mono mb-4">{t("For sales & operations managers", "Для менеджерів з продажів та операцій")}</div>
        <h1 className="max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
          {t("Let AI agents work your pipeline. ", "Нехай ШІ-агенти працюють з вашою воронкою. ")}<span className="text-primary">{t("Nothing goes out without your sign-off.", "Нічого не йде назовні без вашого підпису.")}</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          {t("AI agents that email partners or edit your CRM unsupervised create costly cleanup. YAKUZA Control Tower puts every risky action behind an approval gate, caps spend per mission and keeps a full audit trail.", "ШІ-агенти, що без нагляду пишуть партнерам чи змінюють CRM, створюють дороге прибирання. YAKUZA Control Tower ставить кожну ризиковану дію за шлюз погодження, обмежує витрати на місію та веде повний журнал аудиту.")}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#book" className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 font-medium text-primary-foreground hover:bg-primary/90">{t("Book a demo", "Записатися на демо")} <ArrowRight className="size-4" /></a>
          <Link to="/hub" className="inline-flex items-center gap-2 rounded-sm border px-5 py-3 font-medium hover:bg-secondary">{t("Open the live demo", "Відкрити демо")}</Link>
        </div>
      </section>

      <section className="border-y bg-panel">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-3">
          {t(steps, stepsUk).map(([title, d], i) => (
            <div key={i}>
              <div className="font-mono text-xs text-primary">{t("STEP", "КРОК")} 0{i + 1}</div>
              <div className="mt-2 text-lg font-semibold">{title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold tracking-tight">{t("Control, not just automation", "Контроль, а не лише автоматизація")}</h2>
        <div className="mt-8 grid gap-px overflow-hidden rounded-sm border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, ...f }, i) => { const [title, text] = t([f.title, f.text], featuresUk[i] ?? [f.title, f.text]); return (
            <div key={i} className="bg-card p-6">
              <Icon className="size-5 text-primary" />
              <div className="mt-3 font-semibold">{title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ); })}
        </div>
      </section>

      <section id="book" className="border-t bg-panel">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{t("See it on your own pipeline", "Подивіться на своїй воронці")}</h2>
            <p className="mt-3 text-muted-foreground">{t("Book a 30-minute walkthrough, or join the waitlist for early access.", "Запишіться на 30-хвилинну демонстрацію або приєднайтеся до списку очікування для раннього доступу.")}</p>
            <ul className="mt-6 space-y-2 text-sm">
              {t(["Map one of your real workflows to a supervised mission", "See where approval gates would sit", "Get early-access pricing"], ["Перетворимо один з ваших реальних процесів на місію під наглядом", "Покажемо, де стоятимуть шлюзи погодження", "Отримайте ціну раннього доступу"]).map((x) => (
                <li key={x} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-success" />{x}</li>
              ))}
            </ul>
          </div>
          <RequestForm />
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} YAKUZA Control Tower</span>
          <Link to="/hub" className="ml-auto hover:text-foreground">{t("Live demo →", "Демо →")}</Link>
        </div>
      </footer>
    </div>
  );
}

function RequestForm() {
  const t = useT();
  const [kind, setKind] = useState<"demo" | "waitlist">("demo");
  const [form, setForm] = useState({ name: "", email: "", company: "", role: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), String(i.path[0]) === "email" ? t("Please enter a valid email", "Введіть коректний email") : t("Please enter your name", "Введіть ім'я")])));
      return;
    }
    setErrors({});
    setStatus("sending");
    const d = r.data;
    const { error } = await supabase.from("demo_requests").insert({
      name: d.name, email: d.email, kind,
      company: d.company || null, role: d.role || null, message: d.message || null,
    });
    setStatus(error ? "error" : "done");
  };

  if (status === "done") {
    return (
      <div className="panel flex flex-col items-start justify-center gap-3 p-8">
        <Check className="size-6 text-success" />
        <div className="text-lg font-semibold">{kind === "demo" ? t("Thanks — we'll reach out to schedule your demo.", "Дякуємо — ми зв'яжемося, щоб призначити демо.") : t("You're on the waitlist.", "Ви в списку очікування.")}</div>
        <p className="text-sm text-muted-foreground">{t("Meanwhile, explore the live demo.", "А поки що — перегляньте демо.")}</p>
        <Link to="/hub" className="mt-2 inline-flex items-center gap-2 rounded-sm border px-4 py-2 text-sm hover:bg-secondary">{t("Open the demo", "Відкрити демо")} <ArrowRight className="size-4" /></Link>
      </div>
    );
  }

  const input = "w-full rounded-sm border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
  return (
    <form onSubmit={submit} className="panel space-y-3 p-6" noValidate>
      <div className="grid grid-cols-2 gap-1 rounded-sm border p-1">
        {(["demo", "waitlist"] as const).map((k) => (
          <button type="button" key={k} onClick={() => setKind(k)}
            className={cn("rounded-sm py-1.5 text-sm", kind === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            {k === "demo" ? t("Book a demo", "Демо") : t("Join waitlist", "Список очікування")}
          </button>
        ))}
      </div>
      {([["name", "Name *", "Ім'я *"], ["email", "Work email *", "Робочий email *"], ["company", "Company", "Компанія"], ["role", "Your role", "Ваша посада"]] as const).map(([k, en, uk]) => { const label = t(en, uk); return (
        <label key={k} className="block">
          <span className="label-mono">{label}</span>
          <input type={k === "email" ? "email" : "text"} value={form[k]} onChange={set(k)} maxLength={k === "email" ? 255 : 150} className={cn(input, "mt-1")} />
          {errors[k] && <span className="mt-1 block text-xs text-primary">{errors[k]}</span>}
        </label>
      ); })}
      {kind === "demo" && (
        <label className="block">
          <span className="label-mono">{t("What would you like agents to handle?", "Що ви хочете доручити агентам?")}</span>
          <textarea value={form.message} onChange={set("message")} rows={3} maxLength={1000} className={cn(input, "mt-1 resize-none")} />
        </label>
      )}
      {status === "error" && <p className="text-xs text-primary">{t("Something went wrong. Please try again.", "Щось пішло не так. Спробуйте ще раз.")}</p>}
      <button type="submit" disabled={status === "sending"} className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2.5 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
        {status === "sending" && <Loader2 className="size-4 animate-spin" />}
        {kind === "demo" ? t("Request demo", "Записатися на демо") : t("Join waitlist", "Приєднатися")}
      </button>
    </form>
  );
}
