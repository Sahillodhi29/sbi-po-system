"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, todayStr } from "@/lib/utils";

const DOW = ["M", "T", "W", "T", "F", "S", "S"];

export default function Calendar({
  selected,
  onSelect,
  marks,
}: {
  selected: string;
  onSelect: (d: string) => void;
  marks: Record<string, { total: number; done: number }>;
}) {
  const today = todayStr();
  const [cursor, setCursor] = useState(() => selected.slice(0, 7));
  const [y, m] = cursor.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const lead = (first.getDay() + 6) % 7;
  const count = new Date(y, m, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= count; d++) cells.push(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);

  const shift = (n: number) => {
    const d = new Date(y, m - 1 + n, 1);
    setCursor(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => shift(-1)} className="btn-ghost !p-2" aria-label="Previous month">
          <ChevronLeft size={18} />
        </button>
        <p className="font-display text-xl font-semibold">{first.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
        <button onClick={() => shift(1)} className="btn-ghost !p-2" aria-label="Next month">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wider text-muted">
        {DOW.map((d, i) => (
          <div key={i} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const mk = marks[date];
          const complete = mk && mk.total > 0 && mk.done === mk.total;
          const isSel = date === selected;
          return (
            <button
              key={date}
              onClick={() => onSelect(date)}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-2xl text-sm transition",
                isSel ? "bg-gradient-to-br from-gold to-rose font-semibold text-white shadow-glow" : "hover:bg-gold/10",
                !isSel && date === today && "ring-2 ring-gold/60"
              )}
            >
              {Number(date.slice(8))}
              {mk && mk.total > 0 && (
                <span className={cn("absolute bottom-1.5 h-1.5 w-1.5 rounded-full", isSel ? "bg-white" : complete ? "bg-sage" : "bg-rose")} />
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-4 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose" /> planned
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-sage" /> all done
        </span>
      </div>
    </div>
  );
}
