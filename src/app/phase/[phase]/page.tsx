"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { DESCRIPTIVE, PHASE_META, SUBJECTS } from "@/data/exam";
import { usePhaseProgress } from "@/lib/progress";
import { TONES } from "@/lib/tone";
import { cn } from "@/lib/utils";
import { ProgressRing } from "@/components/ui";
import { usePhase } from "@/components/Stage";

export default function PhasePage() {
  const phase = usePhase();
  const meta = PHASE_META[phase];
  const prog = usePhaseProgress(phase);
  const subjects = SUBJECTS[phase];

  const stages = [
    { n: 1, href: "pyq", title: "PYQs Analysis", text: "Year → subject → topic. Solve, analyse, write down what you learned.", ring: prog.pyq.pct, line: `${prog.pyq.done}/${prog.pyq.total} checks`, emoji: "🔍" },
    { n: 2, href: "notes", title: "Notes", text: "Short and detailed notes, with links to videos and PDFs.", ring: prog.notes.pct, line: `${prog.notes.done}/${prog.notes.total} topics`, emoji: "📓" },
    { n: 3, href: "important", title: "Important Points", text: "Critical concepts, tricks and the mistakes you keep repeating.", ring: prog.imp.pct, line: `${prog.imp.done}/${prog.imp.total} topics`, emoji: "⭐" },
    { n: 4, href: "tests", title: "Tests & Mocks", text: "Log every test, then review what went right and wrong.", ring: prog.tests.pct, line: `${prog.tests.count} logged · goal ${prog.tests.total}`, emoji: "🎯" },
  ];

  return (
    <div className="space-y-12">
      <div>
        <Link href="/phase" className="btn-ghost -ml-3 mb-2">
          <ChevronLeft size={16} /> All phases
        </Link>
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="eyebrow">Phase {meta.num}</p>
            <h1 className="h-display mt-2 text-5xl sm:text-6xl">
              {meta.emoji} {meta.title}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{meta.tagline}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-gold">{meta.line}</p>
          </div>
          <ProgressRing value={prog.overall} size={120} stroke={10} tone={meta.tone} sub="overall" />
        </header>
      </div>

      {/* SYLLABUS */}
      <section>
        <p className="eyebrow">Full syllabus</p>
        <h2 className="h-display mt-2 text-3xl sm:text-4xl">What I need to know</h2>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {subjects.map((s) => (
            <article key={s.name} className="card card-pad relative overflow-hidden">
              <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-50", TONES[s.tone].grad)} />
              <div className="relative">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-2xl font-semibold">{s.name}</h3>
                  <span className="text-xs text-muted">
                    {s.questions} Qs · {s.marks} marks · {s.minutes} min
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {s.topics.map((t) => (
                    <span key={t} className="rounded-full border border-line bg-surface/80 px-3 py-1 text-[13px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
          {phase === "mains" && (
            <article className="card card-pad relative overflow-hidden">
              <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-50", TONES.rose.grad)} />
              <div className="relative">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-2xl font-semibold">Descriptive Test</h3>
                  <span className="text-xs text-muted">
                    {DESCRIPTIVE.marks} marks · {DESCRIPTIVE.minutes} min
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {DESCRIPTIVE.parts.map((t) => (
                    <span key={t} className="rounded-full border border-line bg-surface/80 px-3 py-1 text-[13px]">
                      {t}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted">{DESCRIPTIVE.note}</p>
              </div>
            </article>
          )}
        </div>
      </section>

      {/* STAGES */}
      <section>
        <p className="eyebrow">My method</p>
        <h2 className="h-display mt-2 text-3xl sm:text-4xl">Stages</h2>
        <p className="mt-2 text-muted">Work through them in order, or jump to whichever your day needs.</p>
        <div className="stagger mt-6 grid gap-5 sm:grid-cols-2">
          {stages.map((s) => (
            <Link key={s.n} href={`/phase/${phase}/${s.href}`} className="card group relative block overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:shadow-glow">
              <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60", TONES[meta.tone].grad)} />
              <div className="relative flex items-center gap-5">
                <ProgressRing value={s.ring} size={92} stroke={9} tone={meta.tone} />
                <div className="min-w-0 flex-1">
                  <p className="eyebrow">Stage {s.n}</p>
                  <h3 className="mt-1 font-display text-2xl font-semibold leading-tight">
                    {s.emoji} {s.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-snug text-muted">{s.text}</p>
                  <p className="mt-2 text-xs font-semibold text-gold">{s.line}</p>
                </div>
                <ArrowRight size={18} className="hidden shrink-0 text-muted transition group-hover:translate-x-1 group-hover:text-gold sm:block" />
              </div>
            </Link>
          ))}
          {phase === "mains" && (
            <Link href="/phase/mains/writing" className="card group relative block overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:shadow-glow sm:col-span-2">
              <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-r opacity-60", TONES.rose.grad)} />
              <div className="relative flex items-center gap-5">
                <span className="grid h-[92px] w-[92px] shrink-0 place-items-center rounded-full bg-surface/70 text-4xl">✍️</span>
                <div className="flex-1">
                  <p className="eyebrow">Bonus stage</p>
                  <h3 className="mt-1 font-display text-2xl font-semibold">Descriptive Writing Tracker</h3>
                  <p className="mt-1.5 text-sm text-muted">Log every email, report, précis and situation analysis you write, and what feedback you got.</p>
                </div>
                <ArrowRight size={18} className="hidden shrink-0 text-muted transition group-hover:translate-x-1 group-hover:text-gold sm:block" />
              </div>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
