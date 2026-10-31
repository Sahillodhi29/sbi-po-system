import type { Tone } from "@/lib/tone";

export type Dream = {
  id: string;
  title: string;
  text: string;
  emoji: string;
  image: string; // optional image URL; leave empty for a dreamy gradient
  tone: Tone;
};

export type HomeDoc = {
  why: string;
  reasons: string[];
  dreams: Dream[];
  letter: string;
};

export const HOME_DEFAULT: HomeDoc = {
  why: "I'm doing this because I want a life of respect, security and choice. A life where I can say yes to the things I've always dreamed of, and look after the people I love. SBI PO is hard, and that's exactly why it's worth it. Every page I study is a brick in that life.",
  reasons: [
    "Because \"tough\" is exactly why it's worth it.",
    "Because I want my family to feel safe and proud.",
    "Because I want to say yes to life instead of calculating every small joy.",
    "Because I never want to wonder, \"what if I had given it everything?\"",
  ],
  dreams: [
    { id: "d1", title: "Respect, everywhere I go", text: "A title I earned. \"Officer\" on my card and a calm, quiet pride in my family's eyes.", emoji: "🏛️", image: "", tone: "gold" },
    { id: "d2", title: "Financial freedom", text: "A salary that lets me say yes: to my family, my goals and my curiosity. No more counting every small joy.", emoji: "💎", image: "", tone: "sage" },
    { id: "d3", title: "Two international trips a year", text: "Passport stamps, golden-hour cities, trains through the mountains. Twice a year, every year.", emoji: "✈️", image: "", tone: "lilac" },
    { id: "d4", title: "A wardrobe I adore", text: "Tailored blazers, crisp linen, shoes I don't think twice about. Dressing like the person I became.", emoji: "👔", image: "", tone: "rose" },
    { id: "d5", title: "A home I'm proud of", text: "A place with good light, a reading corner and no stress about rent.", emoji: "🏡", image: "", tone: "gold" },
    { id: "d6", title: "Taking care of my people", text: "Being the one who can show up: tickets, treatments, treats. Their relief is my reward.", emoji: "🤍", image: "", tone: "rose" },
    { id: "d7", title: "A career that grows", text: "Branch head, leadership roles, foreign postings. A path with ladders, not ceilings.", emoji: "📈", image: "", tone: "lilac" },
    { id: "d8", title: "Peace of mind", text: "A stable life. Sundays without dread. Sleeping well.", emoji: "🌙", image: "", tone: "sage" },
  ],
  letter:
    "Dear me, on the day you don't feel like studying:\n\nYou started this on purpose. You chose the hard road because you wanted the view from the top. You don't have to do everything today. Do one small thing: ten minutes, one page, one question. Momentum will do the rest.\n\nI'm already proud of you.\n\n– Me, in the future",
};

export const QUOTES = [
  "Small steps, every single day, build a life.",
  "You don't have to be extreme. Just consistent.",
  "Discipline is choosing between what you want now and what you want most.",
  "Hard is the point. Easy has no view.",
  "One more question. One more page. One more day.",
  "Future you is watching. Make them proud.",
  "Motivation gets you started. Habit keeps you going.",
  "Today's effort is tomorrow's identity.",
  "The officer you'll become is built on ordinary days like this one.",
  "Show up tired. Show up anyway.",
];
