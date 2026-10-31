"use client";

import { SUBJECTS, MOCK_TARGET, allTopics } from "@/data/exam";
import { pct, uid, todayStr, addDays } from "./utils";
import { setDoc, useDoc } from "./store";
import { SETTINGS_DEFAULT, pyqKey, topicKey } from "./types";
import type {
  FocusDoc,
  ImpDoc,
  ImpEntry,
  NoteEntry,
  NotesDoc,
  PhaseId,
  PlanDoc,
  PyqDoc,
  RevItem,
  Settings,
  TestRec,
  WeeklyDoc,
} from "./types";

/* Stable empty defaults (must be module-level so snapshots stay referentially stable). */
export const EMPTY_PYQ: PyqDoc = {};
export const EMPTY_NOTES: NotesDoc = {};
export const EMPTY_IMPDOC: ImpDoc = {};
export const EMPTY_TESTS: TestRec[] = [];
export const EMPTY_PLAN: PlanDoc = {};
export const EMPTY_REV: RevItem[] = [];
export const EMPTY_FOCUS: FocusDoc = {};
export const EMPTY_WEEKLY: WeeklyDoc = {};

export function pyqStats(phase: PhaseId, doc: PyqDoc, years: number[], opts?: { year?: number; subject?: string }) {
  let total = 0;
  let done = 0;
  for (const y of years) {
    if (opts?.year !== undefined && y !== opts.year) continue;
    for (const s of SUBJECTS[phase]) {
      if (opts?.subject && s.name !== opts.subject) continue;
      for (const t of s.topics) {
        total += 2;
        const e = doc[pyqKey(y, s.name, t)];
        if (e?.solved) done++;
        if (e?.noted) done++;
      }
    }
  }
  return { total, done, pct: pct(done, total) };
}

export function noteHas(e?: NoteEntry) {
  if (!e) return false;
  return Boolean(e.short.text.trim() || e.short.links.length || e.detailed.text.trim() || e.detailed.links.length);
}

export function impHas(e?: ImpEntry) {
  if (!e) return false;
  return e.concepts.length + e.tricks.length + e.mistakes.length > 0;
}

export function usePhaseProgress(phase: PhaseId) {
  const [settings] = useDoc<Settings>("settings", SETTINGS_DEFAULT);
  const [pyq] = useDoc<PyqDoc>(`pyq:${phase}`, EMPTY_PYQ);
  const [notes] = useDoc<NotesDoc>(`notes:${phase}`, EMPTY_NOTES);
  const [imp] = useDoc<ImpDoc>(`imp:${phase}`, EMPTY_IMPDOC);
  const [tests] = useDoc<TestRec[]>(`tests:${phase}`, EMPTY_TESTS);

  const topics = allTopics(phase);
  const p = pyqStats(phase, pyq, settings.years);
  const nDone = topics.filter((t) => noteHas(notes[topicKey(t.subject, t.topic)])).length;
  const iDone = topics.filter((t) => impHas(imp[topicKey(t.subject, t.topic)])).length;
  const target = MOCK_TARGET[phase];
  const tDone = Math.min(tests.length, target);

  const notesPct = pct(nDone, topics.length);
  const impPct = pct(iDone, topics.length);
  const testsPct = pct(tDone, target);

  return {
    pyq: p,
    notes: { done: nDone, total: topics.length, pct: notesPct },
    imp: { done: iDone, total: topics.length, pct: impPct },
    tests: { done: tDone, count: tests.length, total: target, pct: testsPct },
    overall: Math.round((p.pct + notesPct + impPct + testsPct) / 4),
  };
}

/** Add a topic to the spaced-repetition queue (no-op if already there). */
export function addToRevision(phase: PhaseId, subject: string, topic: string) {
  setDoc<RevItem[]>("revision", EMPTY_REV, (p) =>
    p.some((r) => r.phase === phase && r.subject === subject && r.topic === topic)
      ? p
      : [...p, { id: uid(), phase, subject, topic, start: todayStr(), step: 0 }]
  );
}

export function useActivity() {
  const [plan] = useDoc<PlanDoc>("plan", EMPTY_PLAN);
  const [focus] = useDoc<FocusDoc>("focus", EMPTY_FOCUS);

  const days: Record<string, number> = {};
  Object.entries(plan).forEach(([d, ts]) => {
    const n = ts.filter((t) => t.done).length;
    if (n) days[d] = (days[d] || 0) + n;
  });
  Object.entries(focus).forEach(([d, subs]) => {
    const m = Object.values(subs).reduce((a, b) => a + b, 0);
    if (m) days[d] = (days[d] || 0) + Math.max(1, Math.ceil(m / 30));
  });

  let current = 0;
  let d = todayStr();
  if (!days[d]) d = addDays(d, -1);
  while (days[d]) {
    current++;
    d = addDays(d, -1);
  }

  const keys = Object.keys(days).sort();
  let longest = 0;
  let run = 0;
  let prev = "";
  keys.forEach((k) => {
    run = prev && addDays(prev, 1) === k ? run + 1 : 1;
    if (run > longest) longest = run;
    prev = k;
  });

  return { days, current, longest, total: keys.length };
}

export function totalMinutes(focus: FocusDoc) {
  return Object.values(focus).reduce((a, subs) => a + Object.values(subs).reduce((x, y) => x + y, 0), 0);
}
