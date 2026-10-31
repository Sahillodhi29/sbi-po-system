"use client";

import { Pause, Play, RotateCcw, Square } from "lucide-react";
import { SUBJECTS } from "@/data/exam";
import { useDoc } from "@/lib/store";
import { EMPTY_FOCUS, totalMinutes } from "@/lib/progress";
import { fmtClock, remainingMs, timer, useTimer } from "@/lib/timer";
import { FocusDoc } from "@/lib/types";
import { addDays, cn, todayStr } from "@/lib/utils";
import { Bars } from "@/components/Charts";
import { PageHeader, ProgressRing, Stat } from "@/components/ui";

const PRESETS: [number, number][] = [
  [25, 5],
  [50, 10],
  [90, 15],
];

const hrs = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`);

export default function FocusPage() {
  const t = useTimer();
  const [focus] = useDoc<FocusDoc>("focus", EMPTY_FOCUS);
  const today = todayStr();

  const total = (t.mode === "focus" ? t.focusMin : t.breakMin) * 60000;
  const left = remainingMs(t);
  const progress = total > 0 ? ((total - left) / total) * 100 : 0;

  const subjects = Array.from(new Set(["General", "Current Affairs", "Descriptive Writing", ...SUBJECTS.prelims.map((s) => s.name), ...SUBJECTS.mains.map((s) => s.name)]));

  const todayMin = Object.values(focus[today] || {}).reduce((a, b) => a + b, 0);
  const weekMin = [0, 1, 2, 3, 4, 5, 6].reduce((n, i) => n + Object.values(focus[addDays(today, -i)] || {}).reduce((a, b) => a + b, 0), 0);
  const allMin = totalMinutes(focus);

  const bySubject: Record<string, number> = {};
  Object.values(focus).forEach((subs) => Object.entries(subs).forEach(([s, m]) => (bySubject[s] = (bySubject[s] || 0) + m)));
  const ranked = Object.entries(bySubject).sort((a, b) => b[1] - a[1]);
  const maxM = ranked[0]?.[1] || 1;

  return (
    <div>
      <PageHeader eyebrow="Deep work" title="Focus Timer" sub="Pick what you are studying, start the clock, and every finished session is logged to that subject automatically." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="card card-pad flex flex-col items-center text-center">
          <p className="eyebrow mb-4">{t.mode === "focus" ? "Focus session" : "Break time"}</p>
          <ProgressRing value={progress} size={240} stroke={14} tone={t.mode === "focus" ? "gold" : "sage"} label={fmtClock(left)} sub={t.mode === "focus" ? t.subject : "rest your eyes"} />
          <div className="mt-6 flex items-center gap-3">
            {t.running ? (
              <button className="btn-gold !px-6" onClick={() => timer.pause()}>
                <Pause size={16} /> Pause
              </button>
            ) : (
              <button className="btn-gold !px-6" onClick={() => timer.start()}>
                <Play size={16} /> {left < total ? "Resume" : "Start"}
              </button>
            )}
            <button className="btn" onClick={() => timer.reset()} aria-label="Reset">
              <RotateCcw size={15} />
            </button>
            {t.mode === "focus" && (
              <button className="btn" onClick={() => timer.finishEarly()} title="Stop and log the time so far">
                <Square size={14} /> Finish &amp; log
              </button>
            )}
          </div>

          <div className="mt-7 w-full space-y-4 text-left">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">Studying</span>
              <select className="input" value={t.subject} onChange={(e) => timer.setSubject(e.target.value)}>
                {subjects.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <div>
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">Session length</span>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map(([f, b]) => (
                  <button key={f} disabled={t.running} onClick={() => timer.setDurations(f, b)} className={cn("chip", t.focusMin === f && "chip-on")}>
                    {f} / {b} min
                  </button>
                ))}
              </div>
            </div>
            <p className="text-center text-xs text-muted">Sessions completed this visit: {t.sessions}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Today" value={hrs(todayMin)} emoji="☀️" />
            <Stat label="7 days" value={hrs(weekMin)} emoji="📅" />
            <Stat label="All time" value={hrs(allMin)} emoji="⏳" />
          </div>
          <div className="card card-pad">
            <h2 className="mb-4 font-display text-2xl font-semibold">Hours by subject</h2>
            {ranked.length === 0 ? (
              <p className="text-sm text-muted">Complete a session and your subject-wise hours appear here.</p>
            ) : (
              <Bars items={ranked.map(([label, m]) => ({ label, value: (m / maxM) * 100, sub: hrs(m) }))} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
