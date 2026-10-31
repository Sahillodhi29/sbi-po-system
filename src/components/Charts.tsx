"use client";

import { useId } from "react";
import { addDays, cn, fmtDate, todayStr, weekStart } from "@/lib/utils";
import { TONES, Tone } from "@/lib/tone";

const LV = ["bg-line/70", "bg-gold/30", "bg-gold/55", "bg-gold/80", "bg-gold"];

export function Heatmap({ days, weeks = 26 }: { days: Record<string, number>; weeks?: number }) {
  const today = todayStr();
  const end = addDays(weekStart(today), 6);
  const start = addDays(end, -(weeks * 7 - 1));
  const cols: string[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: string[] = [];
    for (let d = 0; d < 7; d++) col.push(addDays(start, w * 7 + d));
    cols.push(col);
  }
  const level = (n: number) => (n >= 6 ? 4 : n >= 4 ? 3 : n >= 2 ? 2 : n >= 1 ? 1 : 0);
  return (
    <div>
      <div className="no-scrollbar -mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex gap-[5px]" style={{ minWidth: weeks * 17 }}>
          {cols.map((col, i) => (
            <div key={i} className="flex flex-col gap-[5px]">
              {col.map((date) => (
                <div
                  key={date}
                  title={`${fmtDate(date)}: ${days[date] ? `${days[date]} points` : "no activity"}`}
                  className={cn("h-3 w-3 rounded-[4px]", LV[level(days[date] || 0)], date > today && "opacity-30", date === today && "ring-2 ring-rose")}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-muted">
        Less
        {LV.map((c) => (
          <span key={c} className={cn("h-3 w-3 rounded-[4px]", c)} />
        ))}
        More
      </div>
    </div>
  );
}

export function LineChart({
  points,
  target,
  height = 190,
  tone = "gold",
}: {
  points: { label: string; value: number }[];
  target?: number;
  height?: number;
  tone?: Tone;
}) {
  const id = useId().replace(/:/g, "");
  const W = 600;
  const H = height;
  const padL = 34;
  const padR = 14;
  const padT = 14;
  const padB = 26;
  const iw = W - padL - padR;
  const ih = H - padT - padB;
  const x = (i: number) => padL + (points.length <= 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v: number) => padT + ih - (Math.max(0, Math.min(100, v)) / 100) * ih;
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = points.length > 1 ? `${path} L${x(points.length - 1).toFixed(1)},${padT + ih} L${x(0).toFixed(1)},${padT + ih} Z` : "";
  const stroke = TONES[tone].stroke;
  const step = Math.max(1, Math.ceil(points.length / 6));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Score trend">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: stroke, stopOpacity: 0.35 }} />
          <stop offset="100%" style={{ stopColor: stroke, stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} strokeWidth={1} style={{ stroke: "rgb(var(--line))" }} />
          <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize={10} style={{ fill: "rgb(var(--muted))" }}>
            {t}
          </text>
        </g>
      ))}
      {typeof target === "number" && (
        <g>
          <line x1={padL} x2={W - padR} y1={y(target)} y2={y(target)} strokeWidth={1.5} strokeDasharray="5 5" style={{ stroke: "rgb(var(--rose))" }} />
          <text x={W - padR} y={y(target) - 5} textAnchor="end" fontSize={10} style={{ fill: "rgb(var(--rose))" }}>
            target {target}%
          </text>
        </g>
      )}
      {area && <path d={area} fill={`url(#${id})`} />}
      {points.length > 1 && <path d={path} fill="none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ stroke }} />}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.value)} r={4.5} style={{ fill: "rgb(var(--surface))", stroke }} strokeWidth={2.5}>
            <title>{`${p.label}: ${p.value}%`}</title>
          </circle>
          {i % step === 0 && (
            <text x={x(i)} y={H - 7} textAnchor="middle" fontSize={10} style={{ fill: "rgb(var(--muted))" }}>
              {p.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

export function Bars({ items }: { items: { label: string; value: number; sub?: string; tone?: Tone }[] }) {
  return (
    <div className="space-y-3.5">
      {items.map((it) => (
        <div key={it.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="font-medium">{it.label}</span>
            <span className="text-xs text-muted">{it.sub ?? `${it.value}%`}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-line">
            <div className={cn("h-full rounded-full transition-all duration-700", TONES[it.tone ?? "gold"].solid)} style={{ width: `${Math.max(2, Math.min(100, it.value))}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
