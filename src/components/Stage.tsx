"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { PHASE_META, SUBJECTS } from "@/data/exam";
import type { PhaseId } from "@/lib/types";
import { TONES } from "@/lib/tone";
import { cn } from "@/lib/utils";
import { ProgressRing } from "./ui";

export function usePhase(): PhaseId {
  const p = useParams<{ phase: string }>();
  const v = p?.phase;
  if (v !== "prelims" && v !== "mains") notFound();
  return v as PhaseId;
}

export function StageHeader({
  phase,
  stage,
  title,
  sub,
  ringValue,
  ringLabel,
}: {
  phase: PhaseId;
  stage: number | string;
  title: string;
  sub: string;
  ringValue?: number;
  ringLabel?: string;
}) {
  const meta = PHASE_META[phase];
  return (
    <div className="mb-7">
      <Link href={`/phase/${phase}`} className="btn-ghost -ml-3 mb-2">
        <ChevronLeft size={16} /> {meta.title}
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="eyebrow">
            {meta.title} · Stage {stage}
          </p>
          <h1 className="h-display mt-2 text-4xl sm:text-5xl">{title}</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">{sub}</p>
        </div>
        {ringValue !== undefined && <ProgressRing value={ringValue} size={108} tone={meta.tone} sub={ringLabel ?? "complete"} />}
      </header>
    </div>
  );
}

/** Subject chips + topic list. Used by Notes and Important Points. */
export function TopicPicker({
  phase,
  subject,
  topic,
  onSubject,
  onTopic,
  has,
}: {
  phase: PhaseId;
  subject: string;
  topic: string;
  onSubject: (s: string) => void;
  onTopic: (t: string) => void;
  has: (subject: string, topic: string) => boolean;
}) {
  const subjects = SUBJECTS[phase];
  const current = subjects.find((s) => s.name === subject);
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">1 · Choose a subject</p>
      <div className="flex flex-wrap gap-2">
        {subjects.map((s) => {
          const done = s.topics.filter((t) => has(s.name, t)).length;
          return (
            <button key={s.name} onClick={() => onSubject(s.name)} className={cn("chip", subject === s.name && "chip-on")}>
              <span className={cn("h-2 w-2 rounded-full", TONES[s.tone].solid)} />
              {s.short}
              <span className="text-xs text-muted">
                {done}/{s.topics.length}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-muted">2 · Choose a topic</p>
      {current ? (
        <ul className="grid gap-2 sm:grid-cols-2 lg:max-h-[62vh] lg:grid-cols-1 lg:overflow-y-auto lg:pr-1">
          {current.topics.map((t) => {
            const filled = has(current.name, t);
            return (
              <li key={t}>
                <button
                  onClick={() => onTopic(t)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left text-sm transition",
                    topic === t ? "border-gold bg-gold/10 font-semibold shadow-sm" : "border-line bg-surface/70 hover:border-gold/50"
                  )}
                >
                  <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px]", filled ? "border-sage bg-sage text-white" : "border-line text-transparent")}>✓</span>
                  <span className="flex-1">{t}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">Pick a subject to see its topics.</p>
      )}
    </div>
  );
}

export function scrollToPanel() {
  setTimeout(() => {
    if (typeof document === "undefined") return;
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    document.getElementById("topic-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 60);
}
