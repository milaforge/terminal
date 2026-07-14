import type { StoryChapter } from "./storyChapters";

export const TEAM_STORY_ERA = "SENIOR FULL-STACK PRODUCT ENGINEER";
export const TEAM_STORY_TAGLINE =
  "I turn product decisions into software that survives production";
export const TEAM_STORY_INTRO =
  "Across frontend, backend, cloud, and operations, I own work end to end while keeping context and decisions visible to the team.";
export const TEAM_STORY_SCROLL_HINT = "See how I work";
export const TEAM_STORY_CTA_LABEL = "Discuss the role";
export const TEAM_STORY_CTA_EYEBROW =
  "LOOKING FOR A TEAM WHERE END-TO-END OWNERSHIP AND RELIABLE DELIVERY MATTER.";
export const TEAM_STORY_START = "Product intent";
export const TEAM_STORY_END = "Dependable production";

export const TEAM_CHAPTERS: StoryChapter[] = [
  {
    id: "gaps",
    year: "GAPS",
    span: "",
    hook: "Most product risk lives between the layers.",
    sub: "A feature can look finished in one place and still fail across the interface, APIs, data, infrastructure, or production.",
    accent: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.13)",
  },
  {
    id: "whole-path",
    year: "WHOLE",
    span: "",
    hook: "I take ownership of the whole path.",
    sub: "I turn product intent into working software across frontend, backend, cloud, and operations—keeping the decisions connected through production.",
    accent: "#4ade80",
    glow: "rgba(74, 222, 128, 0.13)",
  },
  {
    id: "clarity",
    year: "CLEAR",
    span: "",
    hook: "Before changing a system, I make it legible.",
    sub: "I trace the architecture, dependencies, and failure modes so the team can choose a clear, reviewable path instead of guessing.",
    accent: "#38bdf8",
    glow: "rgba(56, 189, 248, 0.13)",
  },
  {
    id: "execution",
    year: "SHIP",
    span: "",
    hook: "Safe delivery is part of the implementation.",
    sub: "Interfaces, tests, rollout, observability, and recovery are designed with the feature—not added after it.",
    accent: "#818cf8",
    glow: "rgba(129, 140, 248, 0.13)",
  },
  {
    id: "operability",
    year: "TRUST",
    span: "",
    hook: "A feature is not finished when the code is merged.",
    sub: "I verify it in production, diagnose failures, improve weak points, and make recovery understandable to the people operating it.",
    accent: "#a78bfa",
    glow: "rgba(167, 139, 250, 0.13)",
  },
  {
    id: "team",
    year: "TEAM",
    span: "",
    hook: "The best ownership creates more ownership.",
    sub: "I leave the codebase, decisions, and operating knowledge clearer than I found them, so the whole team can keep moving with confidence.",
    accent: "#fb7185",
    glow: "rgba(251, 113, 133, 0.13)",
  },
  {
    id: "proof",
    year: "",
    span: "",
    hook: "Selected outcomes",
    sub: "10× throughput · 60% lower AWS cost · three years without a post-deployment security incident",
    accent: "#fb7185",
    glow: "rgba(251, 113, 133, 0.13)",
  },
];