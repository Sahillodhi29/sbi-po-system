export type Tone = "rose" | "lilac" | "gold" | "sage";

/** Full literal class names so Tailwind can see them. */
export const TONES: Record<
  Tone,
  { soft: string; softer: string; text: string; border: string; solid: string; grad: string; stroke: string }
> = {
  rose: {
    soft: "bg-rose/15",
    softer: "bg-rose/10",
    text: "text-rose",
    border: "border-rose/40",
    solid: "bg-rose",
    grad: "from-rose/35 via-rose/10 to-transparent",
    stroke: "rgb(var(--rose))",
  },
  lilac: {
    soft: "bg-lilac/15",
    softer: "bg-lilac/10",
    text: "text-lilac",
    border: "border-lilac/40",
    solid: "bg-lilac",
    grad: "from-lilac/35 via-lilac/10 to-transparent",
    stroke: "rgb(var(--lilac))",
  },
  gold: {
    soft: "bg-gold/15",
    softer: "bg-gold/10",
    text: "text-gold",
    border: "border-gold/40",
    solid: "bg-gold",
    grad: "from-gold/35 via-gold/10 to-transparent",
    stroke: "rgb(var(--gold))",
  },
  sage: {
    soft: "bg-sage/15",
    softer: "bg-sage/10",
    text: "text-sage",
    border: "border-sage/40",
    solid: "bg-sage",
    grad: "from-sage/35 via-sage/10 to-transparent",
    stroke: "rgb(var(--sage))",
  },
};
