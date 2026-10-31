"use client";

import { ChangeEvent, useState } from "react";
import { Download, LogOut, Plus, Upload, X } from "lucide-react";
import { exportAll, importAll, useDoc, useStatus, wipeLocal } from "@/lib/store";
import { SETTINGS_DEFAULT, Settings } from "@/lib/types";
import { hasSupabase, supabase } from "@/lib/supabase";
import { Field, PageHeader } from "@/components/ui";

export default function SettingsPage() {
  const [s, setS] = useDoc<Settings>("settings", SETTINGS_DEFAULT);
  const status = useStatus();
  const [year, setYear] = useState("");
  const [msg, setMsg] = useState("");

  function download() {
    const blob = new Blob([exportAll()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sbi-po-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg("Backup downloaded.");
  }

  function upload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const n = importAll(String(reader.result));
        setMsg(`Restored ${n} sections from the backup.`);
      } catch (err) {
        setMsg(err instanceof Error ? err.message : "Could not read that file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function addYear() {
    const y = Number(year);
    if (!y || y < 2000 || y > 2100 || s.years.includes(y)) return;
    setS((p) => ({ ...p, years: [...p.years, y].sort((a, b) => b - a) }));
    setYear("");
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Make it yours" title="Settings" sub="Dates, years, targets and backups." />

      <section className="card card-pad grid gap-4 sm:grid-cols-3">
        <Field label="Your name">
          <input className="input" value={s.name} onChange={(e) => setS((p) => ({ ...p, name: e.target.value }))} />
        </Field>
        <Field label="Target exam date" hint="Drives the countdown. Update when SBI announces dates.">
          <input className="input" type="date" value={s.examDate} onChange={(e) => setS((p) => ({ ...p, examDate: e.target.value }))} />
        </Field>
        <Field label="Prep start date">
          <input className="input" type="date" value={s.startDate} onChange={(e) => setS((p) => ({ ...p, startDate: e.target.value }))} />
        </Field>
      </section>

      <section className="card card-pad">
        <h2 className="font-display text-2xl font-semibold">PYQ years</h2>
        <p className="mt-1 text-sm text-muted">Years shown in Stage 1 (PYQ Analysis). Removing a year hides it; your saved analysis is kept.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {s.years.map((y) => (
            <span key={y} className="chip">
              {y}
              <button onClick={() => setS((p) => ({ ...p, years: p.years.filter((x) => x !== y) }))} aria-label={`Remove ${y}`} className="text-muted hover:text-rose">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
        <form
          className="mt-4 flex max-w-xs gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addYear();
          }}
        >
          <input className="input" inputMode="numeric" placeholder="Add a year, e.g. 2021" value={year} onChange={(e) => setYear(e.target.value)} />
          <button className="btn" aria-label="Add year">
            <Plus size={16} />
          </button>
        </form>
      </section>

      <section className="card card-pad grid gap-4 sm:grid-cols-2">
        <Field label="Prelims mock target (%)" hint="Shown as a target line on your score charts.">
          <input className="input" type="number" min={0} max={100} value={s.target.prelims} onChange={(e) => setS((p) => ({ ...p, target: { ...p.target, prelims: Number(e.target.value) } }))} />
        </Field>
        <Field label="Mains mock target (%)">
          <input className="input" type="number" min={0} max={100} value={s.target.mains} onChange={(e) => setS((p) => ({ ...p, target: { ...p.target, mains: Number(e.target.value) } }))} />
        </Field>
      </section>

      <section className="card card-pad">
        <h2 className="font-display text-2xl font-semibold">Backup</h2>
        <p className="mt-1 text-sm text-muted">Your data lives in your account and in this browser. A backup file is extra safety.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="btn" onClick={download}>
            <Download size={16} /> Export backup
          </button>
          <label className="btn cursor-pointer">
            <Upload size={16} /> Import backup
            <input type="file" accept="application/json" className="hidden" onChange={upload} />
          </label>
        </div>
        {msg && <p className="mt-3 text-sm text-sage">{msg}</p>}
      </section>

      <section className="card card-pad">
        <h2 className="font-display text-2xl font-semibold">Account & sync</h2>
        <p className="mt-1 text-sm text-muted">
          {hasSupabase ? (status.cloud ? "Signed in. Your plan syncs across devices." : "Not signed in.") : "Running in local mode: data is saved on this device only. Add your Supabase keys to enable sync across phone and laptop."}
        </p>
        {status.error && <p className="mt-2 text-sm text-rose">Sync problem: {status.error}</p>}
        <div className="mt-4 flex flex-wrap gap-3">
          {hasSupabase && (
            <button className="btn" onClick={() => supabase?.auth.signOut()}>
              <LogOut size={16} /> Sign out
            </button>
          )}
          <button
            className="btn !text-rose"
            onClick={() => {
              if (window.confirm("This clears the data stored in THIS browser. If you're signed in, it will re-download from your account. Continue?")) {
                wipeLocal();
                window.location.reload();
              }
            }}
          >
            Clear this device's cache
          </button>
        </div>
      </section>
    </div>
  );
}
