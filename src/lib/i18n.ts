import { useSyncExternalStore } from "react";

export type Lang = "en" | "uk";
const KEY = "yakuza-lang";
const subs = new Set<() => void>();

function get(): Lang {
  try { return localStorage.getItem(KEY) === "uk" ? "uk" : "en"; } catch { return "en"; }
}
export function setLang(l: Lang) {
  try { localStorage.setItem(KEY, l); document.documentElement.lang = l; } catch { /* ignore */ }
  subs.forEach((f) => f());
}
export function useLang(): Lang {
  return useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, get, () => "en");
}
/** Pick a string by current language. */
export function useT() {
  const lang = useLang();
  return <T,>(en: T, uk: T): T => (lang === "uk" ? uk : en);
}
