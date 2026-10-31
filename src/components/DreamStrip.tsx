"use client";

import Link from "next/link";
import { useDoc } from "@/lib/store";
import { HOME_DEFAULT, HomeDoc, QUOTES } from "@/data/home";
import { TONES } from "@/lib/tone";
import { cn, fromStr, todayStr } from "@/lib/utils";

/** Rotating "today's reason" shown on the Today page so the dream sits next to the checklist. */
export default function DreamStrip() {
  const [home] = useDoc<HomeDoc>("home", HOME_DEFAULT);
  const d = fromStr(todayStr());
  const dayIndex = Math.floor(d.getTime() / 86400000);
  const dreams = home.dreams;
  if (dreams.length === 0) return null;
  const dream = dreams[dayIndex % dreams.length];
  const quote = QUOTES[dayIndex % QUOTES.length];
  const tone = TONES[dream.tone];
  return (
    <Link href="/" className={cn("card relative block overflow-hidden p-5 transition hover:shadow-glow sm:p-6")}>
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-r opacity-80", tone.grad)} />
      <div className="relative flex items-center gap-4">
        {dream.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dream.image} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
        ) : (
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-surface/70 text-3xl">{dream.emoji}</div>
        )}
        <div className="min-w-0">
          <p className="eyebrow">Today I'm studying for</p>
          <p className="mt-1 font-display text-2xl font-semibold leading-tight">{dream.title}</p>
          <p className="mt-1 text-sm text-muted">{quote}</p>
        </div>
      </div>
    </Link>
  );
}
