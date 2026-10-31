"use client";

import { notFound } from "next/navigation";
import Collection, { FieldDef } from "@/components/Collection";
import { StageHeader, usePhase } from "@/components/Stage";

const FIELDS: FieldDef[] = [
  { name: "topic", label: "Topic / prompt", type: "text", required: true, placeholder: "e.g. Email to a branch manager about a delayed loan" },
  { name: "type", label: "Type", type: "select", options: ["Email", "Report", "Précis", "Situation Analysis", "Essay", "Letter"], half: true },
  { name: "status", label: "Status", type: "select", options: ["Planned", "Written", "Self-reviewed", "Feedback received", "Rewritten"], half: true },
  { name: "date", label: "Date", type: "date", half: true },
  { name: "minutes", label: "Minutes taken", type: "number", half: true },
  { name: "feedback", label: "Feedback / what went well", type: "textarea" },
  { name: "improve", label: "What to improve next time", type: "textarea" },
  { name: "link", label: "Link to my answer (optional)", type: "url", placeholder: "https://…" },
];

export default function WritingPage() {
  const phase = usePhase();
  if (phase !== "mains") notFound();
  return (
    <div>
      <StageHeader
        phase="mains"
        stage="★"
        title="Descriptive Writing"
        sub="The Mains descriptive paper is typed in 30 minutes. Track every practice piece so you can see your speed, structure and clarity improve."
      />
      <Collection
        docKey="writing:mains"
        fields={FIELDS}
        titleField="topic"
        badgeField="type"
        metaFields={["status", "date", "minutes"]}
        filterField="type"
        addLabel="Log a practice piece"
        emptyEmoji="✍️"
        emptyTitle="Nothing written yet"
        emptyText="Aim for two timed pieces a week to start: one email or report, one situation analysis."
      />
    </div>
  );
}
