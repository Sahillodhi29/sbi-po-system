"use client";

import Collection, { FieldDef } from "@/components/Collection";
import { CA_CATEGORIES } from "@/data/exam";
import { PageHeader } from "@/components/ui";

const FIELDS: FieldDef[] = [
  { name: "headline", label: "Headline", type: "text", required: true, placeholder: "e.g. RBI keeps repo rate unchanged" },
  { name: "category", label: "Category", type: "select", options: CA_CATEGORIES, half: true },
  { name: "date", label: "Date", type: "date", half: true },
  { name: "details", label: "Key facts to remember", type: "textarea", rows: 4, placeholder: "Who, what, where, numbers, names, why it matters…" },
  { name: "link", label: "Source link (optional)", type: "url", placeholder: "https://…" },
];

export default function CurrentAffairsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Mains · General / Economy / Banking Awareness"
        title="Current Affairs & Banking"
        sub="60 questions in Mains come from awareness. Log what you read each day (RBI, schemes, appointments, awards) and revise by category before mocks."
      />
      <Collection
        docKey="ca:log"
        fields={FIELDS}
        titleField="headline"
        badgeField="category"
        metaFields={["date"]}
        filterField="category"
        sort={{ field: "date", dir: "desc" }}
        addLabel="Log a news item"
        emptyEmoji="📰"
        emptyTitle="No entries yet"
        emptyText="Start with 3–5 items a day from one reliable source, and keep the facts short."
      />
    </div>
  );
}
