"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { DESCRIPTIVE, FINAL_MERIT, JOURNEY, PHASE3, PREP_PLAN, SUBJECTS } from "@/data/exam";
import { TONES, Tone } from "@/lib/tone";
import { useDoc } from "@/lib/store";
import { SETTINGS_DEFAULT, Settings } from "@/lib/types";
import { cn, diffDays, fmtDate, pct, todayStr } from "@/lib/utils";
import { Bar, PageHeader } from "@/components/ui";

type Seg = { label: string; value: number; tone: Tone };

function Stack({ segs, unit = "marks" }: { segs: Seg[]; unit?: string }) {
  const total = segs.reduce((a, s) => a + s.value, 0);
  return (
    <div>
      <div className="flex h-9 overflow-hidden rounded-full border border-line">
        {segs.map((s) => (
          <div key={s.label} className={cn("grid place-items-center text-xs font-semibold text-white transition-all", TONES[s.tone].solid)} style={{ width: `${(s.value / total) * 100}%` }} title={`${s.label}: ${s.value} ${unit}`}>
            {s.value}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted">
        {segs.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5">
            <span className={cn("h-2.5 w-2.5 rounded-full", TONES[s.tone].solid)} />
            {s.label} · {pct(s.value, total)}%
          </span>
        ))}
      </div>
    </div>
  );
}

function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-[11px] uppercase tracking-wider text-muted">
            {head.map((h) => (
              <th key={h} className="py-2 pr-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line/60 last:border-0">
              {r.map((c, j) => (
                <td key={j} className={cn("py-2.5 pr-3", j === 0 && "font-medium", i === rows.length - 1 && rows[i][0] === "Total" && "font-semibold")}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function RoadmapPage() {
  const [settings] = useDoc<Settings>("settings", SETTINGS_DEFAULT);
  const today = todayStr();
  const daysLeft = diffDays(settings.examDate, today);

  const prelims = SUBJECTS.prelims;
  const mains = SUBJECTS.mains;
  const pTotal = prelims.reduce((a, s) => a + s.marks, 0);
  const mObj = mains.reduce((a, s) => a + s.marks, 0);

  return (
    <div className="space-y-14">
      <PageHeader
        eyebrow="The big picture"
        title="Exam Roadmap"
        sub={`From application to appointment letter. Your target: ${fmtDate(settings.examDate)} (${Math.max(0, daysLeft)} days from today).`}
      />

      {/* JOURNEY */}
      <section>
        <h2 className="h-display text-3xl sm:text-4xl">The journey</h2>
        <ol className="relative mt-6 space-y-5 border-l-2 border-dashed border-gold/40 pl-6 sm:pl-8">
          {JOURNEY.map((j, i) => (
            <li key={j.title} className="relative">
              <span className="absolute -left-[41px] top-1 grid h-8 w-8 place-items-center rounded-full border-2 border-gold bg-surface text-base sm:-left-[49px]">{j.emoji}</span>
              <div className="card card-pad">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-2xl font-semibold">
                    <span className="mr-2 text-gold">{i + 1}.</span>
                    {j.title}
                  </h3>
                  <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold">{j.when}</span>
                </div>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{j.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* BLUEPRINT */}
      <section>
        <p className="eyebrow">Exam blueprint</p>
        <h2 className="h-display mt-2 text-3xl sm:text-4xl">What each phase asks of me</h2>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="card card-pad">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold">🌅 Phase 1 · Prelims</h3>
              <span className="chip !py-0.5 text-xs">Qualifying only</span>
            </div>
            <p className="mt-1 text-sm text-muted">Online · 60 minutes (20 per section) · no sectional cut-off · 0.25 negative marking</p>
            <div className="mt-4">
              <Table head={["Section", "Qs", "Marks", "Time"]} rows={[...prelims.map((s) => [s.name, s.questions, s.marks, `${s.minutes} min`]), ["Total", prelims.reduce((a, s) => a + s.questions, 0), pTotal, "60 min"]]} />
            </div>
            <p className="mb-3 mt-5 text-xs font-semibold uppercase tracking-wider text-muted">Subject weightage</p>
            <Stack segs={prelims.map((s) => ({ label: s.short, value: s.marks, tone: s.tone }))} />
          </div>

          <div className="card card-pad">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold">🔥 Phase 2 · Mains</h3>
              <span className="chip !py-0.5 text-xs">75% of merit</span>
            </div>
            <p className="mt-1 text-sm text-muted">Online · 3 h objective + 30 min descriptive · 0.25 negative marking on objective</p>
            <div className="mt-4">
              <Table
                head={["Section", "Qs", "Marks", "Time"]}
                rows={[
                  ...mains.map((s) => [s.name, s.questions, s.marks, `${s.minutes} min`]),
                  ["Objective total", mains.reduce((a, s) => a + s.questions, 0), mObj, "3 hrs"],
                  ["Descriptive", DESCRIPTIVE.parts.length, DESCRIPTIVE.marks, `${DESCRIPTIVE.minutes} min`],
                ]}
              />
            </div>
            <p className="mb-3 mt-5 text-xs font-semibold uppercase tracking-wider text-muted">Subject weightage ({mObj + DESCRIPTIVE.marks} marks)</p>
            <Stack
              segs={[...mains.map((s) => ({ label: s.short, value: s.marks, tone: s.tone })), { label: "Descriptive", value: DESCRIPTIVE.marks, tone: "rose" as Tone }]}
            />
            <p className="mt-4 rounded-2xl bg-gold/10 px-4 py-3 text-sm text-muted">
              <strong className="text-ink">Descriptive:</strong> {DESCRIPTIVE.parts.join(" · ")}. {DESCRIPTIVE.note}
            </p>
          </div>

          <div className="card card-pad">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold">🎤 Phase 3 · Psychometric, GE & Interview</h3>
              <span className="chip !py-0.5 text-xs">25% of merit</span>
            </div>
            <p className="mt-1 text-sm text-muted">In person · {PHASE3.psychometric}.</p>
            <div className="mt-4">
              <Table head={["Component", "Marks"]} rows={[["Psychometric test", "Qualifying"], ["Group Exercise", PHASE3.ge], ["Personal Interview", PHASE3.interview], ["Total", PHASE3.total]]} />
            </div>
            <p className="mb-3 mt-5 text-xs font-semibold uppercase tracking-wider text-muted">Weightage</p>
            <Stack segs={[{ label: "Group Exercise", value: PHASE3.ge, tone: "gold" }, { label: "Interview", value: PHASE3.interview, tone: "sage" }]} />
          </div>

          <div className="card card-pad">
            <h3 className="font-display text-2xl font-semibold">🏆 Final merit</h3>
            <p className="mt-1 text-sm text-muted">Prelims marks are not counted. You must also qualify Mains and Phase 3 separately.</p>
            <div className="mt-5">
              <Stack
                unit="%"
                segs={[
                  { label: "Mains (scaled)", value: FINAL_MERIT.mains, tone: "lilac" },
                  { label: "Phase 3 (scaled)", value: FINAL_MERIT.phase3, tone: "gold" },
                ]}
              />
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted">
              Mains is three-quarters of the final score and Phase 3 is the last quarter. Prelims only opens the door, so aim to clear it comfortably, then build your edge in Mains and the interview.
            </p>
          </div>
        </div>

        <p className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-line px-4 py-3 text-xs text-muted">
          Pattern shown is the 2026 cycle (Adv. CRPD/PO/2026-27/09). Sources differ slightly and SBI can change it every year, so re-check the official notification when the 2027 advertisement is out.
          <a className="inline-flex items-center gap-1 text-gold hover:underline" href="https://sbi.bank.in/web/careers/probationary-officers" target="_blank" rel="noreferrer">
            SBI careers <ExternalLink size={12} />
          </a>
        </p>
      </section>

      {/* PREP TIMELINE */}
      <section>
        <p className="eyebrow">My 9-month plan</p>
        <h2 className="h-display mt-2 text-3xl sm:text-4xl">From foggy to formidable</h2>
        <div className="mt-6 space-y-4">
          {PREP_PLAN.map((b, i) => {
            const here = today >= b.start && today <= b.end;
            const past = today > b.end;
            const elapsed = past ? 100 : here ? pct(diffDays(today, b.start), Math.max(1, diffDays(b.end, b.start))) : 0;
            return (
              <article key={b.title} className={cn("card card-pad relative overflow-hidden", here && "shadow-glow ring-1 ring-gold/50")}>
                <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-r opacity-60", TONES[b.tone].grad)} />
                <div className="relative">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className={cn("grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-white", TONES[b.tone].solid)}>{i + 1}</span>
                      <div>
                        <h3 className="font-display text-2xl font-semibold leading-none">{b.title}</h3>
                        <p className="mt-1 text-xs text-muted">{b.months}</p>
                      </div>
                    </div>
                    {here && <span className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-white">You are here</span>}
                    {past && <span className="rounded-full bg-sage/20 px-3 py-1 text-xs font-semibold text-sage">Done</span>}
                  </div>
                  <p className="mt-3 font-display text-xl italic">{b.goal}</p>
                  <ul className="mt-3 grid gap-x-6 gap-y-1.5 text-sm text-muted sm:grid-cols-2">
                    {b.focus.map((f) => (
                      <li key={f} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Bar value={elapsed} className="mt-4" />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* METHOD */}
      <section className="card card-pad bg-gradient-to-br from-gold/10 via-surface to-lilac/10">
        <p className="eyebrow">The method</p>
        <h2 className="h-display mt-2 text-3xl sm:text-4xl">Four stages. Every topic. Zero fog.</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["1", "PYQ Analysis", "Learn what SBI actually asks."],
            ["2", "Notes", "Short and detailed notes you'll revisit."],
            ["3", "Important Points", "Concepts, tricks and repeated mistakes."],
            ["4", "Tests & Mocks", "Score, then review honestly."],
          ].map(([n, t, d]) => (
            <div key={n} className="rounded-2xl border border-line bg-surface/70 p-4">
              <p className="font-display text-3xl font-semibold text-gold">{n}</p>
              <p className="mt-1 font-semibold">{t}</p>
              <p className="mt-0.5 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
        <Link href="/phase" className="btn-gold mt-6">
          Choose a phase <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
