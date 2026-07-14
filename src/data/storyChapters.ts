export type StoryChapter = {
  id: string;
  /** big ghost year behind the scene */
  year: string;
  /** kicker shown above the hook, e.g. "2008–2012" */
  span: string;
  /** the one memorable line */
  hook: string;
  /** the one factual line */
  sub: string;
  /** strong accent for text/borders */
  accent: string;
  /** translucent accent for the ambient background glow (must stay rgba) */
  glow: string;
};

export const STORY_TAGLINE = "Bring me the idea—or the software you no longer trust.";
export const STORY_START = "Technical uncertainty";
export const STORY_END = "Founder control";

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: "recognition",
    year: "ALONE",
    span: "",
    hook: "Everyone can own a task while no one owns the product.",
    sub: "When responsibility is fragmented, every technical gap comes back to the founder.",
    accent: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.13)",
  },

  {
    id: "counterpart",
    year: "ONE",
    span: "",
    hook: "You need one person accountable for the whole technical outcome.",
    sub: "A counterpart who carries decisions from product scope through software, launch, and operation.",
    accent: "#4ade80",
    glow: "rgba(74, 222, 128, 0.13)",
  },

  {
    id: "control",
    year: "CLEAR",
    span: "",
    hook: "Delegating the work should give you more control—not less.",
    sub: "You always know what is being built, why it matters, what it costs, and where the risks are.",
    accent: "#38bdf8",
    glow: "rgba(56, 189, 248, 0.13)",
  },

  {
    id: "validation",
    year: "PROOF",
    span: "",
    hook: "The first release should answer a question—not complete a wish list.",
    sub: "You shall reach the investor-ready product in 10 days before committing to the larger build.",
    accent: "#818cf8",
    glow: "rgba(129, 140, 248, 0.13)",
  },

  {
    id: "reliability",
    year: "TRUST",
    span: "",
    hook: "Launch proves it works. Operations prove it can be trusted.",
    sub: "That discipline helped protect about $4M in customer assets for three years with zero recorded security incidents.",
    accent: "#a78bfa",
    glow: "rgba(167, 139, 250, 0.13)",
  },

  {
    id: "scale",
    year: "GROW",
    span: "",
    hook: "Growth should strengthen the company—not expose every shortcut.",
    sub: "I raised throughput 10× and reliability from about 65% to 92% without increasing hosting cost.",
    accent: "#c084fc",
    glow: "rgba(192, 132, 252, 0.13)",
  },

  {
    id: "ownership",
    year: "YOURS",
    span: "",
    hook: "Your company should never depend on the person who built it.",
    sub: "The code, accounts, decisions, and operating knowledge remain yours from the first day.",
    accent: "#e879f9",
    glow: "rgba(232, 121, 249, 0.13)",
  },

  {
    id: "leadership",
    year: "LEAD",
    span: "",
    hook: "You do not need to become technical to lead a technical company.",
    sub: "You need clear choices, visible progress, and one accountable partner making technology serve the business.",
    accent: "#fb7185",
    glow: "rgba(251, 113, 133, 0.13)",
  },
];
