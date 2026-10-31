import type { PhaseId } from "@/lib/types";
import type { Tone } from "@/lib/tone";

/**
 * Exam facts live here so they are easy to update each cycle.
 * Pattern below = SBI PO 2026 cycle (Adv. CRPD/PO/2026-27/09) as reported by multiple sources.
 * ALWAYS re-check against the official notification when the 2027 advertisement is released.
 */

export type Subject = {
  name: string;
  short: string;
  questions: number;
  marks: number;
  minutes: number;
  tone: Tone;
  topics: string[];
};

export const SUBJECTS: Record<PhaseId, Subject[]> = {
  prelims: [
    {
      name: "English Language",
      short: "English",
      questions: 40,
      marks: 40,
      minutes: 20,
      tone: "rose",
      topics: [
        "Reading Comprehension",
        "Cloze Test",
        "Para Jumbles",
        "Error Spotting",
        "Fill in the Blanks",
        "Phrase Replacement",
        "Sentence Improvement",
        "Word Swap & Misspelt Words",
        "Vocabulary (Synonyms & Antonyms)",
        "Idioms & Phrases",
        "Sentence Connectors",
      ],
    },
    {
      name: "Quantitative Aptitude",
      short: "Quant",
      questions: 30,
      marks: 30,
      minutes: 20,
      tone: "gold",
      topics: [
        "Simplification & Approximation",
        "Number Series",
        "Quadratic Equations",
        "Data Interpretation",
        "Percentage",
        "Ratio & Proportion",
        "Averages & Ages",
        "Profit & Loss",
        "Simple & Compound Interest",
        "Time & Work",
        "Time, Speed & Distance",
        "Mixtures & Alligation",
        "Partnership",
        "Mensuration",
        "Permutation, Combination & Probability",
        "Number System, HCF & LCM",
        "Data Sufficiency & Quantity Comparison",
      ],
    },
    {
      name: "Reasoning Ability",
      short: "Reasoning",
      questions: 30,
      marks: 30,
      minutes: 20,
      tone: "lilac",
      topics: [
        "Puzzles",
        "Seating Arrangement",
        "Syllogism",
        "Inequalities",
        "Blood Relations",
        "Direction Sense",
        "Coding–Decoding",
        "Order & Ranking",
        "Alphanumeric Series",
        "Input–Output",
        "Data Sufficiency",
        "Logical Reasoning",
      ],
    },
  ],
  mains: [
    {
      name: "Reasoning & Computer Aptitude",
      short: "Reasoning & Computers",
      questions: 40,
      marks: 60,
      minutes: 50,
      tone: "lilac",
      topics: [
        "High-level Puzzles",
        "Complex Seating Arrangement",
        "Syllogism",
        "Inequalities",
        "Input–Output & Machine Input",
        "Data Sufficiency",
        "Statement-based Logical Reasoning",
        "Coding–Decoding",
        "Blood Relations & Direction Sense",
        "Order & Ranking",
        "Computer Fundamentals & Generations",
        "Hardware & Software",
        "Operating Systems",
        "MS Office & Shortcuts",
        "Internet, Networking & Email",
        "Cyber Security & Malware",
        "DBMS & Number Systems",
        "Digital Banking Technology",
      ],
    },
    {
      name: "Data Analysis & Interpretation",
      short: "DI & Quant",
      questions: 30,
      marks: 60,
      minutes: 45,
      tone: "gold",
      topics: [
        "Tabular DI",
        "Bar Graph DI",
        "Line Graph DI",
        "Pie Chart DI",
        "Mixed Graph DI",
        "Caselet DI",
        "Missing Data DI",
        "Radar & Web Charts",
        "Data Sufficiency",
        "Quantity Comparison",
        "Simplification & Approximation",
        "Number Series",
        "Quadratic Equations",
        "Arithmetic Word Problems",
        "Mensuration",
        "Permutation, Combination & Probability",
      ],
    },
    {
      name: "General / Economy / Banking Awareness",
      short: "GA & Banking",
      questions: 60,
      marks: 60,
      minutes: 45,
      tone: "sage",
      topics: [
        "Current Affairs: National",
        "Current Affairs: International",
        "Appointments, Awards & Honours",
        "Sports, Books & Authors",
        "RBI & Monetary Policy",
        "Banking Structure & History",
        "Banking Terms & Products",
        "Financial Inclusion & Government Schemes",
        "Digital Payments & Fintech",
        "Indian Economy Basics",
        "Union Budget & Economic Survey",
        "Insurance, Capital Market & Mutual Funds",
        "Static GK",
        "International Organisations & Summits",
        "Science & Technology",
        "SBI-specific Knowledge",
      ],
    },
    {
      name: "English Language",
      short: "English",
      questions: 40,
      marks: 20,
      minutes: 40,
      tone: "rose",
      topics: [
        "Reading Comprehension",
        "Cloze Test",
        "Para Jumbles",
        "Error Spotting",
        "Fill in the Blanks",
        "Phrase Replacement",
        "Para Completion & Inference",
        "Sentence Rearrangement",
        "Vocabulary",
        "Column Matching & Connectors",
      ],
    },
  ],
};

export const DESCRIPTIVE = {
  marks: 30,
  minutes: 30,
  parts: ["Email Writing", "Report / Précis Writing", "Situation Analysis"],
  note: "Revised in the 2026 cycle (earlier cycles: Letter + Essay for 50 marks). Typed on a computer, so typing speed matters too.",
};

export const PHASE3 = {
  psychometric: "Personality profiling, qualifying in nature; findings may be shared with the interview panel",
  ge: 20,
  interview: 30,
  total: 50,
};

export const FINAL_MERIT = { mains: 75, phase3: 25 };

export const PHASE_META: Record<
  PhaseId | "interview",
  { id: PhaseId | "interview"; num: number; title: string; tagline: string; tone: Tone; line: string; emoji: string }
> = {
  prelims: {
    id: "prelims",
    num: 1,
    title: "Prelims",
    tagline: "The gate. Speed, accuracy and calm under the clock.",
    tone: "rose",
    line: "100 marks · 60 min · qualifying",
    emoji: "🌅",
  },
  mains: {
    id: "mains",
    num: 2,
    title: "Mains",
    tagline: "The real battle. 75% of your final merit is decided here.",
    tone: "lilac",
    line: "200 objective + 30 descriptive · 3 h 30 min",
    emoji: "🔥",
  },
  interview: {
    id: "interview",
    num: 3,
    title: "Interview & All",
    tagline: "Psychometric, Group Exercise and Interview. Where you become a person, not a score.",
    tone: "gold",
    line: "GE 20 + Interview 30 · 25% of merit",
    emoji: "🎤",
  },
};

export const MOCK_TARGET: Record<PhaseId, number> = { prelims: 40, mains: 30 };

export function allTopics(phase: PhaseId) {
  const out: { subject: string; topic: string }[] = [];
  SUBJECTS[phase].forEach((s) => s.topics.forEach((t) => out.push({ subject: s.name, topic: t })));
  return out;
}

export function topicCount(phase: PhaseId) {
  return SUBJECTS[phase].reduce((n, s) => n + s.topics.length, 0);
}

/* ---------------- Roadmap ---------------- */

export const JOURNEY = [
  { title: "Notification & Application", when: "Around June", text: "SBI releases the advertisement. Apply online, pay the fee, upload documents. Check eligibility and attempt limits.", emoji: "📝" },
  { title: "Pre-Exam Training (if eligible)", when: "July", text: "Free training for SC/ST/OBC/PwBD candidates, where applicable.", emoji: "🎓" },
  { title: "Phase 1: Prelims", when: "Early August (2026 cycle)", text: "100 questions, 60 minutes, qualifying only. Roughly ten times the vacancies move on.", emoji: "🌅" },
  { title: "Phase 2: Mains", when: "September (2026 cycle)", text: "Objective (200) + Descriptive (30). This is the stage that carries 75% of your final merit.", emoji: "🔥" },
  { title: "Phase 3: Psychometric, GE & Interview", when: "October – November", text: "Personality profiling, a group exercise (20) and a personal interview (30).", emoji: "🎤" },
  { title: "Final Result & Joining", when: "November – December", text: "Merit list = Mains scaled to 75 + Phase 3 scaled to 25. Document verification, medical, then training as a Probationary Officer.", emoji: "🏆" },
];

export type PlanBlock = {
  title: string;
  months: string;
  start: string;
  end: string;
  tone: Tone;
  goal: string;
  focus: string[];
};

export const PREP_PLAN: PlanBlock[] = [
  {
    title: "Foundation",
    months: "Nov – Dec 2026",
    start: "2026-11-01",
    end: "2026-12-31",
    tone: "rose",
    goal: "Know every topic. Zero fog.",
    focus: ["Cover the full syllabus once, topic by topic", "Build short notes as you go (Stage 2)", "Start the daily habit: 1 current-affairs entry, 1 reading, 1 typing session", "Take one diagnostic mock to find the baseline"],
  },
  {
    title: "PYQ Analysis & Depth",
    months: "Jan – Mar 2027",
    start: "2027-01-01",
    end: "2027-03-31",
    tone: "gold",
    goal: "Learn what SBI actually asks.",
    focus: ["Stage 1 for every year, subject and topic", "Record repeated mistakes and tricks (Stage 3)", "Start sectional tests twice a week", "Begin descriptive writing practice (Email, Report, Situation Analysis)"],
  },
  {
    title: "Practice & Speed",
    months: "Apr – May 2027",
    start: "2027-04-01",
    end: "2027-05-31",
    tone: "lilac",
    goal: "Turn knowledge into speed and accuracy.",
    focus: ["Topic tests plus 1 full mock a week", "Hard puzzles, caselet DI and Mains-level reasoning", "Banking awareness every day, with monthly current-affairs revision", "Work through the Weak Areas dashboard"],
  },
  {
    title: "Mock Mode",
    months: "Jun – Jul 2027",
    start: "2027-06-01",
    end: "2027-07-31",
    tone: "sage",
    goal: "Exam-day rehearsal.",
    focus: ["2–3 full mocks per week, then deep review of each", "Revision queue cleared daily", "Group Exercise and interview practice begins", "Sleep, food and routine fixed like exam week"],
  },
  {
    title: "Final Sprint",
    months: "Aug 2027",
    start: "2027-08-01",
    end: "2027-08-31",
    tone: "gold",
    goal: "Calm, sharp, ready.",
    focus: ["Light revision of Important Points only", "No new topics in the last week", "Exam-day checklist and logistics sorted", "Re-read your Home page the night before"],
  },
];

/* ---------------- Today / Tasks ---------------- */

export const TASK_TAGS = ["Prelims", "Mains", "PYQ", "Notes", "Revision", "Mock", "Current Affairs", "Writing", "Interview", "Other"];

/* ---------------- Tests ---------------- */

export const TEST_KINDS = ["Full Mock", "Sectional Test", "Topic Test", "PYQ Paper", "Descriptive Test"];

/* ---------------- Current affairs ---------------- */

export const CA_CATEGORIES = ["Banking", "RBI & Economy", "Schemes & Policy", "National", "International", "Appointments", "Awards", "Sports", "Science & Tech", "SBI"];

/* ---------------- Interview ---------------- */

export const INTERVIEW_QUESTIONS: { category: string; question: string }[] = [
  { category: "About me", question: "Tell me about yourself." },
  { category: "About me", question: "What are your strengths and your weaknesses?" },
  { category: "Why banking", question: "Why do you want to join banking?" },
  { category: "Why SBI", question: "Why SBI, and not another bank?" },
  { category: "Why PO", question: "Why a PO role rather than other careers?" },
  { category: "Situation", question: "Are you ready to be posted anywhere in India, including rural branches?" },
  { category: "Situation", question: "Describe a time you handled pressure or failure." },
  { category: "Situation", question: "What would you do if a senior asked you to do something against the rules?" },
  { category: "Vision", question: "Where do you see yourself in five years?" },
  { category: "Banking", question: "What are the recent trends in Indian banking (UPI, digital lending, NPAs)?" },
  { category: "Banking", question: "What is the role of RBI, and what did the latest policy change?" },
];

export const DAF_PROMPTS = [
  "Hometown and state: what is special about it?",
  "Graduation subject: key concepts someone could quiz me on",
  "Hobbies: every one is fair game, so know it deeply",
  "Achievements and certificates",
  "Work experience or internships",
  "Why I applied to SBI: my honest reasons",
  "Strengths: with a real example for each",
  "Weaknesses: and what I am doing about them",
  "Current news I can discuss confidently",
  "Questions I fear and how I will answer them",
];

export const JOINING_DOCS = [
  "Graduation marksheets & final degree / provisional certificate",
  "Class 10 certificate (date of birth proof)",
  "Class 12 certificate",
  "Photo ID (Aadhaar / PAN / Passport / Voter ID)",
  "Category certificate (if applicable) in the prescribed format",
  "Passport-size photographs",
  "Call letter printouts for each phase",
  "Address proof",
  "Bank account and PAN details",
  "Medical fitness documents (as required)",
  "Formal interview outfit ready and tested",
  "Travel and stay plan for the interview city",
];

export const PSYCHOMETRIC_TIPS = [
  "Answer consistently and honestly; the test checks for contradictions.",
  "Think of real situations you have handled, not an imaginary ideal officer.",
  "Do not overthink each item; first instinct is usually the most consistent.",
  "Practise a couple of sample tests so the format feels familiar.",
];
