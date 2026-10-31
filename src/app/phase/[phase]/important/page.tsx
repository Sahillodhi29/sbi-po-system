"use client";

import { useState } from "react";
import { ExternalLink, Plus, Repeat, Trash2 } from "lucide-react";
import { SUBJECTS } from "@/data/exam";
import { useDoc } from "@/lib/store";
import { EMPTY_IMP, ImpDoc, ImpEntry, ImpItem, topicKey } from "@/lib/types";
import { EMPTY_IMPDOC, impHas, usePhaseProgress } from "@/lib/progress";
import { normalizeUrl, todayStr, uid } from "@/lib/utils";
import { Breadcrumb } from "@/components/ui";
import { StageHeader, TopicPicker, scrollToPanel, usePhase } from "@/components/Stage";

type Bucket = keyof ImpEntry;

const BUCKETS: { id: Bucket; emoji: string; title: string; hint: string; placeholder: string }[] = [
  { id: "concepts", emoji: "💡", title: "Critical Concepts", hint: "Ideas that everything else depends on.", placeholder: "A concept I must never forget…" },
  { id: "tricks", emoji: "⚡", title: "Tricks", hint: "Shortcuts and methods that save time.", placeholder: "A trick or shortcut…" },
  { id: "mistakes", emoji: "🔁", title: "Things I Keep Forgetting / Repeated Mistakes", hint: "Tap “again” each time you repeat one. These feed your Weak Areas.", placeholder: "A mistake I keep making…" },
];

function BucketCard({
  bucket,
  items,
  onAdd,
  onRemove,
  onAgain,
}: {
  bucket: (typeof BUCKETS)[number];
  items: ImpItem[];
  onAdd: (text: string, link: string) => void;
  onRemove: (id: string) => void;
  onAgain: (id: string) => void;
}) {
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  return (
    <section className="card card-pad">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-2xl font-semibold leading-tight">
          {bucket.emoji} {bucket.title}
        </h3>
        <span className="text-xs text-muted">{items.length}</span>
      </div>
      <p className="mt-0.5 text-xs text-muted">{bucket.hint}</p>

      <form
        className="mt-4 space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          onAdd(text.trim(), normalizeUrl(link));
          setText("");
          setLink("");
        }}
      >
        <textarea className="input" rows={2} placeholder={bucket.placeholder} value={text} onChange={(e) => setText(e.target.value)} />
        <div className="flex gap-2">
          <input className="input" placeholder="Link (optional): video, PDF, page…" value={link} onChange={(e) => setLink(e.target.value)} />
          <button className="btn-gold" aria-label={`Add to ${bucket.title}`}>
            <Plus size={16} /> Add
          </button>
        </div>
      </form>

      {items.length > 0 && (
        <ul className="mt-5 space-y-2.5">
          {items.map((it) => (
            <li key={it.id} className="group rounded-2xl border border-line bg-surface/70 p-3.5">
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{it.text}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                {it.link && (
                  <a href={it.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-gold hover:underline">
                    <ExternalLink size={12} /> open link
                  </a>
                )}
                {bucket.id === "mistakes" && (
                  <button onClick={() => onAgain(it.id)} className="inline-flex items-center gap-1 rounded-full bg-rose/10 px-2.5 py-1 font-semibold text-rose transition hover:bg-rose/20">
                    <Repeat size={12} /> again{it.count ? ` · ×${it.count}` : ""}
                  </button>
                )}
                <span className="ml-auto">{it.createdAt}</span>
                <button onClick={() => onRemove(it.id)} className="text-muted opacity-60 hover:text-rose hover:opacity-100" aria-label="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function ImportantPage() {
  const phase = usePhase();
  const subjects = SUBJECTS[phase];
  const [doc, setDoc] = useDoc<ImpDoc>(`imp:${phase}`, EMPTY_IMPDOC);
  const prog = usePhaseProgress(phase);
  const [subject, setSubject] = useState(subjects[0].name);
  const [topic, setTopic] = useState("");

  const key = topic ? topicKey(subject, topic) : "";
  const entry: ImpEntry = key ? doc[key] ?? EMPTY_IMP : EMPTY_IMP;

  function mutate(fn: (cur: ImpEntry) => ImpEntry) {
    if (!key) return;
    setDoc((prev) => ({ ...prev, [key]: fn(prev[key] ?? EMPTY_IMP) }));
  }

  return (
    <div>
      <StageHeader
        phase={phase}
        stage={3}
        title="Important Points"
        sub="The things worth keeping, topic by topic: critical concepts, tricks, and the mistakes you keep repeating. This is your revision gold."
        ringValue={prog.imp.pct}
        ringLabel={`${prog.imp.done}/${prog.imp.total}`}
      />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <TopicPicker
          phase={phase}
          subject={subject}
          topic={topic}
          onSubject={(s) => {
            setSubject(s);
            setTopic("");
          }}
          onTopic={(t) => {
            setTopic(t);
            scrollToPanel();
          }}
          has={(s, t) => impHas(doc[topicKey(s, t)])}
        />
        <div id="topic-panel" className="scroll-mt-20">
          {topic ? (
            <div className="space-y-5 fade-up">
              <div>
                <Breadcrumb items={[{ label: subject, onClick: () => setTopic("") }, { label: topic }]} />
                <h2 className="mt-2 font-display text-3xl font-semibold">{topic}</h2>
              </div>
              {BUCKETS.map((b) => (
                <BucketCard
                  key={b.id}
                  bucket={b}
                  items={entry[b.id]}
                  onAdd={(text, link) =>
                    mutate((cur) => ({ ...cur, [b.id]: [{ id: uid(), text, link: link || undefined, createdAt: todayStr() }, ...cur[b.id]] }))
                  }
                  onRemove={(id) => mutate((cur) => ({ ...cur, [b.id]: cur[b.id].filter((x) => x.id !== id) }))}
                  onAgain={(id) => mutate((cur) => ({ ...cur, [b.id]: cur[b.id].map((x) => (x.id === id ? { ...x, count: (x.count ?? 0) + 1 } : x)) }))}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-line px-6 py-14 text-center text-muted">Choose a topic to open its important points.</div>
          )}
        </div>
      </div>
    </div>
  );
}
