"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import {
  BarChart3,
  CalendarCheck,
  Cloud,
  CloudOff,
  Home,
  Layers,
  LogOut,
  Map as MapIcon,
  MoreHorizontal,
  Moon,
  Newspaper,
  NotebookPen,
  Repeat,
  Settings as SettingsIcon,
  Sun,
  Timer as TimerIcon,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { hasSupabase, supabase } from "@/lib/supabase";
import { attachUser, loadLocal, startSyncListeners, useDoc, useStatus } from "@/lib/store";
import { SETTINGS_DEFAULT, Settings } from "@/lib/types";
import { fmtClock, remainingMs, useTimer } from "@/lib/timer";
import { cn, diffDays, todayStr } from "@/lib/utils";
import { Splash } from "./ui";

type NavItem = { href: string; label: string; short: string; icon: LucideIcon };

const NAV: NavItem[] = [
  { href: "/", label: "Home", short: "Home", icon: Home },
  { href: "/today", label: "What's for Today", short: "Today", icon: CalendarCheck },
  { href: "/roadmap", label: "Exam Roadmap", short: "Roadmap", icon: MapIcon },
  { href: "/phase", label: "Exam Phase", short: "Phases", icon: Layers },
  { href: "/revision", label: "Revision Queue", short: "Revise", icon: Repeat },
  { href: "/insights", label: "Insights", short: "Insights", icon: BarChart3 },
  { href: "/focus", label: "Focus Timer", short: "Focus", icon: TimerIcon },
  { href: "/weekly", label: "Weekly Review", short: "Weekly", icon: NotebookPen },
  { href: "/current-affairs", label: "Current Affairs", short: "Affairs", icon: Newspaper },
  { href: "/settings", label: "Settings", short: "Settings", icon: SettingsIcon },
];

const MOBILE_TABS = ["/", "/today", "/phase", "/revision"];

function useAuth() {
  const [state, setState] = useState<{ checked: boolean; userId: string | null; email: string }>({
    checked: !hasSupabase,
    userId: null,
    email: "",
  });
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setState({ checked: true, userId: data.session?.user.id ?? null, email: data.session?.user.email ?? "" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setState({ checked: true, userId: session?.user.id ?? null, email: session?.user.email ?? "" });
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return state;
}

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
  }, []);
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("sbipo:theme", next);
    } catch {
      /* ignore */
    }
  };
  return { theme, toggle };
}

function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setMsg("");
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setMsg(error.message);
      else if (!data.session) setMsg("Account created. Check your email to confirm it, then sign in.");
    }
    setBusy(false);
  }

  return (
    <div className="grid min-h-screen place-items-center px-5">
      <form onSubmit={submit} className="card w-full max-w-sm p-7 fade-up">
        <div className="mx-auto mb-5 h-12 w-12 rounded-full bg-gradient-to-br from-gold to-rose shadow-glow" />
        <p className="eyebrow text-center">SBI PO · The Plan</p>
        <h1 className="h-display mt-2 text-center text-4xl">{mode === "in" ? "Welcome back" : "Create your space"}</h1>
        <p className="mt-2 text-center text-sm text-muted">Your private system for becoming an officer.</p>
        <div className="mt-6 space-y-3">
          <input className="input" type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <input
            className="input"
            type="password"
            required
            minLength={6}
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "in" ? "current-password" : "new-password"}
          />
        </div>
        {msg && <p className="mt-3 rounded-2xl bg-rose/10 px-3 py-2 text-sm text-rose">{msg}</p>}
        <button className="btn-gold mt-5 w-full" disabled={busy}>
          {busy ? "One moment…" : mode === "in" ? "Sign in" : "Sign up"}
        </button>
        <button type="button" className="btn-ghost mt-2 w-full" onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? "First time? Create account" : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}

function SyncBadge() {
  const s = useStatus();
  let text = "Local mode";
  let hint = "Saved on this device only";
  let tone = "text-gold";
  if (s.cloud) {
    if (s.error) {
      text = "Sync issue";
      hint = s.error;
      tone = "text-rose";
    } else if (s.syncing) {
      text = "Syncing…";
      hint = "Saving to the cloud";
      tone = "text-muted";
    } else {
      text = "Synced";
      hint = "Saved to your account";
      tone = "text-sage";
    }
  }
  return (
    <div className="flex items-center gap-2 text-xs" title={hint}>
      {s.cloud && !s.error ? <Cloud size={14} className={tone} /> : <CloudOff size={14} className={tone} />}
      <span className={tone}>{text}</span>
    </div>
  );
}

function TimerPill() {
  const t = useTimer();
  if (!t.running) return null;
  return (
    <Link href="/focus" className="flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
      <TimerIcon size={13} />
      {t.mode === "focus" ? "Focus" : "Break"} {fmtClock(remainingMs(t))}
    </Link>
  );
}

export default function Shell({ children }: { children: ReactNode }) {
  const status = useStatus();
  const auth = useAuth();
  const path = usePathname();
  const { theme, toggle } = useTheme();
  const [more, setMore] = useState(false);
  const [settings] = useDoc<Settings>("settings", SETTINGS_DEFAULT);

  useEffect(() => {
    loadLocal();
    return startSyncListeners();
  }, []);

  useEffect(() => {
    if (auth.checked) void attachUser(auth.userId);
  }, [auth.checked, auth.userId]);

  useEffect(() => {
    setMore(false);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, [path]);

  if (!status.local || !auth.checked) return <Splash text="Opening your plan…" />;
  if (hasSupabase && !auth.userId) return <Login />;
  if (!status.pulled) return <Splash text="Syncing your plan…" />;

  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  const daysLeft = diffDays(settings.examDate, todayStr());

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
  }

  return (
    <div className="min-h-screen">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface/70 p-5 backdrop-blur-md lg:flex">
        <Link href="/" className="mb-7 flex items-center gap-3">
          <span className="h-10 w-10 rounded-full bg-gradient-to-br from-gold to-rose shadow-glow" />
          <span>
            <span className="block font-display text-xl font-semibold leading-none">SBI PO</span>
            <span className="text-[11px] uppercase tracking-[0.22em] text-muted">The Plan</span>
          </span>
        </Link>
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm transition",
                isActive(n.href) ? "bg-gold/15 font-semibold text-ink shadow-sm ring-1 ring-gold/30" : "text-muted hover:bg-ink/5 hover:text-ink"
              )}
            >
              <n.icon size={18} className={isActive(n.href) ? "text-gold" : ""} />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 space-y-3 border-t border-line pt-4">
          <div className="rounded-2xl bg-gradient-to-br from-gold/15 to-rose/15 p-3.5">
            <p className="font-display text-3xl font-semibold leading-none">{Math.max(0, daysLeft)}</p>
            <p className="mt-1 text-xs text-muted">days to go. You've got this.</p>
          </div>
          <TimerPill />
          <div className="flex items-center justify-between">
            <SyncBadge />
            <div className="flex items-center gap-1">
              <button onClick={toggle} className="btn-ghost !p-2" aria-label="Toggle theme">
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              {hasSupabase && (
                <button onClick={signOut} className="btn-ghost !p-2" aria-label="Sign out">
                  <LogOut size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        {/* mobile top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-bg/80 px-4 py-3 backdrop-blur-md lg:hidden">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="h-8 w-8 rounded-full bg-gradient-to-br from-gold to-rose" />
            <span className="font-display text-lg font-semibold">SBI PO · The Plan</span>
          </Link>
          <div className="flex items-center gap-2">
            <TimerPill />
            <span className="rounded-full bg-gold/15 px-2.5 py-1 text-xs font-semibold text-gold">{Math.max(0, daysLeft)}d</span>
            <button onClick={toggle} className="btn-ghost !p-2" aria-label="Toggle theme">
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pt-10 lg:pb-16">{children}</main>
      </div>

      {/* mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface/90 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        {NAV.filter((n) => MOBILE_TABS.includes(n.href)).map((n) => (
          <Link key={n.href} href={n.href} className={cn("flex flex-col items-center gap-0.5 py-2.5 text-[11px]", isActive(n.href) ? "font-semibold text-gold" : "text-muted")}>
            <n.icon size={20} />
            {n.short}
          </Link>
        ))}
        <button onClick={() => setMore(true)} className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] text-muted">
          <MoreHorizontal size={20} />
          More
        </button>
      </nav>

      {more && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setMore(false)} />
          <div className="card absolute inset-x-0 bottom-0 rounded-b-none bg-surface p-5 pb-8 fade-up">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold">Everything</h3>
              <button onClick={() => setMore(false)} className="btn-ghost" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className={cn("flex items-center gap-2.5 rounded-2xl border border-line px-3.5 py-3 text-sm", isActive(n.href) && "border-gold bg-gold/10 font-semibold")}>
                  <n.icon size={17} className="text-gold" />
                  {n.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <SyncBadge />
              {hasSupabase && (
                <button onClick={signOut} className="btn-ghost">
                  <LogOut size={15} /> Sign out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
