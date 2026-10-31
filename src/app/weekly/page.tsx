"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDoc } from "@/lib/store";
import { EMPTY_FOCUS, EMPTY_PLAN, EMPTY_WEEKLY } from "@/lib/progress";
import { FocusDoc, PlanDoc, WeeklyDoc, WeeklyEntry } from "@/lib/types";
import { addDays, fmtDate, todayStr, weekStart } from "@/lib/utils";
import { PageHeader, Stat } from "@/components/ui";
import { useState } from "react";

const EMPTY: WeeklyEntry = { worked: "", didnt: "", focus: "", wins: "", rating: 0 };

const PROMPTS: { id: keyof Omit<WeeklyEntry, "rating">; emoji: string; title: string; placeholder: string }[] = [
  { id: "worked", emoji: "🌿", title: "What worked this week?", placeholder: "Habits, timings, resources and methods worth repeating…" },
  { id: "didnt", emoji: "🪨", title: "What didn’t work?", placeholder: "Where I lost time, avoided something, or kept slipping…" },
  { id: "wins", emoji: "🏆", title: "Small wins", placeholder: "Anything I’m proud of, however small…" },
  { id: "focus", emoji: "🎯", title: "Next week’s focus", placeholder: "The 2–3 things that matter most next week…" },
];

export default function WeeklyPage() {
  const [weeks, setWeeks] = useDoc<WeeklyDoc>("weekly", EMPTY_WEEKLY);
  const [plan] = useDoc<PlanDoc>("plan", EMPTY_PLAN);
  const [focus] = useDoc<FocusDoc>("focus", EMPTY_FOCUS);
  const thisWeek = weekStart(todayStr());
  const [week, setWeek] = useState(thisWeek);

  const entry = weeks[week] ?? EMPTY;
  const update = (patch: Partial<WeeklyEntry>) => setWeeks((p) => ({ ...p, [week]: { ...(p[week] ?? EMPTY), ...patch } }));

  const dates = [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(week, i));
  const tasks = dates.flatMap((d) => plan[d] ?? []);
  const done = tasks.filter((t) => t.done).length;
  const minutes = dates.reduce((n, d) => n + Object.values(focus[d] ?? {}).reduce((a, b) => a + b, 0), 0);
  const activeDays = dates.filter((d) => (plan[d] ?? []).some((t) => t.done) || Object.keys(focus[d] ?? {}).length > 0).length;

  const isSunday = new Date().getDay() === 0;

  return (
    <div>
      <PageHeader
        eyebrow="Sunday ritual"
        title="Weekly Review"
        sub="Ten honest minutes once a week is worth more than hours of unreflective study. Look back, learn, and choose next week’s focus."
      />

      {week === thisWeek && isSunday && <div className="mb-5 rounded-2xl bg-gold/15 px-4 py-3 text-sm font-medium">It’s Sunday: perfect time for this review. ✨</div>}

      <div className="mb-6 flex items-center justify-between gap-3">
        <button className="btn" onClick={() => setWeek(addDays(week, -7))}>
          <ChevronLeft size={16} /> Prev
        </button>
        <p className="text-center font-display text-xl font-semibold">
          {fmtDate(week)} – {fmtDate(addDays(week, 6))}
          {week === thisWeek && <span className="block text-xs font-sans font-medium text-gold">this week</span>}
        </p>
        <button className="btn" disabled={week >= thisWeek} onClick={() => setWeek(addDays(week, 7))}>
          Next <ChevronRight size={16} />
        </button>
      </div>

      <div className="stagger mb-8 grid grid-cols-3 gap-3 sm:gap-4">
        <Stat label="Tasks done" value={`${done}/${tasks.length}`} emoji="✅" />
        <Stat label="Focus" value={minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`} emoji="⏱️" />
        <Stat label="Active days" value={`${activeDays}/7`} emoji="🔥" />
      </div>

      <div className="card card-pad mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">How was this week overall?</p>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => update({ rating: n === entry.rating ? 0 : n })} className={`text-3xl leading-none transition hover:scale-110 ${n <= entry.rating ? "text-gold" : "text-line"}`} aria-label={`${n} star`}>
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {PROMPTS.map((p) => (
          <div key={p.id} className="card card-pad">
            <h2 className="mb-3 font-display text-xl font-semibold">
              {p.emoji} {p.title}
            </h2>
            <textarea className="input" rows={5} placeholder={p.placeholder} value={entry[p.id]} onChange={(e) => update({ [p.id]: e.target.value } as Partial<WeeklyEntry>)} />
          </div>
        ))}
      </div>
    </div>
  );
}
