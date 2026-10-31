"use client";

import { useMemo, useState } from "react";
import { SUBJECTS, allTopics } from "@/data/exam";
import { useDoc } from "@/lib/store";
import { EMPTY_FOCUS, EMPTY_IMPDOC, EMPTY_NOTES, EMPTY_PYQ, EMPTY_TESTS, totalMinutes, useActivity } from "@/lib/progress";
import { FocusDoc, ImpDoc, NotesDoc, PhaseId, PyqDoc, SETTINGS_DEFAULT, Settings, TestRec, pyqKey, topicKey } from "@/lib/types";
import { fromStr, pct } from "@/lib/utils";
import { Bars, Heatmap, LineChart } from "@/components/Charts";
import { Empty, PageHeader, Stat, Tabs } from "@/components/ui";

const pctOf = (t: TestRec) => (t.max > 0 ? Math.max(0, Math.round((t.score / t.max) * 1000) / 10) : 0);
const shortDate = (s: string) => fromStr(s).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

type Weak = { subject: string; topic: string; score: number; why: string[] };

function useWeakAreas(phase: PhaseId): { weak: Weak[]; untouched: { subject: string; left: number; total: number }[] } {
  const [imp] = useDoc<ImpDoc>(`imp:${phase}`, EMPTY_IMPDOC);
  const [tests] = useDoc<TestRec[]>(`tests:${phase}`, EMPTY_TESTS);
  const [pyq] = useDoc<PyqDoc>(`pyq:${phase}`, EMPTY_PYQ);
  const [notes] = useDoc<NotesDoc>(`notes:${phase}`, EMPTY_NOTES);
  const [settings] = useDoc<Settings>("settings", SETTINGS_DEFAULT);

  return useMemo(() => {
    const topics = allTopics(phase);
    const map = new Map<string, Weak>();
    const get = (subject: string, topic: string) => {
      const k = topicKey(subject, topic);
      if (!map.has(k)) map.set(k, { subject, topic, score: 0, why: [] });
      return map.get(k) as Weak;
    };

    topics.forEach(({ subject, topic }) => {
      const e = imp[topicKey(subject, topic)];
      const n = (e?.mistakes ?? []).reduce((a, m) => a + (m.count || 1), 0);
      if (n > 0) {
        const w = get(subject, topic);
        w.score += n * 2;
        w.why.push(`${n} repeated mistake${n > 1 ? "s" : ""}`);
      }
    });

    tests.forEach((t) => {
      t.weak
        .split(",")
        .map((x) => x.trim().toLowerCase())
        .filter(Boolean)
        .forEach((needle) => {
          const hit = topics.find((x) => x.topic.toLowerCase().includes(needle) || needle.includes(x.topic.toLowerCase()));
          if (hit) {
            const w = get(hit.subject, hit.topic);
            w.score += 3;
            w.why.push(`flagged in “${t.name}”`);
          }
        });
    });

    const weak = Array.from(map.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    const untouched = SUBJECTS[phase].map((s) => {
      const left = s.topics.filter((t) => {
        const noted = settings.years.some((y) => pyq[pyqKey(y, s.name, t)]?.noted);
        const hasNotes = Boolean(notes[topicKey(s.name, t)]?.short.text || notes[topicKey(s.name, t)]?.detailed.text);
        return !noted && !hasNotes;
      }).length;
      return { subject: s.name, left, total: s.topics.length };
    });

    return { weak, untouched };
  }, [phase, imp, tests, pyq, notes, settings.years]);
}

export default function InsightsPage() {
  const [phase, setPhase] = useState<PhaseId>("prelims");
  const act = useActivity();
  const [focus] = useDoc<FocusDoc>("focus", EMPTY_FOCUS);
  const [settings] = useDoc<Settings>("settings", SETTINGS_DEFAULT);
  const [tests] = useDoc<TestRec[]>(`tests:${phase}`, EMPTY_TESTS);
  const { weak, untouched } = useWeakAreas(phase);

  const sorted = useMemo(() => tests.slice().sort((a, b) => a.date.localeCompare(b.date)), [tests]);
  const points = sorted.map((t) => ({ label: shortDate(t.date), value: pctOf(t) }));
  const avg = points.length ? Math.round(points.reduce((a, p) => a + p.value, 0) / points.length) : 0;
  const best = points.length ? Math.max(...points.map((p) => p.value)) : 0;
  const target = settings.target[phase];

  const secAgg: Record<string, { score: number; max: number }> = {};
  sorted.forEach((t) => Object.entries(t.sections).forEach(([k, v]) => {
    if (!v || !(v.max > 0)) return;
    secAgg[k] = { score: (secAgg[k]?.score || 0) + v.score, max: (secAgg[k]?.max || 0) + v.max };
  }));
  const sections = Object.entries(secAgg).map(([label, v]) => ({ label, value: pct(v.score, v.max), sub: `${pct(v.score, v.max)}% accuracy` }));

  const mins = totalMinutes(focus);

  return (
    <div>
      <PageHeader eyebrow="See the whole picture" title="Insights" sub="Your consistency, mock trends and weak spots in one place, so you always know where the next hour is best spent." />

      <div className="stagger mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat label="Current streak" value={`${act.current}d`} emoji="🔥" sub="days in a row" />
        <Stat label="Longest streak" value={`${act.longest}d`} emoji="🏔️" />
        <Stat label="Active days" value={act.total} emoji="📆" />
        <Stat label="Focus hours" value={Math.round((mins / 60) * 10) / 10} emoji="⏱️" sub="logged in timer" />
      </div>

      <div className="card card-pad mb-8">
        <h2 className="mb-4 font-display text-2xl font-semibold">Consistency</h2>
        <Heatmap days={act.days} />
        <p className="mt-3 text-xs text-muted">Each square is a day. Ticked tasks and focus sessions both count. Don’t break the chain.</p>
      </div>

      <div className="mb-5">
        <Tabs
          tabs={[
            { id: "prelims" as PhaseId, label: "Prelims", emoji: "🌅" },
            { id: "mains" as PhaseId, label: "Mains", emoji: "🔥" },
          ]}
          value={phase}
          onChange={setPhase}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card card-pad lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold">Mock scores over time</h2>
            <p className="text-sm text-muted">
              Average <b className="text-ink">{avg}%</b> · Best <b className="text-ink">{best}%</b> · Target <b className="text-rose">{target}%</b>
            </p>
          </div>
          {points.length === 0 ? <Empty emoji="📈" title="No tests logged yet" text="Add a test in Stage 4 and your trend line starts here." /> : <LineChart points={points} target={target} />}
        </div>

        <div className="card card-pad">
          <h2 className="mb-4 font-display text-2xl font-semibold">Section-wise accuracy</h2>
          {sections.length === 0 ? <p className="text-sm text-muted">Enter section scores when you log a test to see which sections carry you and which drag you down.</p> : <Bars items={sections} />}
        </div>

        <div className="card card-pad">
          <h2 className="mb-1 font-display text-2xl font-semibold">Weak areas</h2>
          <p className="mb-4 text-sm text-muted">Pulled from repeated mistakes and topics flagged in test reviews.</p>
          {weak.length === 0 ? (
            <p className="text-sm text-muted">Nothing flagged yet. Add “Repeated mistakes” in Stage 3 or weak topics in a test review.</p>
          ) : (
            <ol className="space-y-2.5">
              {weak.map((w, i) => (
                <li key={w.subject + w.topic} className="flex items-start gap-3 rounded-2xl border border-line bg-surface/70 px-3.5 py-2.5">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-rose/15 text-xs font-bold text-rose">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug">{w.topic}</p>
                    <p className="text-xs text-muted">
                      {w.subject} · {w.why.join(", ")}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="card card-pad lg:col-span-2">
          <h2 className="mb-1 font-display text-2xl font-semibold">Untouched topics</h2>
          <p className="mb-4 text-sm text-muted">Topics with no analysis or notes yet, by subject.</p>
          <Bars items={untouched.map((u) => ({ label: u.subject, value: pct(u.total - u.left, u.total), sub: `${u.left} of ${u.total} still untouched`, tone: "lilac" as const }))} />
        </div>
      </div>
    </div>
  );
}
