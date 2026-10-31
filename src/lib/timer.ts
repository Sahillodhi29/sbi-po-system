"use client";

import { useSyncExternalStore } from "react";
import { setDoc } from "./store";
import { todayStr } from "./utils";
import type { FocusDoc } from "./types";

export type TimerState = {
  mode: "focus" | "break";
  running: boolean;
  endsAt: number;
  remaining: number;
  subject: string;
  focusMin: number;
  breakMin: number;
  sessions: number;
  startedAt: number;
};

let state: TimerState = {
  mode: "focus",
  running: false,
  endsAt: 0,
  remaining: 25 * 60000,
  subject: "General",
  focusMin: 25,
  breakMin: 5,
  sessions: 0,
  startedAt: 0,
};

const subs = new Set<() => void>();
let iv: ReturnType<typeof setInterval> | null = null;

function emit() {
  subs.forEach((f) => f());
}

function patch(p: Partial<TimerState>) {
  state = { ...state, ...p };
  emit();
}

export function logFocus(subject: string, minutes: number) {
  if (minutes <= 0) return;
  const d = todayStr();
  setDoc<FocusDoc>("focus", {}, (p) => ({
    ...p,
    [d]: { ...(p[d] || {}), [subject]: ((p[d] || {})[subject] || 0) + minutes },
  }));
}

function beep() {
  try {
    const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
    const AC = w.AudioContext || w.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = 660;
    g.gain.value = 0.05;
    o.start();
    setTimeout(() => {
      o.stop();
      void ctx.close();
    }, 380);
  } catch {
    /* no audio */
  }
}

function stopTick() {
  if (iv) {
    clearInterval(iv);
    iv = null;
  }
}

function complete() {
  stopTick();
  beep();
  if (state.mode === "focus") {
    logFocus(state.subject, state.focusMin);
    const ms = state.breakMin * 60000;
    patch({ mode: "break", running: true, remaining: ms, endsAt: Date.now() + ms, sessions: state.sessions + 1, startedAt: 0 });
    startTick();
  } else {
    patch({ mode: "focus", running: false, remaining: state.focusMin * 60000, endsAt: 0 });
  }
}

function startTick() {
  if (iv) return;
  iv = setInterval(() => {
    if (state.running && Date.now() >= state.endsAt) complete();
    else patch({});
  }, 500);
}

export const timer = {
  start() {
    if (state.running) return;
    const now = Date.now();
    patch({
      running: true,
      endsAt: now + state.remaining,
      startedAt: state.mode === "focus" && !state.startedAt ? now : state.startedAt,
    });
    startTick();
  },
  pause() {
    if (!state.running) return;
    patch({ running: false, remaining: Math.max(0, state.endsAt - Date.now()) });
    stopTick();
  },
  reset() {
    stopTick();
    patch({
      running: false,
      remaining: (state.mode === "focus" ? state.focusMin : state.breakMin) * 60000,
      endsAt: 0,
      startedAt: 0,
    });
  },
  /** Stop now and log whatever focus time has elapsed. */
  finishEarly() {
    if (state.mode === "focus") {
      const total = state.focusMin * 60000;
      const rem = state.running ? Math.max(0, state.endsAt - Date.now()) : state.remaining;
      logFocus(state.subject, Math.floor((total - rem) / 60000));
    }
    stopTick();
    patch({ mode: "focus", running: false, remaining: state.focusMin * 60000, endsAt: 0, startedAt: 0 });
  },
  setSubject(s: string) {
    patch({ subject: s });
  },
  setDurations(focusMin: number, breakMin: number) {
    if (state.running) return;
    patch({
      focusMin,
      breakMin,
      remaining: (state.mode === "focus" ? focusMin : breakMin) * 60000,
    });
  },
};

export function useTimer(): TimerState {
  return useSyncExternalStore(
    (l) => {
      subs.add(l);
      return () => {
        subs.delete(l);
      };
    },
    () => state,
    () => state
  );
}

export function remainingMs(s: TimerState) {
  return s.running ? Math.max(0, s.endsAt - Date.now()) : s.remaining;
}

export function fmtClock(ms: number) {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
