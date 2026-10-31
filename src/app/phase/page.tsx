"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PHASE_META } from "@/data/exam";
import { usePhaseProgress } from "@/lib/progress";
import { TONES } from "@/lib/tone";
import { cn } from "@/lib/utils";
import { PageHeader, ProgressRing } from "@/components/ui";

function PhaseCard({ id, ring }: { id: "prelims" | "mains" | "interview"; ring?: number }) {
  const m = PHASE_META[id];
  const tone = TONES[m.tone];
  return (
    <Link href={`/phase/${id}`} className="card group relative block overflow-hidden p-6 transition duration-300 hover:-translate-y-1.5 hover:shadow-glow sm:p-7">
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70", tone.grad)} />
      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow">Phase {m.num}</p>
            <h2 className="h-display mt-2 text-4xl sm:text-5xl">{m.title}</h2>
          </div>
          {ring !== undefined ? <ProgressRing value={ring} size={84} stroke={8} tone={m.tone} /> : <span className="text-5xl">{m.emoji}</span>}
        </div>
        <p className="mt-4 flex-1 text-[15px] leading-relaxed text-muted">{m.tagline}</p>
        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted">{m.line}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold">
          Enter phase <ArrowRight size={16} className="transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export default function PhasePickerPage() {
  const prelims = usePhaseProgress("prelims");
  const mains = usePhaseProgress("mains");
  return (
    <div>
      <PageHeader eyebrow="Where the work happens" title="Choose a phase" sub="Each phase has its own syllabus, four stages and progress. Start with the one that needs you most today." />
      <div className="stagger grid gap-6 lg:grid-cols-3">
        <PhaseCard id="prelims" ring={prelims.overall} />
        <PhaseCard id="mains" ring={mains.overall} />
        <PhaseCard id="interview" />
      </div>
    </div>
  );
}
