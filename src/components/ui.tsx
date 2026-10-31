"use client";

import { ReactNode, useEffect, useId } from "react";
import { Check as CheckIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TONES, Tone } from "@/lib/tone";

export function ProgressRing({
  value,
  size = 96,
  stroke = 9,
  tone = "gold",
  label,
  sub,
  className,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: Tone;
  label?: string;
  sub?: string;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: TONES[tone].stroke }} />
            <stop offset="100%" style={{ stopColor: "rgb(var(--gold))" }} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} style={{ stroke: "rgb(var(--line))" }} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (v / 100) * c}
          style={{ stroke: `url(#${id})`, transition: "stroke-dashoffset .8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display font-semibold leading-none" style={{ fontSize: size * 0.27 }}>
          {label ?? `${Math.round(v)}%`}
        </span>
        {sub && <span className="mt-1 text-[9px] uppercase tracking-wider text-muted">{sub}</span>}
      </div>
    </div>
  );
}

export function Check({
  checked,
  onChange,
  size = 26,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  size?: number;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "grid shrink-0 place-items-center rounded-full border-2 transition",
        checked ? "border-gold bg-gradient-to-br from-gold to-rose text-white shadow-glow" : "border-line bg-surface hover:border-gold/70"
      )}
      style={{ width: size, height: size }}
    >
      {checked && <CheckIcon className="animate-pop" size={Math.round(size * 0.6)} strokeWidth={3} />}
    </button>
  );
}

export function Bar({ value, className }: { value: number; className?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-line", className)}>
      <div className="h-full rounded-full bg-gradient-to-r from-gold to-rose transition-all duration-700" style={{ width: `${v}%` }} />
    </div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="card relative max-h-[88vh] w-full overflow-y-auto rounded-b-none bg-surface p-5 sm:max-w-lg sm:rounded-3xl sm:p-6 fade-up">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-display text-2xl font-semibold">{title}</h3>
          <button onClick={onClose} className="btn-ghost" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  sub,
  right,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  right?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="h-display text-4xl sm:text-5xl">{title}</h1>
        {sub && <p className="mt-2 text-[15px] leading-relaxed text-muted">{sub}</p>}
      </div>
      {right}
    </header>
  );
}

export function Empty({ emoji = "🌱", title, text }: { emoji?: string; title: string; text?: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-line px-6 py-10 text-center">
      <div className="text-4xl">{emoji}</div>
      <p className="mt-3 font-display text-xl font-semibold">{title}</p>
      {text && <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{text}</p>}
    </div>
  );
}

export function Field({ label, hint, children }: { label?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">{label}</span>}
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string; emoji?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)} className={cn("chip whitespace-nowrap", value === t.id && "chip-on")}>
          {t.emoji && <span>{t.emoji}</span>}
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Stat({ label, value, sub, emoji }: { label: string; value: ReactNode; sub?: string; emoji?: string }) {
  return (
    <div className="card card-pad">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
        {emoji && <span className="text-lg">{emoji}</span>}
      </div>
      <p className="mt-2 font-display text-4xl font-semibold leading-none">{value}</p>
      {sub && <p className="mt-1.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export function Splash({ text }: { text: string }) {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="text-center">
        <div className="mx-auto mb-5 h-14 w-14 animate-floaty rounded-full bg-gradient-to-br from-gold to-rose opacity-90 shadow-glow" />
        <p className="font-display text-2xl">{text}</p>
      </div>
    </div>
  );
}

export function Breadcrumb({ items }: { items: { label: string; onClick?: () => void }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="opacity-50">/</span>}
          {it.onClick ? (
            <button onClick={it.onClick} className="rounded-full px-1.5 py-0.5 hover:bg-ink/5 hover:text-ink">
              {it.label}
            </button>
          ) : (
            <span className="font-medium text-ink">{it.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}
