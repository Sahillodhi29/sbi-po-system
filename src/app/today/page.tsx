"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Flame, Plus, Repeat, Trash2 } from "lucide-react";
import { useDoc } from "@/lib/store";
import { FocusDoc, PlanDoc, REV_STEPS, RevItem, Task } from "@/lib/types";
import { EMPTY_FOCUS, EMPTY_PLAN, EMPTY_REV, useActivity } from "@/lib/progress";
import { TASK_TAGS } from "@/data/exam";
import { addDays, cn, fmtDate, greeting, pct, todayStr, uid } from "@/lib/utils";
import Calendar from "@/components/Calendar";
import DreamStrip from "@/components/DreamStrip";
import { Check, Empty, ProgressRing } from "@/components/ui";

const QUICK: { text: string; tag: string }[] = [
  { text: "Solve one PYQ set", tag: "PYQ" },
  { text: "Revise yesterday's notes", tag: "Revision" },
  { text: "Read today's current affairs", tag: "Current Affairs" },
  { text: "20 min typing practice", tag: "Writing" },
  { text: "One sectional test", tag: "Mock" },
  { text: "Write one descriptive answer", tag: "Writing" },
];

function TaskRow({ task, onToggle, onDelete, canToggle = true }: { task: Task; onToggle?: (v: boolean) => void; onDelete: () => void; canToggle?: boolean }) {
  return (
    <li className={cn("group flex items-center gap-3 rounded-2xl border border-line bg-surface/70 px-3.5 py-3 transition", task.done && "bg-sage/10")}>
      {canToggle && onToggle ? <Check checked={task.done} onChange={onToggle} label={`Mark "${task.text}" done`} /> : <span className="h-2 w-2 shrink-0 rounded-full bg-rose" />}
      <span className={cn("flex-1 text-[15px] leading-snug transition", task.done && "text-muted line-through decoration-gold/60")}>{task.text}</span>
      <span className="hidden rounded-full bg-gold/10 px-2.5 py-0.5 text-[11px] font-medium text-gold sm:inline">{task.tag}</span>
      <button onClick={onDelete} className="text-muted opacity-60 transition hover:text-rose hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100" aria-label="Delete task">
        <Trash2 size={15} />
      </button>
    </li>
  );
}

function AddForm({ onAdd, placeholder }: { onAdd: (text: string, tag: string) => void; placeholder: string }) {
  const [text, setText] = useState("");
  const [tag, setTag] = useState("Other");
  return (
    <form
      className="flex flex-wrap gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onAdd(text, tag);
        setText("");
      }}
    >
      <input className="input min-w-0 flex-1 basis-48" placeholder={placeholder} value={text} onChange={(e) => setText(e.target.value)} />
      <select className="input !w-auto" value={tag} onChange={(e) => setTag(e.target.value)} aria-label="Tag">
        {TASK_TAGS.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>
      <button className="btn-gold" aria-label="Add task">
        <Plus size={16} /> Add
      </button>
    </form>
  );
}

export default function TodayPage() {
  const [plan, setPlan] = useDoc<PlanDoc>("plan", EMPTY_PLAN);
  const [focus] = useDoc<FocusDoc>("focus", EMPTY_FOCUS);
  const [revs] = useDoc<RevItem[]>("revision", EMPTY_REV);
  const act = useActivity();

  const today = todayStr();
  const tomorrow = addDays(today, 1);
  const [planDate, setPlanDate] = useState(tomorrow);

  const todays = plan[today] ?? [];
  const doneCount = todays.filter((t) => t.done).length;
  const planned = plan[planDate] ?? [];
  const yesterdayLeft = (plan[addDays(today, -1)] ?? []).filter((t) => !t.done);
  const dueRevs = revs.filter((r) => r.step < REV_STEPS.length && addDays(r.start, REV_STEPS[r.step]) <= today).length;
  const minutesToday = Object.values(focus[today] ?? {}).reduce((a, b) => a + b, 0);

  const marks: Record<string, { total: number; done: number }> = {};
  Object.entries(plan).forEach(([d, ts]) => {
    marks[d] = { total: ts.length, done: ts.filter((t) => t.done).length };
  });

  const add = (date: string, text: string, tag: string) => {
    const t = text.trim();
    if (!t) return;
    setPlan((p) => ({ ...p, [date]: [...(p[date] ?? []), { id: uid(), text: t, done: false, tag }] }));
  };
  const toggle = (date: string, id: string, done: boolean) =>
    setPlan((p) => ({ ...p, [date]: (p[date] ?? []).map((t) => (t.id === id ? { ...t, done } : t)) }));
  const remove = (date: string, id: string) => setPlan((p) => ({ ...p, [date]: (p[date] ?? []).filter((t) => t.id !== id) }));
  const carryOver = () => {
    const y = addDays(today, -1);
    setPlan((p) => {
      const left = (p[y] ?? []).filter((t) => !t.done);
      return { ...p, [y]: (p[y] ?? []).filter((t) => t.done), [today]: [...(p[today] ?? []), ...left.map((t) => ({ ...t, id: uid() }))] };
    });
  };

  const message =
    todays.length === 0
      ? "Nothing planned yet. Add your first task below, or plan tomorrow tonight."
      : doneCount === todays.length
        ? "Day won. Rest well; tomorrow's plan is waiting."
        : doneCount === 0
          ? "Start with the smallest task. Momentum is everything."
          : `${todays.length - doneCount} to go. You're moving.`;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="eyebrow">{fmtDate(today, true)}</p>
          <h1 className="h-display mt-2 text-4xl sm:text-5xl">What's for Today</h1>
          <p className="mt-2 text-muted">
            {greeting()}. {message}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="flex items-center justify-end gap-1.5 font-display text-2xl font-semibold">
              <Flame size={20} className="text-gold" /> {act.current}
            </p>
            <p className="text-xs text-muted">day streak · {minutesToday} min focused</p>
          </div>
          <ProgressRing value={pct(doneCount, todays.length)} size={96} label={`${doneCount}/${todays.length}`} sub="done" />
        </div>
      </header>

      <DreamStrip />

      {dueRevs > 0 && (
        <Link href="/revision" className="card card-pad flex items-center gap-3 transition hover:shadow-glow">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-lilac/15 text-lilac">
            <Repeat size={18} />
          </span>
          <p className="flex-1 text-[15px]">
            <strong>{dueRevs}</strong> topic{dueRevs > 1 ? "s are" : " is"} due for revision today.
          </p>
          <ArrowRight size={16} className="text-muted" />
        </Link>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        {/* Checklist */}
        <section className="card card-pad">
          <h2 className="font-display text-2xl font-semibold">Today's checklist</h2>

          {yesterdayLeft.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-rose/10 px-4 py-3 text-sm">
              <span>
                {yesterdayLeft.length} unfinished task{yesterdayLeft.length > 1 ? "s" : ""} from yesterday.
              </span>
              <button className="btn !py-1.5 text-xs" onClick={carryOver}>
                Carry over to today
              </button>
            </div>
          )}

          <div className="mt-4">
            <AddForm onAdd={(t, tag) => add(today, t, tag)} placeholder="What will I do today?" />
          </div>

          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
            {QUICK.map((q) => (
              <button key={q.text} className="chip whitespace-nowrap text-xs" onClick={() => add(today, q.text, q.tag)}>
                + {q.text}
              </button>
            ))}
          </div>

          <ul className="mt-5 space-y-2.5">
            {todays.map((t) => (
              <TaskRow key={t.id} task={t} onToggle={(v) => toggle(today, t.id, v)} onDelete={() => remove(today, t.id)} />
            ))}
          </ul>
          {todays.length === 0 && (
            <div className="mt-5">
              <Empty emoji="🌤️" title="A clean slate" text="Plan one to three meaningful tasks. Small and done beats big and imagined." />
            </div>
          )}
        </section>

        {/* Calendar + schedule */}
        <div className="space-y-6">
          <section className="card card-pad">
            <Calendar selected={planDate} onSelect={setPlanDate} marks={marks} />
          </section>

          <section className="card card-pad">
            <p className="eyebrow">{planDate === tomorrow ? "Tomorrow" : fmtDate(planDate, true)}</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">{planDate === tomorrow ? "Schedule your tomorrow" : planDate === today ? "Today's tasks" : planDate > today ? "Plan ahead" : "Past day"}</h2>
            <p className="mt-1 text-sm text-muted">
              {planDate > today ? "These will appear in What's for Today when the day arrives." : "Tasks on this date."}
            </p>
            <div className="mt-4">
              <AddForm onAdd={(t, tag) => add(planDate, t, tag)} placeholder="Add a task for this day…" />
            </div>
            <ul className="mt-4 space-y-2.5">
              {planned.map((t) => (
                <TaskRow key={t.id} task={t} canToggle={planDate <= today} onToggle={(v) => toggle(planDate, t.id, v)} onDelete={() => remove(planDate, t.id)} />
              ))}
            </ul>
            {planned.length === 0 && <p className="mt-4 text-sm text-muted">Nothing here yet.</p>}
            {planDate !== tomorrow && (
              <button className="btn-ghost mt-3" onClick={() => setPlanDate(tomorrow)}>
                Jump to tomorrow
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
