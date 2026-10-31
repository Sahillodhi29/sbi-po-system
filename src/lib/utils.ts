export function cn(...a: (string | false | null | undefined)[]) {
  return a.filter(Boolean).join(" ");
}

const pad = (n: number) => String(n).padStart(2, "0");

export function toStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromStr(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function todayStr() {
  return toStr(new Date());
}

export function addDays(s: string, n: number) {
  const d = fromStr(s);
  d.setDate(d.getDate() + n);
  return toStr(d);
}

export function diffDays(a: string, b: string) {
  return Math.round((fromStr(a).getTime() - fromStr(b).getTime()) / 86400000);
}

/** Monday of the week containing the date */
export function weekStart(s: string) {
  const d = fromStr(s);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return toStr(d);
}

export function fmtDate(s: string, long = false) {
  if (!s) return "";
  return fromStr(s).toLocaleDateString("en-IN", long ? { weekday: "long", day: "numeric", month: "long" } : { day: "numeric", month: "short", year: "numeric" });
}

export function uid() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}

export function pct(a: number, b: number) {
  return b > 0 ? Math.round((a / b) * 100) : 0;
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night, almost";
}

export function isUrl(s: string) {
  return /^https?:\/\//i.test(s.trim());
}

export function normalizeUrl(s: string) {
  const t = s.trim();
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}
