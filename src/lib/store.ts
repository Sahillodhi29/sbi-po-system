"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";
import { supabase } from "./supabase";

/**
 * Tiny offline-first store.
 * - Every "doc" is a JSON value under a string key.
 * - Reads/writes hit memory + localStorage instantly.
 * - When a Supabase user is attached, changed docs are upserted to `user_data`
 *   (debounced) and remote docs are pulled on login. Newest timestamp wins.
 */

const PREFIX = "sbipo:v1:";

type Listener = () => void;
export type Status = {
  local: boolean; // localStorage loaded
  pulled: boolean; // first cloud pull finished (or not needed)
  cloud: boolean; // logged in to Supabase
  syncing: boolean;
  error: string;
  lastSync: number;
};

const cache = new Map<string, unknown>();
const times = new Map<string, number>();
const dirty = new Set<string>();
const listeners = new Set<Listener>();

let status: Status = { local: false, pulled: false, cloud: false, syncing: false, error: "", lastSync: 0 };
let userId: string | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function emit() {
  listeners.forEach((l) => l());
}

function setStatus(p: Partial<Status>) {
  status = { ...status, ...p };
  emit();
}

function subscribe(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

function persistLocal(key: string) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ v: cache.get(key), t: times.get(key) ?? 0 }));
  } catch {
    /* storage full or blocked: cloud copy still works */
  }
}

export function loadLocal() {
  if (typeof window === "undefined" || status.local) return;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(PREFIX)) continue;
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as { v: unknown; t?: number };
      const key = k.slice(PREFIX.length);
      cache.set(key, parsed.v);
      times.set(key, parsed.t ?? 0);
    }
  } catch {
    /* ignore corrupt entries */
  }
  setStatus({ local: true });
}

function scheduleFlush(ms = 900) {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flush();
  }, ms);
}

export async function flush() {
  if (!supabase || !userId || dirty.size === 0) return;
  const keys = Array.from(dirty);
  const sent = new Map<string, number>();
  const rows = keys.map((key) => {
    const t = times.get(key) ?? Date.now();
    sent.set(key, t);
    return { user_id: userId as string, key, value: cache.get(key) ?? {}, t };
  });
  setStatus({ syncing: true });
  const { error } = await supabase.from("user_data").upsert(rows, { onConflict: "user_id,key" });
  if (error) {
    setStatus({ syncing: false, error: error.message });
    scheduleFlush(8000);
    return;
  }
  keys.forEach((k) => {
    if ((times.get(k) ?? 0) <= (sent.get(k) ?? 0)) dirty.delete(k);
  });
  setStatus({ syncing: false, error: "", lastSync: Date.now() });
  if (dirty.size) scheduleFlush();
}

export async function attachUser(id: string | null) {
  userId = id;
  if (!id || !supabase) {
    setStatus({ cloud: false, pulled: true });
    return;
  }
  setStatus({ cloud: true, syncing: true, error: "" });
  try {
    const { data, error } = await supabase.from("user_data").select("key,value,t");
    if (error) throw error;
    const remote = new Map<string, { value: unknown; t: number }>();
    (data ?? []).forEach((r) => remote.set(r.key as string, { value: r.value, t: Number(r.t) }));
    remote.forEach((r, key) => {
      const lt = times.get(key) ?? -1;
      if (!cache.has(key) || r.t > lt) {
        cache.set(key, r.value);
        times.set(key, r.t);
        persistLocal(key);
      } else if (lt > r.t) {
        dirty.add(key);
      }
    });
    cache.forEach((_v, key) => {
      if (!remote.has(key)) dirty.add(key);
    });
    setStatus({ pulled: true, syncing: false, lastSync: Date.now() });
    await flush();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Sync failed";
    setStatus({ pulled: true, syncing: false, error: msg });
  }
}

export function startSyncListeners() {
  if (typeof window === "undefined") return () => {};
  const onHide = () => {
    if (document.visibilityState === "hidden") void flush();
  };
  const onOnline = () => void flush();
  document.addEventListener("visibilitychange", onHide);
  window.addEventListener("online", onOnline);
  return () => {
    document.removeEventListener("visibilitychange", onHide);
    window.removeEventListener("online", onOnline);
  };
}

export function getDoc<T>(key: string, initial: T): T {
  return (cache.has(key) ? cache.get(key) : initial) as T;
}

export function setDoc<T>(key: string, initial: T, u: T | ((p: T) => T)) {
  const prev = (cache.has(key) ? cache.get(key) : initial) as T;
  const next = typeof u === "function" ? (u as (p: T) => T)(prev) : u;
  cache.set(key, next);
  times.set(key, Date.now());
  persistLocal(key);
  if (userId) {
    dirty.add(key);
    scheduleFlush();
  }
  emit();
}

export function useDoc<T>(key: string, initial: T): [T, (u: T | ((p: T) => T)) => void] {
  const init = useRef(initial).current;
  const value = useSyncExternalStore(
    subscribe,
    () => (cache.has(key) ? (cache.get(key) as T) : init),
    () => init
  );
  const set = useCallback((u: T | ((p: T) => T)) => setDoc<T>(key, init, u), [key, init]);
  return [value, set];
}

export function useStatus(): Status {
  return useSyncExternalStore(
    subscribe,
    () => status,
    () => status
  );
}

/* ---------- backup helpers ---------- */

export function exportAll(): string {
  const out: Record<string, unknown> = {};
  cache.forEach((v, k) => {
    out[k] = v;
  });
  return JSON.stringify({ app: "sbi-po-system", version: 1, exportedAt: new Date().toISOString(), docs: out }, null, 2);
}

export function importAll(json: string): number {
  const parsed = JSON.parse(json) as { docs?: Record<string, unknown> };
  const docs = parsed.docs;
  if (!docs || typeof docs !== "object") throw new Error("This doesn't look like a backup file.");
  let n = 0;
  Object.entries(docs).forEach(([k, v]) => {
    setDoc(k, v, v);
    n++;
  });
  return n;
}

export function wipeLocal() {
  try {
    const rm: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) rm.push(k);
    }
    rm.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* noop */
  }
  cache.clear();
  times.clear();
  dirty.clear();
  emit();
}
