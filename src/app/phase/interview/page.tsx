"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { DAF_PROMPTS, FINAL_MERIT, INTERVIEW_QUESTIONS, JOINING_DOCS, PHASE3, PSYCHOMETRIC_TIPS } from "@/data/exam";
import { useDoc } from "@/lib/store";
import { pct } from "@/lib/utils";
import Collection, { FieldDef } from "@/components/Collection";
import { Bar, Check, Tabs } from "@/components/ui";

type TabId = "overview" | "psychometric" | "ge" | "questions" | "knowledge" | "mock" | "daf" | "docs";

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "overview", label: "Overview", emoji: "🧭" },
  { id: "psychometric", label: "Psychometric", emoji: "🧩" },
  { id: "ge", label: "Group Exercise", emoji: "🗣️" },
  { id: "questions", label: "Question Bank", emoji: "❓" },
  { id: "knowledge", label: "SBI & Banking", emoji: "🏦" },
  { id: "mock", label: "Mock Interviews", emoji: "🎤" },
  { id: "daf", label: "DAF Notes", emoji: "📝" },
  { id: "docs", label: "Documents", emoji: "📁" },
];

const PSY_FIELDS: FieldDef[] = [
  { name: "name", label: "Test / practice", type: "text", required: true, placeholder: "e.g. Sample personality test #1" },
  { name: "date", label: "Date", type: "date", half: true },
  { name: "link", label: "Link (optional)", type: "url", half: true },
  { name: "takeaway", label: "What I noticed about my answers", type: "textarea" },
];

const GE_FIELDS: FieldDef[] = [
  { name: "topic", label: "Group exercise topic", type: "text", required: true, placeholder: "e.g. Should UPI transactions carry a fee?" },
  { name: "date", label: "Date", type: "date", half: true },
  { name: "role", label: "My role", type: "select", options: ["Initiator", "Contributor", "Mediator", "Summariser", "Listener"], half: true },
  { name: "contribution", label: "What I contributed", type: "textarea" },
  { name: "feedback", label: "Feedback I got", type: "textarea" },
  { name: "improve", label: "What to improve", type: "textarea" },
];

const Q_SEED = INTERVIEW_QUESTIONS.map((q) => ({ category: q.category, question: q.question, answer: "" }));
const Q_FIELDS: FieldDef[] = [
  { name: "question", label: "Question", type: "text", required: true },
  { name: "category", label: "Category", type: "select", options: ["About me", "Why banking", "Why SBI", "Why PO", "Situation", "Vision", "Banking", "DAF-based", "Current affairs", "Other"] },
  { name: "answer", label: "My answer (in my own words)", type: "textarea", rows: 5, placeholder: "Write it, then practise it aloud until it sounds natural, not memorised." },
];

const K_FIELDS: FieldDef[] = [
  { name: "title", label: "Topic", type: "text", required: true, placeholder: "e.g. SBI YONO, new scheme, latest results" },
  { name: "category", label: "Type", type: "select", options: ["SBI news", "SBI product", "SBI scheme", "SBI history", "Banking trend", "RBI policy", "Other"], half: true },
  { name: "date", label: "Date", type: "date", half: true },
  { name: "notes", label: "Key points", type: "textarea", rows: 4 },
  { name: "link", label: "Source (optional)", type: "url" },
];

const MOCK_FIELDS: FieldDef[] = [
  { name: "who", label: "Mock with", type: "text", required: true, placeholder: "Friend, mentor, coaching panel…" },
  { name: "date", label: "Date", type: "date", half: true },
  { name: "rating", label: "How did it feel?", type: "rating", half: true },
  { name: "right", label: "What went right", type: "textarea" },
  { name: "wrong", label: "What went wrong", type: "textarea" },
  { name: "questions", label: "Questions I struggled with", type: "textarea" },
  { name: "practice", label: "What to practise next", type: "textarea" },
];

function Overview() {
  const steps = [
    { n: "1", t: "Psychometric test", d: PHASE3.psychometric },
    { n: "2", t: "Group Exercise", d: `${PHASE3.ge} marks. Judged on clarity, listening, leadership and composure, not on shouting the loudest.` },
    { n: "3", t: "Personal Interview", d: `${PHASE3.interview} marks. Built on your DAF, banking knowledge and honest self-awareness.` },
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="card card-pad">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-gold to-rose font-display text-lg font-semibold text-white">{s.n}</span>
            <h3 className="mt-3 font-display text-2xl font-semibold">{s.t}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{s.d}</p>
          </div>
        ))}
      </div>
      <div className="card card-pad">
        <h3 className="font-display text-2xl font-semibold">How the final merit is built</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Mains is scaled to <b className="text-ink">{FINAL_MERIT.mains}</b> and Group Exercise + Interview ({PHASE3.total} marks) to <b className="text-ink">{FINAL_MERIT.phase3}</b>. Prelims marks do not count. A strong Phase 3 can move you
          up dozens of ranks, so start light preparation (reading, speaking, DAF) well before the Mains result.
        </p>
      </div>
      <div className="card card-pad">
        <h3 className="font-display text-2xl font-semibold">Start these now, not later</h3>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
          <li>Read one good newspaper editorial daily and form an opinion on it.</li>
          <li>Speak for 2 minutes on a random topic every day, and record it once a week.</li>
          <li>Write your “Tell me about yourself” and refine it monthly.</li>
          <li>Follow SBI news and RBI policy announcements.</li>
        </ul>
      </div>
    </div>
  );
}

function Psychometric() {
  return (
    <div>
      <div className="card card-pad mb-6">
        <h3 className="font-display text-2xl font-semibold">Approach</h3>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
          {PSYCHOMETRIC_TIPS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
      <Collection docKey="interview:psychometric" fields={PSY_FIELDS} titleField="name" metaFields={["date"]} addLabel="Log a practice test" emptyEmoji="🧩" emptyTitle="No practice logged" emptyText="Try a couple of sample personality tests close to the exam." />
    </div>
  );
}

function Daf() {
  const [daf, setDaf] = useDoc<Record<string, string>>("interview:daf", EMPTY_STR);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Everything on your DAF (Detailed Application Form) is fair game. Prepare an honest, confident answer for each.</p>
      {DAF_PROMPTS.map((p) => (
        <div key={p} className="card card-pad">
          <h3 className="mb-2 font-display text-lg font-semibold">{p}</h3>
          <textarea className="input" rows={3} placeholder="My notes…" value={daf[p] ?? ""} onChange={(e) => setDaf((prev) => ({ ...prev, [p]: e.target.value }))} />
        </div>
      ))}
    </div>
  );
}

const EMPTY_STR: Record<string, string> = {};
const EMPTY_BOOL: Record<string, boolean> = {};

function Docs() {
  const [done, setDone] = useDoc<Record<string, boolean>>("interview:docs", EMPTY_BOOL);
  const n = JOINING_DOCS.filter((d) => done[d]).length;
  return (
    <div>
      <div className="card card-pad mb-4">
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="font-display text-2xl font-semibold">Documents & joining checklist</h3>
          <span className="text-sm text-muted">
            {n}/{JOINING_DOCS.length}
          </span>
        </div>
        <Bar value={pct(n, JOINING_DOCS.length)} />
      </div>
      <ul className="space-y-2.5">
        {JOINING_DOCS.map((d) => (
          <li key={d} className="card flex items-center gap-3 px-4 py-3">
            <Check checked={!!done[d]} onChange={(v) => setDone((p) => ({ ...p, [d]: v }))} label={d} />
            <span className={done[d] ? "text-muted line-through" : ""}>{d}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function InterviewPage() {
  const [tab, setTab] = useState<TabId>("overview");
  return (
    <div>
      <Link href="/phase" className="btn-ghost -ml-3 mb-2">
        <ChevronLeft size={16} /> All phases
      </Link>
      <header className="mb-6">
        <p className="eyebrow">Phase 3</p>
        <h1 className="h-display mt-2 text-4xl sm:text-5xl">Interview & All</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">Psychometric, Group Exercise and Personal Interview: the stage where you become a person, not a score.</p>
      </header>
      <div className="mb-6">
        <Tabs tabs={TABS} value={tab} onChange={setTab} />
      </div>

      {tab === "overview" && <Overview />}
      {tab === "psychometric" && <Psychometric />}
      {tab === "ge" && <Collection docKey="interview:ge" fields={GE_FIELDS} titleField="topic" metaFields={["role", "date"]} addLabel="Log a group exercise" emptyEmoji="🗣️" emptyTitle="No group exercises yet" emptyText="Practise with friends or online groups and note what you contributed." />}
      {tab === "questions" && (
        <Collection docKey="interview:questions" fields={Q_FIELDS} titleField="question" badgeField="category" filterField="category" seed={Q_SEED} addLabel="Add a question" emptyEmoji="❓" emptyTitle="No questions" />
      )}
      {tab === "knowledge" && <Collection docKey="interview:knowledge" fields={K_FIELDS} titleField="title" badgeField="category" metaFields={["date"]} filterField="category" addLabel="Add knowledge" emptyEmoji="🏦" emptyTitle="Build your SBI & banking bank" emptyText="Recent SBI news, products, schemes, and RBI policy points an interviewer may ask about." />}
      {tab === "mock" && <Collection docKey="interview:mock" fields={MOCK_FIELDS} titleField="who" metaFields={["date"]} addLabel="Log a mock interview" emptyEmoji="🎤" emptyTitle="No mock interviews yet" emptyText="Each mock teaches more than a week of reading. Log what went right, what went wrong and what to fix." />}
      {tab === "daf" && <Daf />}
      {tab === "docs" && <Docs />}
    </div>
  );
}
