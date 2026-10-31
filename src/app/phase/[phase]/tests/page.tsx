"use client";

import { useState } from "react";
import { ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import { SUBJECTS, TEST_KINDS } from "@/data/exam";
import { useDoc } from "@/lib/store";
import { SETTINGS_DEFAULT, Settings, TestRec } from "@/lib/types";
import { EMPTY_TESTS, usePhaseProgress } from "@/lib/progress";
import { TONES } from "@/lib/tone";
import { cn, fmtDate, fromStr, todayStr, uid } from "@/lib/utils";
import { Empty, Field, Modal, Stat } from "@/components/ui";
import { Bars, LineChart } from "@/components/Charts";
import { StageHeader, usePhase } from "@/components/Stage";

type Draft = {
  id: string;
  name: string;
  kind: string;
  about: string;
  date: string;
  score: string;
  max: string;
  minutes: string;
  sections: Record<string, { score: string; max: string }>;
  weak: string;
  review: TestRec["review"];
};

const REVIEW_FIELDS: { id: keyof TestRec["review"]; emoji: string; title: string; placeholder: string }[] = [
  { id: "right", emoji: "✅", title: "What went right", placeholder: "Sections that flowed, good decisions, strategies that worked…" },
  { id: "wrong", emoji: "⚠️", title: "What went wrong", placeholder: "Where time went, where accuracy dropped, what surprised me…" },
  { id: "mistakes", emoji: "🪞", title: "My mistakes", placeholder: "Specific errors: silly slips, concept gaps, misreads…" },
  { id: "practice", emoji: "🎯", title: "What I need to practise", placeholder: "Topics and question types to drill before the next test…" },
];

const pctOf = (t: TestRec) => (t.max > 0 ? Math.max(0, Math.round((t.score / t.max) * 1000) / 10) : 0);

export default function TestsPage() {
  const phase = usePhase();
  const subjects = SUBJECTS[phase];
  const [settings] = useDoc<Settings>("settings", SETTINGS_DEFAULT);
  const [tests, setTests] = useDoc<TestRec[]>(`tests:${phase}`, EMPTY_TESTS);
  const prog = usePhaseProgress(phase);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const defaultMax = phase === "prelims" ? "100" : "200";

  function blank(): Draft {
    const sections: Draft["sections"] = {};
    subjects.forEach((s) => (sections[s.name] = { score: "", max: String(s.marks) }));
    return { id: "", name: "", kind: TEST_KINDS[0], about: "", date: todayStr(), score: "", max: defaultMax, minutes: "", sections, weak: "", review: { right: "", wrong: "", mistakes: "", practice: "" } };
  }

  function toDraft(t: TestRec): Draft {
    const sections: Draft["sections"] = {};
    subjects.forEach((s) => {
      const x = t.sections[s.name];
      sections[s.name] = { score: x ? String(x.score) : "", max: x ? String(x.max) : String(s.marks) };
    });
    return { id: t.id, name: t.name, kind: t.kind, about: t.about, date: t.date, score: String(t.score), max: String(t.max), minutes: t.minutes ? String(t.minutes) : "", sections, weak: t.weak, review: t.review };
  }

  function save() {
    if (!draft || !draft.name.trim() || draft.score === "" || Number.isNaN(Number(draft.score))) return;
    const sections: TestRec["sections"] = {};
    Object.entries(draft.sections).forEach(([k, v]) => {
      if (v.score !== "" && !Number.isNaN(Number(v.score))) sections[k] = { score: Number(v.score), max: Number(v.max) || 0 };
    });
    const rec: TestRec = {
      id: draft.id || uid(),
      name: draft.name.trim(),
      kind: draft.kind,
      about: draft.about.trim(),
      date: draft.date,
      score: Number(draft.score),
      max: Number(draft.max) || Number(defaultMax),
      minutes: draft.minutes ? Number(draft.minutes) : undefined,
      sections,
      weak: draft.weak,
      review: draft.review,
    };
    setTests((prev) => (draft.id ? prev.map((t) => (t.id === rec.id ? rec : t)) : [...prev, rec]));
    setDraft(null);
    if (!draft.id) setOpen(rec.id);
  }

  function patchReview(id: string, field: keyof TestRec["review"], value: string) {
    setTests((prev) => prev.map((t) => (t.id === id ? { ...t, review: { ...t.review, [field]: value } } : t)));
  }

  const asc = [...tests].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const desc = [...asc].reverse();
  const pcts = asc.map(pctOf);
  const avg = pcts.length ? Math.round((pcts.reduce((a, b) => a + b, 0) / pcts.length) * 10) / 10 : 0;
  const best = pcts.length ? Math.max(...pcts) : 0;
  const last = pcts.length ? pcts[pcts.length - 1] : 0;
  const target = settings.target[phase];

  const sectionBars = subjects
    .map((s) => {
      const vals = tests.map((t) => t.sections[s.name]).filter((x) => x && x.max > 0).map((x) => Math.max(0, (x.score / x.max) * 100));
      if (!vals.length) return null;
      const a = Math.round(vals.reduce((x, y) => x + y, 0) / vals.length);
      return { label: s.short, value: a, sub: `${a}% avg · ${vals.length} test${vals.length > 1 ? "s" : ""}`, tone: s.tone };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <div>
      <StageHeader
        phase={phase}
        stage={4}
        title="Tests & Mocks"
        sub="Log every test you take, then review it honestly: what went right, what went wrong, your mistakes, and what to practise next."
        ringValue={prog.tests.pct}
        ringLabel={`${prog.tests.count}/${prog.tests.total}`}
      />

      {tests.length > 0 && (
        <div className="mb-8 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div className="card card-pad">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-display text-2xl font-semibold">Score trend</h2>
              <span className="text-xs text-muted">target {target}% · change in Settings</span>
            </div>
            <LineChart points={asc.map((t) => ({ label: fromStr(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }), value: pctOf(t) }))} target={target} tone={phase === "prelims" ? "rose" : "lilac"} />
          </div>
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
            <Stat label="Average" value={`${avg}%`} sub={`${tests.length} tests`} />
            <Stat label="Best" value={`${best}%`} />
            <Stat label="Latest" value={`${last}%`} sub={last >= target ? "above target 🎉" : `${Math.round((target - last) * 10) / 10}% to target`} />
          </div>
        </div>
      )}

      {sectionBars.length > 0 && (
        <div className="card card-pad mb-8">
          <h2 className="font-display text-2xl font-semibold">Section-wise accuracy</h2>
          <p className="mb-4 text-xs text-muted">Average score % per section, from tests where you logged section scores.</p>
          <Bars items={sectionBars} />
        </div>
      )}

      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="font-display text-3xl font-semibold">My tests</h2>
        <button className="btn-gold" onClick={() => setDraft(blank())}>
          <Plus size={16} /> Log a test
        </button>
      </div>

      {desc.length === 0 ? (
        <Empty emoji="🎯" title="No tests logged yet" text="After every mock, sectional or topic test, log the score here and write your review while it's fresh." />
      ) : (
        <div className="space-y-4">
          {desc.map((t) => {
            const p = pctOf(t);
            const isOpen = open === t.id;
            return (
              <article key={t.id} className={cn("card overflow-hidden", isOpen && "shadow-glow")}>
                <div className="flex items-center gap-4 p-5 sm:p-6">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-gold/20 to-rose/20 text-center">
                    <div>
                      <p className="font-display text-xl font-semibold leading-none">{p}%</p>
                      <p className="mt-0.5 text-[10px] text-muted">
                        {t.score}/{t.max}
                      </p>
                    </div>
                  </div>
                  <button className="min-w-0 flex-1 text-left" onClick={() => setOpen(isOpen ? null : t.id)}>
                    <span className="chip mb-1 !py-0 text-[11px]">{t.kind}</span>
                    <h3 className="font-display text-xl font-semibold leading-snug">{t.name}</h3>
                    <p className="text-xs text-muted">
                      {fmtDate(t.date)}
                      {t.minutes ? ` · ${t.minutes} min` : ""}
                      {t.about ? ` · ${t.about}` : ""}
                    </p>
                  </button>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button className="btn-ghost !p-2" onClick={() => setDraft(toDraft(t))} aria-label="Edit test">
                      <Pencil size={15} />
                    </button>
                    <button
                      className="btn-ghost !p-2 hover:!text-rose"
                      onClick={() => {
                        if (window.confirm(`Delete "${t.name}"?`)) setTests((prev) => prev.filter((x) => x.id !== t.id));
                      }}
                      aria-label="Delete test"
                    >
                      <Trash2 size={15} />
                    </button>
                    <button className="btn-ghost !p-2" onClick={() => setOpen(isOpen ? null : t.id)} aria-label="Toggle review">
                      <ChevronDown size={18} className={cn("transition", isOpen && "rotate-180")} />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-line bg-bg/40 p-5 sm:p-6">
                    {Object.keys(t.sections).length > 0 && (
                      <div className="mb-5 flex flex-wrap gap-2">
                        {subjects.map((s) => {
                          const x = t.sections[s.name];
                          if (!x) return null;
                          return (
                            <span key={s.name} className="chip text-xs">
                              <span className={cn("h-2 w-2 rounded-full", TONES[s.tone].solid)} />
                              {s.short}: {x.score}/{x.max}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <p className="mb-3 font-display text-xl font-semibold">Review</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      {REVIEW_FIELDS.map((f) => (
                        <Field key={f.id} label={`${f.emoji} ${f.title}`}>
                          <textarea className="input min-h-[110px]" placeholder={f.placeholder} value={t.review[f.id]} onChange={(e) => patchReview(t.id, f.id, e.target.value)} />
                        </Field>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Field label="Weak topics from this test" hint="Comma separated, e.g. Seating Arrangement, Caselet DI. These feed your Weak Areas dashboard.">
                        <input className="input" value={t.weak} onChange={(e) => setTests((prev) => prev.map((x) => (x.id === t.id ? { ...x, weak: e.target.value } : x)))} placeholder="Puzzles, Data Interpretation…" />
                      </Field>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <Modal open={draft !== null} onClose={() => setDraft(null)} title={draft?.id ? "Edit test" : "Log a test"}>
        {draft && (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <Field label="Test name *">
              <input className="input" required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Full Mock #7" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <select className="input" value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value })}>
                  {TEST_KINDS.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </Field>
              <Field label="Date">
                <input className="input" type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
              </Field>
            </div>
            <Field label="What's this test about?">
              <input className="input" value={draft.about} onChange={(e) => setDraft({ ...draft, about: e.target.value })} placeholder="e.g. Platform / series, topics covered" />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Score *">
                <input className="input" required type="number" step="any" value={draft.score} onChange={(e) => setDraft({ ...draft, score: e.target.value })} />
              </Field>
              <Field label="Out of">
                <input className="input" type="number" step="any" value={draft.max} onChange={(e) => setDraft({ ...draft, max: e.target.value })} />
              </Field>
              <Field label="Minutes">
                <input className="input" type="number" value={draft.minutes} onChange={(e) => setDraft({ ...draft, minutes: e.target.value })} />
              </Field>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">Section scores (optional)</p>
              <div className="space-y-2">
                {subjects.map((s) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm">{s.short}</span>
                    <input
                      className="input !w-20"
                      type="number"
                      step="any"
                      placeholder="score"
                      value={draft.sections[s.name]?.score ?? ""}
                      onChange={(e) => setDraft({ ...draft, sections: { ...draft.sections, [s.name]: { ...draft.sections[s.name], score: e.target.value } } })}
                    />
                    <span className="text-muted">/</span>
                    <input
                      className="input !w-20"
                      type="number"
                      step="any"
                      value={draft.sections[s.name]?.max ?? ""}
                      onChange={(e) => setDraft({ ...draft, sections: { ...draft.sections, [s.name]: { ...draft.sections[s.name], max: e.target.value } } })}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn" onClick={() => setDraft(null)}>
                Cancel
              </button>
              <button className="btn-gold">Save test</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
