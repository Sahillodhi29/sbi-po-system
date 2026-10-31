"use client";

import { useState } from "react";
import { FileText, Link2, PlayCircle, Plus, Trash2 } from "lucide-react";
import { SUBJECTS } from "@/data/exam";
import { useDoc } from "@/lib/store";
import { EMPTY_NOTE, NoteBlock, NoteEntry, NotesDoc, topicKey } from "@/lib/types";
import { EMPTY_NOTES, noteHas, usePhaseProgress } from "@/lib/progress";
import { normalizeUrl, uid } from "@/lib/utils";
import { Breadcrumb } from "@/components/ui";
import { StageHeader, TopicPicker, scrollToPanel, usePhase } from "@/components/Stage";

function LinkIcon({ url }: { url: string }) {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be") || u.includes("vimeo")) return <PlayCircle size={16} className="text-rose" />;
  if (u.endsWith(".pdf") || u.includes("drive.google")) return <FileText size={16} className="text-lilac" />;
  return <Link2 size={16} className="text-gold" />;
}

function NoteSection({
  title,
  emoji,
  hint,
  block,
  onChange,
}: {
  title: string;
  emoji: string;
  hint: string;
  block: NoteBlock;
  onChange: (p: Partial<NoteBlock>) => void;
}) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  function add() {
    const u = normalizeUrl(url);
    if (!u) return;
    let l = label.trim();
    if (!l) {
      try {
        l = new URL(u).hostname.replace(/^www\./, "");
      } catch {
        l = "Link";
      }
    }
    onChange({ links: [...block.links, { id: uid(), label: l, url: u }] });
    setLabel("");
    setUrl("");
  }

  return (
    <section className="card card-pad">
      <h3 className="font-display text-2xl font-semibold">
        {emoji} {title}
      </h3>
      <p className="mt-0.5 text-xs text-muted">{hint}</p>
      <textarea className="input mt-4 min-h-[180px] leading-relaxed" placeholder="Type or paste your notes here…" value={block.text} onChange={(e) => onChange({ text: e.target.value })} />

      <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-muted">Links: videos, PDFs, anything</p>
      {block.links.length > 0 && (
        <ul className="mb-3 space-y-2">
          {block.links.map((l) => (
            <li key={l.id} className="flex items-center gap-2.5 rounded-2xl border border-line bg-surface/70 px-3 py-2">
              <LinkIcon url={l.url} />
              <a href={l.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-sm font-medium hover:text-gold hover:underline">
                {l.label}
              </a>
              <button onClick={() => onChange({ links: block.links.filter((x) => x.id !== l.id) })} className="text-muted hover:text-rose" aria-label="Remove link">
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <input className="input min-w-0 flex-1 basis-32" placeholder="Label (optional)" value={label} onChange={(e) => setLabel(e.target.value)} />
        <input className="input min-w-0 flex-[2] basis-48" placeholder="Paste a link…" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button className="btn" aria-label="Add link">
          <Plus size={16} />
        </button>
      </form>
    </section>
  );
}

export default function NotesPage() {
  const phase = usePhase();
  const subjects = SUBJECTS[phase];
  const [doc, setDoc] = useDoc<NotesDoc>(`notes:${phase}`, EMPTY_NOTES);
  const prog = usePhaseProgress(phase);
  const [subject, setSubject] = useState(subjects[0].name);
  const [topic, setTopic] = useState("");

  const key = topic ? topicKey(subject, topic) : "";
  const entry: NoteEntry = key ? doc[key] ?? EMPTY_NOTE : EMPTY_NOTE;

  function patch(kind: "short" | "detailed", p: Partial<NoteBlock>) {
    if (!key) return;
    setDoc((prev) => {
      const cur = prev[key] ?? EMPTY_NOTE;
      return { ...prev, [key]: { ...cur, [kind]: { ...cur[kind], ...p } } };
    });
  }

  return (
    <div>
      <StageHeader
        phase={phase}
        stage={2}
        title="Notes"
        sub="Pick a subject and topic, then keep Short Notes for quick revision and Detailed Notes for depth. Add links to videos, PDFs or anything useful. Everything is saved."
        ringValue={prog.notes.pct}
        ringLabel={`${prog.notes.done}/${prog.notes.total}`}
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
          has={(s, t) => noteHas(doc[topicKey(s, t)])}
        />
        <div id="topic-panel" className="scroll-mt-20">
          {topic ? (
            <div className="space-y-5 fade-up">
              <div>
                <Breadcrumb items={[{ label: subject, onClick: () => setTopic("") }, { label: topic }]} />
                <h2 className="mt-2 font-display text-3xl font-semibold">{topic}</h2>
              </div>
              <NoteSection title="Short Notes" emoji="⚡" hint="The 2-minute version: formulas, rules, one-liners." block={entry.short} onChange={(p) => patch("short", p)} />
              <NoteSection title="Detailed Notes" emoji="📚" hint="The full explanation, worked examples and edge cases." block={entry.detailed} onChange={(p) => patch("detailed", p)} />
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-line px-6 py-14 text-center text-muted">Choose a topic to open its notes.</div>
          )}
        </div>
      </div>
    </div>
  );
}
