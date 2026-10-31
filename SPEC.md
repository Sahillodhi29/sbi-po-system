# SBI PO System: Project Spec

> Attach this file in any new chat so nothing has to be re-explained.
> Owner: a planner who wants to clear SBI PO. Target exam: **August 2027** (about 9 months of prep, going all in).
> Last updated: 30 Oct 2026.

## 1. Purpose

A personal, single-user website deployed on **Vercel** that acts as the complete SBI PO preparation system.
Two jobs:

1. **Keep the "why" alive.** The purpose of the journey must never be forgotten. On low-motivation days it should pull the user back, even for one small step.
2. **Remove the fog.** Always show what to do today, what is done, what is weak, and what is next.

Design mood: a mix of **elegant & premium** and **warm & dreamy** (ivory, blush, lilac and gold; serif headlines; soft gradients; light and dark themes). Mobile-first, because tasks are ticked off from a phone.

## 2. Data and storage (decided: Option B)

- **Supabase** (free tier): email + password login, one `user_data` table (key to JSON value), row-level security so only the owner reads or writes.
- Works **offline-first**: everything is also cached in the browser (localStorage) and syncs to Supabase when logged in. Without Supabase env vars the app runs in "local mode" with a banner.
- Data syncs across phone and laptop. Export / import JSON backup is available in Settings.

## 3. Mandatory pages (confirmed by the user)

### 3.1 Home
Beautiful and emotional. Shows **the reasons for doing this** and **life after clearing SBI PO**: respect, financial stability, affording the dreamed-of things, international trips at least twice a year, fashion and an amazing wardrobe, and more. Placeholders for photos and dreams are editable (the user will add real ones soon). Purpose: keeps the user moving on days they do not feel like studying.

### 3.2 What's for Today
- Beautiful tick-off checklist of today's SBI PO tasks.
- **Schedule your tomorrow** section: add tasks for tomorrow. When tomorrow arrives, those tasks automatically become "Today". The cycle repeats.
- A cute **calendar widget**.

### 3.3 Exam Roadmap
Beautifully designed full roadmap of the examination, plus a systematic **Exam Blueprint** and **subject weightage** for each phase: Prelims, Mains, and Group Exercise / Interview / Psychometric.

### 3.4 Exam Phase (most important page)
Opens with a "choose a phase" screen. Three phases, each with its own page:
- **Phase 1: Prelims**
- **Phase 2: Mains**
- **Phase 3: Interview and all**

#### Phase 1 (Prelims) and Phase 2 (Mains) pages (identical structure)
Full syllabus shown beautifully, then **Stages** as clickable buttons:

- **Stage 1: PYQs Analysis.** Pick a year (last five), then a subject, then a topic. Each topic has two checkboxes: **PYQ questions solved** and **Analysis noted**. Each topic also gets its own saved **"What did I analyze today?"** section (separate per topic, subject and year). A **progress ring** for the stage increases as boxes are ticked.
- **Stage 2: Notes.** Pick subject, then topic. Two sections: **Short Notes** and **Detailed Notes**. Each accepts text and links (video, PDF, anything). Everything saved.
- **Stage 3: Important Points** (confirmed interpretation). Pick subject, then topic. Three buckets: **Critical Concepts**, **Tricks**, **Things I Keep Forgetting / Repeated Mistakes**. Items can carry links. Everything saved.
- **Stage 4: Tests & Mocks.** Log each test: what it is about, date, score (and section scores). Each test has a review: **what went right, what went wrong, my mistakes, what I need practice on**.

Mains also has a bonus **Descriptive Writing tracker** (the Mains descriptive paper).

#### Phase 3 (Interview and all)
User had no fixed plan; the following was suggested and accepted: Psychometric prep, Group Exercise practice, Interview question bank, SBI and banking knowledge, Mock interview log with the same right/wrong review style, DAF notes, Documents and joining checklist.

## 4. Accepted extras ("ALL" were approved)

- Streak and consistency tracker (GitHub-style heatmap)
- Countdown to the exam + prep timeline
- "Why" shown on the Today page (rotating dream)
- Weak Areas dashboard (from repeated mistakes, mock reviews, untouched topics)
- Mock score analytics (score over time, section-wise accuracy, target line)
- Weekly review (Sunday page)
- Revision queue (spaced repetition at day 3, 7, 21)
- Study timer (Pomodoro) with hours logged per subject
- Current Affairs & Banking Awareness log
- Descriptive writing tracker (Mains)
- Dark and light themes

## 5. Exam facts used (verify each cycle)

Pattern used for the **2026 cycle** (Adv. CRPD/PO/2026-27/09: 1,500 vacancies; Prelims 1-2 Aug 2026; Mains 12 Sep 2026; Psychometric + GE + Interview Oct/Nov 2026):

- **Prelims (qualifying, 100 marks, 60 min, 20 min per section, no sectional cut-off):** English 40 Q / 40, Quant 30 Q / 30, Reasoning 30 Q / 30. Negative marking 0.25.
- **Mains objective (200 marks, 170 Q, 3 hr):** Reasoning & Computer Aptitude 40 Q / 60 / 50 min; Data Analysis & Interpretation 30 Q / 60 / 45 min; General/Economy/Banking Awareness 60 Q / 60 / 45 min; English 40 Q / 20 / 40 min. Negative marking 0.25.
- **Mains descriptive (30 marks, 30 min):** revised in 2026 to Email Writing, Report/Precis Writing and Situation Analysis (earlier years: Letter + Essay, 50 marks).
- **Phase 3:** Psychometric test (profiling) + Group Exercise 20 + Interview 30 = 50 marks.
- **Final merit:** Mains scaled to 75 + Phase 3 scaled to 25 = 100. Prelims marks are not counted.

Caveat: sources differ. The SBI careers page still shows an older table (Prelims 30/35/35, Mains 155 Q, Letter + Essay for 50 marks). **Always confirm against the official notification when the 2027 advertisement is out.** All of this data lives in `src/data/exam.ts` and is easy to edit.

## 6. Tech decisions

- Next.js 14 (App Router) + TypeScript + Tailwind CSS, deployed on Vercel.
- Supabase (auth + Postgres). SQL in `supabase/schema.sql`.
- No heavy UI libraries: lucide-react icons, hand-built SVG charts and rings.
- PYQ years default to 2026, 2025, 2024, 2023, 2022 (editable in the app).
- Target exam date default: 1 Aug 2027 (editable on Home).

## 7. Build order used

1. Design system + data layer
2. Home, Today, Roadmap
3. Phase picker + Prelims/Mains with four stages
4. Interview phase
5. Extras: Revision, Insights, Focus, Weekly, Current Affairs
