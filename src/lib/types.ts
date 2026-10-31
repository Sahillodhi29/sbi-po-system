export type PhaseId = "prelims" | "mains";

export type Settings = {
  name: string;
  examDate: string; // YYYY-MM-DD
  startDate: string; // YYYY-MM-DD
  years: number[]; // PYQ years
  target: { prelims: number; mains: number }; // target % in mocks
};

export const SETTINGS_DEFAULT: Settings = {
  name: "Future Officer",
  examDate: "2027-08-01",
  startDate: "2026-11-01",
  years: [2026, 2025, 2024, 2023, 2022],
  target: { prelims: 75, mains: 70 },
};

/* ---------- Stage 1: PYQ ---------- */
export type PyqEntry = { solved: boolean; noted: boolean; analysis: string; updatedAt?: string };
export type PyqDoc = Record<string, PyqEntry>;
export const pyqKey = (year: number, subject: string, topic: string) => `${year}|${subject}|${topic}`;

/* ---------- Stage 2: Notes ---------- */
export type LinkItem = { id: string; label: string; url: string };
export type NoteBlock = { text: string; links: LinkItem[] };
export type NoteEntry = { short: NoteBlock; detailed: NoteBlock };
export type NotesDoc = Record<string, NoteEntry>;
export const topicKey = (subject: string, topic: string) => `${subject}|${topic}`;
export const EMPTY_NOTE: NoteEntry = {
  short: { text: "", links: [] },
  detailed: { text: "", links: [] },
};

/* ---------- Stage 3: Important points ---------- */
export type ImpItem = { id: string; text: string; link?: string; count?: number; createdAt: string };
export type ImpEntry = { concepts: ImpItem[]; tricks: ImpItem[]; mistakes: ImpItem[] };
export type ImpDoc = Record<string, ImpEntry>;
export const EMPTY_IMP: ImpEntry = { concepts: [], tricks: [], mistakes: [] };

/* ---------- Stage 4: Tests ---------- */
export type TestRec = {
  id: string;
  name: string;
  kind: string;
  about: string;
  date: string;
  score: number;
  max: number;
  minutes?: number;
  sections: Record<string, { score: number; max: number }>;
  review: { right: string; wrong: string; mistakes: string; practice: string };
  weak: string; // comma separated weak topics
};

/* ---------- Today ---------- */
export type Task = { id: string; text: string; done: boolean; tag: string };
export type PlanDoc = Record<string, Task[]>;

/* ---------- Revision ---------- */
export type RevItem = { id: string; phase: PhaseId; subject: string; topic: string; start: string; step: number; last?: string };
export const REV_STEPS = [3, 7, 21];

/* ---------- Focus ---------- */
export type FocusDoc = Record<string, Record<string, number>>; // date -> subject -> minutes

/* ---------- Weekly ---------- */
export type WeeklyEntry = { worked: string; didnt: string; focus: string; wins: string; rating: number };
export type WeeklyDoc = Record<string, WeeklyEntry>;

export const EMPTY_OBJ = {} as Record<string, never>;
