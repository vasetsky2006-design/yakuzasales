import { setLang, useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LangToggle() {
  const lang = useLang();
  return (
    <div className="flex shrink-0 overflow-hidden rounded-sm border font-mono text-[11px]">
      {(["en", "uk"] as const).map((l) => (
        <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l}
          className={cn("px-2 py-1", lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
          {l === "en" ? "EN" : "UA"}
        </button>
      ))}
    </div>
  );
}
