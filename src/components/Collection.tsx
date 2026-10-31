"use client";

import { ReactNode, useMemo, useState } from "react";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { useDoc } from "@/lib/store";
import { cn, fmtDate, isUrl, todayStr, uid } from "@/lib/utils";
import { Empty, Field, Modal } from "./ui";

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "date" | "number" | "url" | "rating";
  options?: string[];
  placeholder?: string;
  required?: boolean;
  half?: boolean;
  rows?: number;
};

export type Row = { id: string; _t: number } & Record<string, string | number>;

type Props = {
  docKey: string;
  fields: FieldDef[];
  titleField: string;
  metaFields?: string[];
  badgeField?: string;
  filterField?: string;
  seed?: Record<string, string | number>[];
  addLabel?: string;
  emptyTitle: string;
  emptyText?: string;
  emptyEmoji?: string;
  sort?: { field: string; dir: "asc" | "desc" };
  intro?: ReactNode;
};

const NO_ROWS: Row[] = [];

function blank(fields: FieldDef[]): Row {
  const r: Row = { id: "", _t: 0 };
  fields.forEach((f) => {
    if (f.type === "select") r[f.name] = f.options?.[0] ?? "";
    else if (f.type === "date") r[f.name] = todayStr();
    else if (f.type === "rating") r[f.name] = 0;
    else r[f.name] = "";
  });
  return r;
}

function Stars({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n === value ? 0 : n)}
          className={cn("text-xl leading-none transition", n <= value ? "text-gold" : "text-line", onChange && "hover:scale-110")}
          aria-label={`${n} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function Collection(p: Props) {
  const seeded = useMemo<Row[]>(
    () => (p.seed ?? []).map((s, i) => ({ ...s, id: `seed${i}`, _t: -i }) as Row),
    [p.seed]
  );
  const [rows, setRows] = useDoc<Row[]>(p.docKey, seeded.length ? seeded : NO_ROWS);
  const [draft, setDraft] = useState<Row | null>(null);
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");

  const filterDef = p.fields.find((f) => f.name === p.filterField);

  const shown = useMemo(() => {
    let out = rows.slice();
    if (p.filterField && filter !== "All") out = out.filter((r) => r[p.filterField as string] === filter);
    if (q.trim()) {
      const needle = q.toLowerCase();
      out = out.filter((r) => Object.values(r).some((v) => typeof v === "string" && v.toLowerCase().includes(needle)));
    }
    if (p.sort) {
      const { field, dir } = p.sort;
      out.sort((a, b) => {
        const av = a[field] ?? "";
        const bv = b[field] ?? "";
        const c = av < bv ? -1 : av > bv ? 1 : 0;
        return dir === "asc" ? c : -c;
      });
    } else {
      out.sort((a, b) => b._t - a._t);
    }
    return out;
  }, [rows, filter, q, p.filterField, p.sort]);

  function save() {
    if (!draft) return;
    const missing = p.fields.some((f) => f.required && !String(draft[f.name] ?? "").trim());
    if (missing) return;
    if (draft.id) setRows((prev) => prev.map((r) => (r.id === draft.id ? draft : r)));
    else setRows((prev) => [...prev, { ...draft, id: uid(), _t: Date.now() }]);
    setDraft(null);
  }

  function remove(id: string) {
    if (typeof window !== "undefined" && !window.confirm("Delete this entry?")) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  const detailFields = p.fields.filter((f) => f.name !== p.titleField && !(p.metaFields ?? []).includes(f.name) && f.name !== p.badgeField);

  return (
    <section>
      {p.intro}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button className="btn-gold" onClick={() => setDraft(blank(p.fields))}>
          <Plus size={16} /> {p.addLabel ?? "Add"}
        </button>
        {rows.length > 4 && <input className="input !w-auto min-w-[180px] flex-1 sm:max-w-xs" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />}
        <span className="ml-auto text-sm text-muted">{rows.length} saved</span>
      </div>

      {filterDef?.options && (
        <div className="no-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
          {["All", ...filterDef.options].map((o) => (
            <button key={o} onClick={() => setFilter(o)} className={cn("chip whitespace-nowrap", filter === o && "chip-on")}>
              {o}
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <Empty emoji={p.emptyEmoji} title={p.emptyTitle} text={p.emptyText} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {shown.map((r) => (
            <article key={r.id} className="card card-pad fade-up">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {p.badgeField && r[p.badgeField] ? <span className="chip mb-2 !py-0.5 text-xs">{String(r[p.badgeField])}</span> : null}
                  <h3 className="font-display text-xl font-semibold leading-snug">{String(r[p.titleField] || "Untitled")}</h3>
                  {(p.metaFields ?? []).length > 0 && (
                    <p className="mt-1 text-xs text-muted">
                      {(p.metaFields ?? [])
                        .map((m) => {
                          const f = p.fields.find((x) => x.name === m);
                          const v = r[m];
                          if (v === "" || v === undefined) return "";
                          return f?.type === "date" ? fmtDate(String(v)) : String(v);
                        })
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-0.5">
                  <button className="btn-ghost !p-2" onClick={() => setDraft({ ...r })} aria-label="Edit">
                    <Pencil size={15} />
                  </button>
                  <button className="btn-ghost !p-2 hover:!text-rose" onClick={() => remove(r.id)} aria-label="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className="mt-3 space-y-3">
                {detailFields.map((f) => {
                  const v = r[f.name];
                  if (v === "" || v === undefined || v === 0) return null;
                  return (
                    <div key={f.name}>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{f.label}</p>
                      {f.type === "rating" ? (
                        <Stars value={Number(v)} />
                      ) : f.type === "url" || (typeof v === "string" && isUrl(v) && f.type === "text") ? (
                        <a href={String(v)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 break-all text-sm text-gold underline-offset-2 hover:underline">
                          <ExternalLink size={13} /> {String(v)}
                        </a>
                      ) : f.type === "date" ? (
                        <p className="text-sm">{fmtDate(String(v))}</p>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{String(v)}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={draft !== null} onClose={() => setDraft(null)} title={draft?.id ? "Edit entry" : p.addLabel ?? "Add"}>
        {draft && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
            className="grid grid-cols-2 gap-3"
          >
            {p.fields.map((f) => (
              <div key={f.name} className={f.half ? "col-span-1" : "col-span-2"}>
                <Field label={f.label + (f.required ? " *" : "")}>
                  {f.type === "textarea" ? (
                    <textarea className="input" rows={f.rows ?? 3} placeholder={f.placeholder} value={String(draft[f.name] ?? "")} onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })} />
                  ) : f.type === "select" ? (
                    <select className="input" value={String(draft[f.name] ?? "")} onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}>
                      {(f.options ?? []).map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "rating" ? (
                    <Stars value={Number(draft[f.name] || 0)} onChange={(n) => setDraft({ ...draft, [f.name]: n })} />
                  ) : (
                    <input
                      className="input"
                      type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                      placeholder={f.placeholder}
                      value={String(draft[f.name] ?? "")}
                      onChange={(e) => setDraft({ ...draft, [f.name]: f.type === "number" && e.target.value !== "" ? Number(e.target.value) : e.target.value })}
                    />
                  )}
                </Field>
              </div>
            ))}
            <div className="col-span-2 mt-2 flex justify-end gap-2">
              <button type="button" className="btn" onClick={() => setDraft(null)}>
                Cancel
              </button>
              <button type="submit" className="btn-gold">
                Save
              </button>
            </div>
          </form>
        )}
      </Modal>
    </section>
  );
}
