"use client";

import { useState } from "react";
import { Check as CheckIcon } from "lucide-react";
import { SUBJECTS } from "@/data/exam";
import { useDoc } from "@/lib/store";
import { PyqDoc, PyqEntry, SETTINGS_DEFAULT, Settings, pyqKey } from "@/lib/types";
import { EMPTY_PYQ, addToRevision, pyqStats } from "@/lib/progress";
import { TONES } from "@/lib/tone";
import { cn, fmtDate } from "@/lib/utils";
import { Breadcrumb, Check, ProgressRing } from "@/components/ui";
import { StageHeader, scrollToPanel, usePhase } from "@/components/Stage";

const BLANK: PyqEntry = { solved: false, noted: false, analysis: "" };

export default function PyqPage() {
  const phase = usePhase();
  const [settings] = useDoc<Settings>("settings", SETTINGS_DEFAULT);
  const [doc, setDoc] = useDoc<PyqDoc>(`pyq:${phase}`, EMPTY_PYQ);
  const [year, setYear] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");

  const years = settings.years;
  const subjects = SUBJECTS[phase];
  const overall = pyqStats(phase, doc, years);
  const subj = subjects.find((s) => s.name === subject);

  const key = year && subject && topic ? pyqKey(year, subject, topic) : "";
  const entry = key ? doc[key] ?? BLANK : BLANK;

  function update(patch: Partial<PyqEntry>) {
    if (!key) return;
    setDoc((prev) => ({ ...prev, [key]: { ...(prev[key] ?? BLANK), ...patch, updatedAt: new Date().toISOString() } }));
  }

  return (
    <div>
      <StageHeader
        phase={phase}
        stage={1}
        title="PYQs Analysis"
        sub="Pick a year, then a subject, then a topic. Solve the questions, tick them off, and write down what you learned. Your analysis stays saved for every topic."
        ringValue={overall.pct}
        ringLabel={`${overall.done}/${overall.total}`}
      />

      {/* YEAR */}
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">1 · Choose a year</p>
      {years.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-sm text-muted">No years configured. Add them in Settings.</p>
      ) : (
        <div className="stagger grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {years.map((y) => {
            const st = pyqStats(phase, doc, years, { year: y });
            return (
              <button
                key={y}
                onClick={() => {
                  setYear(y);
                  setSubject("");
                  setTopic("");
                }}
                className={cn("card flex items-center gap-3 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-glow", year === y && "border-gold shadow-glow")}
              >
                <ProgressRing value={st.pct} size={52} stroke={6} label={`${st.pct}%`} />
                <div>
                  <p className="font-display text-2xl font-semibold leading-none">{y}</p>
                  <p className="mt-1 text-[11px] text-muted">
                    {st.done}/{st.total}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* SUBJECT */}
      {year !== null && (
        <div className="mt-8 fade-up">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">2 · Choose a subject</p>
          <div className="flex flex-wrap gap-2">
            {subjects.map((s) => {
              const st = pyqStats(phase, doc, years, { year, subject: s.name });
              return (
                <button
                  key={s.name}
                  onClick={() => {
                    setSubject(s.name);
                    setTopic("");
                  }}
                  className={cn("chip", subject === s.name && "chip-on")}
                >
                  <span className={cn("h-2 w-2 rounded-full", TONES[s.tone].solid)} />
                  {s.short}
                  <span className="text-xs text-muted">{st.pct}%</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TOPIC + PANEL */}
      {year !== null && subj && (
        <div className="mt-8 grid gap-6 fade-up lg:grid-cols-[340px_1fr]">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">3 · Choose a topic</p>
            <ul className="grid gap-2 sm:grid-cols-2 lg:max-h-[64vh] lg:grid-cols-1 lg:overflow-y-auto lg:pr-1">
              {subj.topics.map((t) => {
                const e = doc[pyqKey(year, subj.name, t)];
                return (
                  <li key={t}>
                    <button
                      onClick={() => {
                        setTopic(t);
                        scrollToPanel();
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left text-sm transition",
                        topic === t ? "border-gold bg-gold/10 font-semibold shadow-sm" : "border-line bg-surface/70 hover:border-gold/50"
                      )}
                    >
                      <span className="flex-1">{t}</span>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", e?.solved ? "bg-sage/20 text-sage" : "bg-line text-muted/70")} title="Solved">
                        S
                      </span>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", e?.noted ? "bg-gold/20 text-gold" : "bg-line text-muted/70")} title="Analysis noted">
                        A
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div id="topic-panel" className="scroll-mt-20">
            {topic ? (
              <section className="card card-pad fade-up">
                <Breadcrumb items={[{ label: String(year), onClick: () => setSubject("") }, { label: subj.short, onClick: () => setTopic("") }, { label: topic }]} />
                <h2 className="mt-3 font-display text-3xl font-semibold leading-tight">{topic}</h2>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <label className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-4 transition", entry.solved ? "border-sage/50 bg-sage/10" : "border-line bg-surface/70")}>
                    <Check checked={entry.solved} onChange={(v) => update({ solved: v })} size={30} label="PYQ questions solved" />
                    <span>
                      <span className="block font-semibold">PYQ questions solved</span>
                      <span className="text-xs text-muted">All {year} questions on this topic</span>
                    </span>
                  </label>
                  <label className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-4 transition", entry.noted ? "border-gold/50 bg-gold/10" : "border-line bg-surface/70")}>
                    <Check
                      checked={entry.noted}
                      onChange={(v) => {
                        update({ noted: v });
                        if (v) addToRevision(phase, subj.name, topic);
                      }}
                      size={30}
                      label="Analysis noted"
                    />
                    <span>
                      <span className="block font-semibold">Analysis noted</span>
                      <span className="text-xs text-muted">Ticking this adds the topic to your revision queue</span>
                    </span>
                  </label>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <label htmlFor="analysis" className="font-display text-xl font-semibold">
                      What did I analyze today?
                    </label>
                    {entry.updatedAt && (
                      <span className="flex items-center gap-1 text-xs text-sage">
                        <CheckIcon size={12} /> saved {fmtDate(entry.updatedAt.slice(0, 10))}
                      </span>
                    )}
                  </div>
                  <textarea
                    id="analysis"
                    className="input min-h-[190px] leading-relaxed"
                    placeholder={`Question types that appeared in ${year}, difficulty, traps, shortcuts, what to revisit…`}
                    value={entry.analysis}
                    onChange={(e) => update({ analysis: e.target.value })}
                  />
                  <p className="mt-2 text-xs text-muted">Saved automatically. This note belongs only to {year} · {subj.short} · {topic}.</p>
                </div>
              </section>
            ) : (
              <div className="rounded-3xl border border-dashed border-line px-6 py-14 text-center text-muted">Choose a topic to start analysing.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
