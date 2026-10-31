"use client";

import { useState } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { SUBJECTS } from "@/data/exam";
import { useDoc } from "@/lib/store";
import { EMPTY_REV } from "@/lib/progress";
import { PhaseId, REV_STEPS, RevItem } from "@/lib/types";
import { addDays, cn, diffDays, fmtDate, todayStr, uid } from "@/lib/utils";
import { Empty, Field, Modal, PageHeader, Stat } from "@/components/ui";

type WithDue = RevItem & { due: string | null };

function Row({ r, onDone, onReset, onDelete, today }: { r: WithDue; onDone?: () => void; onReset: () => void; onDelete: () => void; today: string }) {
  const late = r.due ? diffDays(today, r.due) : 0;
  return (
    <li className="card card-pad flex flex-wrap items-center gap-3 fade-up">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          {r.phase} · {r.subject}
        </p>
        <p className="font-display text-xl font-semibold leading-snug">{r.topic}</p>
        <p className="mt-1 text-xs text-muted">
          Round {Math.min(r.step + 1, REV_STEPS.length)} of {REV_STEPS.length}
          {r.due ? ` · due ${fmtDate(r.due)}` : " · fully revised 🎉"}
          {late > 0 ? ` · ${late} day${late > 1 ? "s" : ""} late` : ""}
        </p>
      </div>
      <div className="flex items-center gap-1">
        {onDone && (
          <button className="btn-gold" onClick={onDone}>
            Revised ✓
          </button>
        )}
        <button className="btn-ghost !p-2" onClick={onReset} aria-label="Forgot it, restart" title="Forgot it, restart the cycle">
          <RotateCcw size={15} />
        </button>
        <button className="btn-ghost !p-2 hover:!text-rose" onClick={onDelete} aria-label="Remove">
          <Trash2 size={15} />
        </button>
      </div>
    </li>
  );
}

export default function RevisionPage() {
  const [items, setItems] = useDoc<RevItem[]>("revision", EMPTY_REV);
  const today = todayStr();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<PhaseId>("prelims");
  const [subject, setSubject] = useState(SUBJECTS.prelims[0].name);
  const [topic, setTopic] = useState(SUBJECTS.prelims[0].topics[0]);

  const withDue: WithDue[] = items.map((r) => ({ ...r, due: r.step >= REV_STEPS.length ? null : addDays(r.start, REV_STEPS[r.step]) }));
  const due = withDue.filter((r) => r.due && r.due <= today).sort((a, b) => (a.due ?? "").localeCompare(b.due ?? ""));
  const upcoming = withDue.filter((r) => r.due && r.due > today).sort((a, b) => (a.due ?? "").localeCompare(b.due ?? ""));
  const mastered = withDue.filter((r) => !r.due);

  const markDone = (id: string) => setItems((p) => p.map((r) => (r.id === id ? { ...r, step: r.step + 1, last: today } : r)));
  const restart = (id: string) => setItems((p) => p.map((r) => (r.id === id ? { ...r, step: 0, start: today, last: undefined } : r)));
  const remove = (id: string) => setItems((p) => p.filter((r) => r.id !== id));

  function changePhase(p: PhaseId) {
    setPhase(p);
    setSubject(SUBJECTS[p][0].name);
    setTopic(SUBJECTS[p][0].topics[0]);
  }
  function changeSubject(s: string) {
    setSubject(s);
    setTopic(SUBJECTS[phase].find((x) => x.name === s)?.topics[0] ?? "");
  }
  function add() {
    if (!topic) return;
    setItems((p) => (p.some((r) => r.phase === phase && r.subject === subject && r.topic === topic) ? p : [...p, { id: uid(), phase, subject, topic, start: today, step: 0 }]));
    setOpen(false);
  }

  const topics = SUBJECTS[phase].find((s) => s.name === subject)?.topics ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Spaced repetition"
        title="Revision Queue"
        sub="Learning is easy to lose. Topics resurface on day 3, 7 and 21 after you learn them, so they move from short-term to long-term memory. Topics are added automatically when you tick “Analysis noted” in PYQ Analysis."
        right={
          <button className="btn-gold" onClick={() => setOpen(true)}>
            <Plus size={16} /> Add topic
          </button>
        }
      />

      <div className="stagger mb-8 grid grid-cols-3 gap-3 sm:gap-4">
        <Stat label="Due now" value={due.length} emoji="🔔" />
        <Stat label="Upcoming" value={upcoming.length} emoji="🗓️" />
        <Stat label="Mastered" value={mastered.length} emoji="🏅" />
      </div>

      <h2 className="mb-3 font-display text-2xl font-semibold">Due today{due.length ? "" : " · all clear"}</h2>
      {due.length === 0 ? (
        <Empty emoji="🌤️" title="Nothing due" text="Finish a PYQ topic analysis and it shows up here on day 3." />
      ) : (
        <ul className="space-y-3">
          {due.map((r) => (
            <Row key={r.id} r={r} today={today} onDone={() => markDone(r.id)} onReset={() => restart(r.id)} onDelete={() => remove(r.id)} />
          ))}
        </ul>
      )}

      {upcoming.length > 0 && (
        <>
          <h2 className="mb-3 mt-10 font-display text-2xl font-semibold">Coming up</h2>
          <ul className="space-y-3">
            {upcoming.map((r) => (
              <Row key={r.id} r={r} today={today} onReset={() => restart(r.id)} onDelete={() => remove(r.id)} />
            ))}
          </ul>
        </>
      )}

      {mastered.length > 0 && (
        <>
          <h2 className="mb-3 mt-10 font-display text-2xl font-semibold">Mastered</h2>
          <ul className="space-y-3 opacity-80">
            {mastered.map((r) => (
              <Row key={r.id} r={r} today={today} onReset={() => restart(r.id)} onDelete={() => remove(r.id)} />
            ))}
          </ul>
        </>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add a topic to revise">
        <div className="space-y-3">
          <div className="flex gap-2">
            {(["prelims", "mains"] as PhaseId[]).map((p) => (
              <button key={p} onClick={() => changePhase(p)} className={cn("chip capitalize", phase === p && "chip-on")}>
                {p}
              </button>
            ))}
          </div>
          <Field label="Subject">
            <select className="input" value={subject} onChange={(e) => changeSubject(e.target.value)}>
              {SUBJECTS[phase].map((s) => (
                <option key={s.name}>{s.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Topic">
            <select className="input" value={topic} onChange={(e) => setTopic(e.target.value)}>
              {topics.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <button className="btn" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="btn-gold" onClick={add}>
              Add to queue
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
