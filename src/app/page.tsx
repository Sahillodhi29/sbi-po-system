"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Flame, Pencil, Plus, Trash2 } from "lucide-react";
import { useDoc } from "@/lib/store";
import { HOME_DEFAULT, HomeDoc, Dream, QUOTES } from "@/data/home";
import { SETTINGS_DEFAULT, Settings, PlanDoc } from "@/lib/types";
import { EMPTY_PLAN, useActivity, usePhaseProgress } from "@/lib/progress";
import { TONES, Tone } from "@/lib/tone";
import { cn, diffDays, fromStr, greeting, pct, todayStr, uid } from "@/lib/utils";
import { Field, Modal, ProgressRing } from "@/components/ui";

const TONE_LIST: Tone[] = ["gold", "rose", "lilac", "sage"];

export default function HomePage() {
  const [home, setHome] = useDoc<HomeDoc>("home", HOME_DEFAULT);
  const [settings] = useDoc<Settings>("settings", SETTINGS_DEFAULT);
  const [plan] = useDoc<PlanDoc>("plan", EMPTY_PLAN);
  const prelims = usePhaseProgress("prelims");
  const mains = usePhaseProgress("mains");
  const act = useActivity();

  const [editWhy, setEditWhy] = useState(false);
  const [editLetter, setEditLetter] = useState(false);
  const [dream, setDream] = useState<Dream | null>(null);
  const [newReason, setNewReason] = useState("");

  const today = todayStr();
  const daysLeft = diffDays(settings.examDate, today);
  const totalDays = Math.max(1, diffDays(settings.examDate, settings.startDate));
  const elapsedPct = Math.max(0, Math.min(100, pct(totalDays - Math.max(0, daysLeft), totalDays)));
  const todays = plan[today] ?? [];
  const doneToday = todays.filter((t) => t.done).length;
  const dayIndex = Math.floor(fromStr(today).getTime() / 86400000);
  const quote = QUOTES[dayIndex % QUOTES.length];

  function saveDream() {
    if (!dream || !dream.title.trim()) return;
    setHome((h) => {
      const exists = h.dreams.some((x) => x.id === dream.id);
      return { ...h, dreams: exists ? h.dreams.map((x) => (x.id === dream.id ? dream : x)) : [...h.dreams, dream] };
    });
    setDream(null);
  }

  return (
    <div className="space-y-14 sm:space-y-20">
      {/* HERO */}
      <section className="card relative overflow-hidden p-6 sm:p-12">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-rose/40 to-lilac/30 blur-3xl animate-floaty" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-gradient-to-tr from-gold/35 to-rose/20 blur-3xl animate-floaty" style={{ animationDelay: "2s" }} />
        <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow">{greeting()}, {settings.name}</p>
            <h1 className="h-display mt-3 text-5xl sm:text-7xl">
              The life I'm building,
              <br />
              <span className="bg-gradient-to-r from-gold via-rose to-lilac bg-clip-text text-transparent">one page at a time.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              State Bank of India · Probationary Officer. It's meant to be hard. That's why it's worth wearing the title.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/today" className="btn-gold">
                Open today's plan <ArrowRight size={16} />
              </Link>
              <Link href="/phase" className="btn">
                Go to my phases
              </Link>
            </div>
          </div>
          <Link href="/settings" className="mx-auto text-center" title="Change the exam date in Settings">
            <ProgressRing value={elapsedPct} size={168} stroke={12} label={String(Math.max(0, daysLeft))} sub="days to go" />
            <p className="mt-2 text-xs text-muted">{elapsedPct}% of the journey travelled</p>
          </Link>
        </div>
      </section>

      {/* WHY */}
      <section>
        <p className="eyebrow">My why</p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="card card-pad relative">
            <button className="btn-ghost absolute right-3 top-3 !p-2" onClick={() => setEditWhy(!editWhy)} aria-label="Edit">
              <Pencil size={15} />
            </button>
            {editWhy ? (
              <textarea className="input mt-6 min-h-[200px] font-display text-xl" value={home.why} onChange={(e) => setHome((h) => ({ ...h, why: e.target.value }))} />
            ) : (
              <p className="font-display text-2xl leading-snug sm:text-[1.9rem]">
                <span className="mr-1 text-5xl leading-none text-gold">“</span>
                {home.why}
              </p>
            )}
          </div>
          <div className="card card-pad">
            <p className="font-display text-2xl font-semibold">Reasons I won't forget</p>
            <ul className="mt-4 space-y-3">
              {home.reasons.map((r, i) => (
                <li key={i} className="group flex items-start gap-3 text-[15px] leading-snug">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-gold to-rose" />
                  <span className="flex-1">{r}</span>
                  <button className="opacity-0 transition group-hover:opacity-100 max-sm:opacity-60" onClick={() => setHome((h) => ({ ...h, reasons: h.reasons.filter((_, j) => j !== i) }))} aria-label="Remove reason">
                    <Trash2 size={14} className="text-muted hover:text-rose" />
                  </button>
                </li>
              ))}
            </ul>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!newReason.trim()) return;
                setHome((h) => ({ ...h, reasons: [...h.reasons, newReason.trim()] }));
                setNewReason("");
              }}
            >
              <input className="input" placeholder="Add a reason…" value={newReason} onChange={(e) => setNewReason(e.target.value)} />
              <button className="btn" aria-label="Add reason">
                <Plus size={16} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* LIFE AFTER */}
      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Life after SBI PO</p>
            <h2 className="h-display mt-2 text-4xl sm:text-5xl">This is what's waiting for me.</h2>
            <p className="mt-2 max-w-xl text-muted">Add your real photos and dreams: places, outfits, moments. Tap the pencil on any card.</p>
          </div>
          <button className="btn" onClick={() => setDream({ id: uid(), title: "", text: "", emoji: "✨", image: "", tone: "gold" })}>
            <Plus size={16} /> Add a dream
          </button>
        </div>
        <div className="stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {home.dreams.map((d) => (
            <article key={d.id} className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-glow">
              <div className={cn("relative h-44 overflow-hidden bg-gradient-to-br", TONES[d.tone].grad)}>
                {d.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={d.image} alt={d.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                ) : (
                  <div className="grid h-full place-items-center text-7xl animate-floaty">{d.emoji}</div>
                )}
                <button className="absolute right-3 top-3 rounded-full bg-surface/85 p-2 text-muted opacity-100 shadow-soft transition hover:text-ink sm:opacity-0 sm:group-hover:opacity-100" onClick={() => setDream({ ...d })} aria-label={`Edit ${d.title}`}>
                  <Pencil size={14} />
                </button>
              </div>
              <div className="p-5">
                <h3 className="font-display text-2xl font-semibold leading-tight">{d.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{d.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* PROGRESS */}
      <section>
        <p className="eyebrow">Proof I'm on my way</p>
        <h2 className="h-display mt-2 text-4xl sm:text-5xl">Every tick counts.</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/phase/prelims" className="card card-pad flex items-center gap-4 transition hover:shadow-glow">
            <ProgressRing value={prelims.overall} size={84} stroke={8} tone="rose" />
            <div>
              <p className="font-display text-xl font-semibold">Prelims</p>
              <p className="text-xs text-muted">overall progress</p>
            </div>
          </Link>
          <Link href="/phase/mains" className="card card-pad flex items-center gap-4 transition hover:shadow-glow">
            <ProgressRing value={mains.overall} size={84} stroke={8} tone="lilac" />
            <div>
              <p className="font-display text-xl font-semibold">Mains</p>
              <p className="text-xs text-muted">overall progress</p>
            </div>
          </Link>
          <Link href="/insights" className="card card-pad flex items-center gap-4 transition hover:shadow-glow">
            <div className="grid h-[84px] w-[84px] place-items-center rounded-full bg-gradient-to-br from-gold/20 to-rose/20">
              <Flame className="text-gold" size={34} />
            </div>
            <div>
              <p className="font-display text-3xl font-semibold leading-none">{act.current}</p>
              <p className="mt-1 text-xs text-muted">day streak · best {act.longest}</p>
            </div>
          </Link>
          <Link href="/today" className="card card-pad flex items-center gap-4 transition hover:shadow-glow">
            <ProgressRing value={pct(doneToday, todays.length)} size={84} stroke={8} tone="sage" label={`${doneToday}/${todays.length}`} />
            <div>
              <p className="font-display text-xl font-semibold">Today</p>
              <p className="text-xs text-muted">tasks done</p>
            </div>
          </Link>
        </div>
      </section>

      {/* TOUGH DAY KIT */}
      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="card card-pad relative">
          <p className="eyebrow">On days I don't feel like it</p>
          <button className="btn-ghost absolute right-3 top-3 !p-2" onClick={() => setEditLetter(!editLetter)} aria-label="Edit letter">
            <Pencil size={15} />
          </button>
          {editLetter ? (
            <textarea className="input mt-4 min-h-[240px]" value={home.letter} onChange={(e) => setHome((h) => ({ ...h, letter: e.target.value }))} />
          ) : (
            <p className="mt-4 whitespace-pre-line font-display text-xl leading-relaxed">{home.letter}</p>
          )}
        </div>
        <div className="card card-pad flex flex-col justify-between bg-gradient-to-br from-gold/10 via-surface to-rose/10">
          <div>
            <p className="eyebrow">The minimum day</p>
            <p className="mt-3 font-display text-3xl font-semibold leading-tight">Just ten minutes. That's the whole deal.</p>
            <p className="mt-3 text-sm text-muted">Starting is the hard part. Open one page, solve one question, read one entry. Anything more is a bonus.</p>
          </div>
          <div className="mt-6">
            <p className="font-display text-lg italic text-ink/80">“{quote}”</p>
            <Link href="/focus" className="btn-gold mt-4">
              Start a 10-minute sprint <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Modal open={dream !== null} onClose={() => setDream(null)} title={dream && home.dreams.some((x) => x.id === dream.id) ? "Edit dream" : "New dream"}>
        {dream && (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              saveDream();
            }}
          >
            <Field label="Title">
              <input className="input" value={dream.title} onChange={(e) => setDream({ ...dream, title: e.target.value })} placeholder="e.g. Santorini in spring" required />
            </Field>
            <Field label="Description">
              <textarea className="input" rows={3} value={dream.text} onChange={(e) => setDream({ ...dream, text: e.target.value })} placeholder="Make it vivid: what does it feel like?" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Emoji">
                <input className="input" value={dream.emoji} onChange={(e) => setDream({ ...dream, emoji: e.target.value })} />
              </Field>
              <Field label="Colour">
                <select className="input" value={dream.tone} onChange={(e) => setDream({ ...dream, tone: e.target.value as Tone })}>
                  {TONE_LIST.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Photo link (optional)" hint="Paste an image URL (Google Photos, Pinterest, Unsplash…). Leave blank for the dreamy gradient.">
              <input className="input" value={dream.image} onChange={(e) => setDream({ ...dream, image: e.target.value })} placeholder="https://…" />
            </Field>
            <div className="flex justify-between gap-2 pt-2">
              {home.dreams.some((x) => x.id === dream.id) ? (
                <button
                  type="button"
                  className="btn !text-rose"
                  onClick={() => {
                    setHome((h) => ({ ...h, dreams: h.dreams.filter((x) => x.id !== dream.id) }));
                    setDream(null);
                  }}
                >
                  <Trash2 size={15} /> Delete
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button type="button" className="btn" onClick={() => setDream(null)}>
                  Cancel
                </button>
                <button className="btn-gold">Save</button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
