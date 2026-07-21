import type { SampleWork } from "@types";

export type SelectedCaseMetric = {
  prefix: string;
  value: number;
  suffix: string;
  label: string;
  points?: number[];
};

export type SelectedCase = SampleWork & {
  eyebrow: string;
  company?: string;
  role?: string;
  oneLiner: string;
  metric: SelectedCaseMetric;
  problem: string;
  decision: string;
  proof: string[];
  technologies?: string[];
  engineeringNote?: {
    constraint: string;
    invariant: string;
  };
  tags: string[];
  legacySlugs?: string[];
};

const pointsOrDefault = (points?: number[]) => points ?? [0.35, 0.5, 0.42, 0.62];

function buildDescription(item: Omit<SelectedCase, "description">): string {
  const sections = [
    item.oneLiner,
    `## Problem\n${item.problem}`,
    `## Decision\n${item.decision}`,
    `## Proof\n${item.proof.map((line) => `- ${line}`).join("\n")}`,
  ];

  return sections.filter(Boolean).join("\n\n");
}

function defineCase(item: Omit<SelectedCase, "description">): SelectedCase {
  return {
    ...item,
    description: buildDescription(item),
  };
}

export const SELECTED_CASES: SelectedCase[] = [
  defineCase({
    index: 1,
    eyebrow: "Product validation",
    company: "Early-stage founder",
    role: "Full-stack product engineering",
    title: "Investor Demo Shipped in 10 Days",
    oneLiner:
      "Scoped and shipped the smallest credible product flow before the founder committed to a larger build.",
    metric: {
      prefix: "",
      value: 10,
      suffix: " days",
      label: "to working investor demo",
      points: [0.18, 0.32, 0.52, 0.74, 0.9],
    },
    technologies: ["GCP", "Full-stack web app", "Third-party integrations"],
    problem: "The founder needed evidence before investing months in engineering.",
    decision:
      "I built one inspectable end-to-end workflow and kept temporary MVP shortcuts separate from longer-lived foundations.",
    proof: [
      "Demo shipped in 10 days",
      "Used in investor and early-user conversations",
      "Foundations preserved for further development",
    ],
    engineeringNote: {
      constraint: "Deliver credible proof without expanding the first release.",
      invariant: "The core workflow had to remain demonstrable inside the fixed validation window.",
    },
    tags: ["fullstack", "product", "stakeholder"],
    legacySlugs: [
      "from-product-idea-to-investor-demo-in-10-days",
      "building-too-much-before-proving-the-product",
    ],
  }),

  defineCase({
    index: 2,
    eyebrow: "AI launch readiness",
    title: "AI Beta Hardened Before Real Users",
    company: "Pre-beta AI product",
    role: "Launch readiness and reliability engineering",
    oneLiner:
      "Strengthened request boundaries, deployment paths, performance, and visibility before the beta reached real users.",
    metric: {
      prefix: "",
      value: 40,
      suffix: "%",
      label: "faster under tested load",
      points: [0.86, 0.72, 0.58, 0.42, 0.32],
    },
    technologies: ["React", "Python", "Google Cloud", "Caching", "Monitoring"],
    problem: "The prototype worked, but errors, releases, redundant API calls, and abuse paths were not ready for beta traffic.",
    decision:
      "I added validation, rate limiting, caching, actionable errors, observability, CI/CD, and separated development, staging, and production environments.",
    proof: [
      "Roughly 40% faster under tested load",
      "Initial beta launched without major reported technical incidents",
      "Controlled releases across development/staging/production",
    ],
    engineeringNote: {
      constraint: "Improve readiness across the stack without delaying the beta window.",
      invariant: "Invalid or abusive requests should be rejected before expensive application work runs.",
    },
    tags: ["fullstack", "reliability", "observability", "devops"],
    legacySlugs: [
      "preparing-an-ai-product-for-real-users",
      "preparing-an-ai-product-for-its-first-real-users",
      "the-prototype-wasn-t-ready-for-real-users",
    ],
  }),

  defineCase({
    index: 3,
    eyebrow: "Realtime scaling",
    title: "Realtime Throughput Increased 10x",
    company: "Realtime gaming platform",
    role: "Backend performance engineering",
    oneLiner:
      "Increased backend capacity and reliability while avoiding a proportional increase in hosting cost.",
    metric: {
      prefix: "",
      value: 10,
      suffix: "x",
      label: "throughput, same hosting cost",
      points: [0.14, 0.24, 0.42, 0.64, 0.82, 0.94],
    },
    technologies: ["Realtime backend", "Concurrency profiling", "Mobile coordination"],
    problem: "Growth was putting pressure on realtime sessions, and adding servers would not necessarily fix overloaded backend paths.",
    decision:
      "I profiled concurrency bottlenecks and focused fixes on the limiting paths that shaped user-visible reliability.",
    proof: [
      "Roughly 10x backend throughput",
      "Reliability improved from about 65% to 92%",
      "Thousands of concurrent users supported without higher hosting cost",
    ],
    engineeringNote: {
      constraint: "Support rising concurrency without turning traffic growth into proportional infrastructure growth.",
      invariant: "One overloaded path should not destabilize unrelated parts of the system.",
    },
    tags: ["backend", "performance", "reliability", "stakeholder"],
    legacySlugs: [
      "scaling-a-realtime-platform-without-higher-hosting-costs",
      "growth-was-breaking-the-product",
    ],
  }),

  defineCase({
    index: 4,
    eyebrow: "Infrastructure efficiency",
    title: "AWS Spend Reduced by 60%",
    company: "Cost-sensitive software company",
    role: "Infrastructure optimization",
    oneLiner:
      "Matched infrastructure to workload behavior so the company gained runway without slowing the product.",
    metric: {
      prefix: "",
      value: 60,
      suffix: "%",
      label: "less AWS spend, performance held",
      points: [0.9, 0.8, 0.68, 0.54, 0.4, 0.3],
    },
    technologies: ["AWS", "Service tuning", "Asynchronous processing"],
    problem: "AWS spend had outgrown the operating model, but blind cuts could have moved the cost into latency or incidents.",
    decision:
      "I reviewed usage, removed unnecessary resources, tuned services, and separated workload paths where the existing shape created cost without value.",
    proof: [
      "Approximately 60% lower monthly AWS spend",
      "Performance protected during reductions",
      "Infrastructure shape better matched measured demand",
    ],
    engineeringNote: {
      constraint: "Reduce infrastructure spending sharply without creating a reliability or performance regression.",
      invariant: "Cost reduction must not create a user-visible performance regression.",
    },
    tags: ["infra", "performance", "reliability"],
    legacySlugs: [
      "reducing-aws-costs-by-60-without-slowing-the-product",
      "cloud-spend-was-eating-the-runway",
    ],
  }),

  defineCase({
    index: 5,
    eyebrow: "Financial reliability",
    title: "$4M in Live Assets Protected",
    company: "Financial platform",
    role: "Smart contract and backend reliability",
    oneLiner:
      "Hardened contracts, backend workflows, tests, and releases for security-sensitive financial operations.",
    metric: {
      prefix: "$",
      value: 4,
      suffix: "M",
      label: "assets protected, zero incidents",
      points: [0.54, 0.52, 0.55, 0.53, 0.56, 0.55],
    },
    technologies: ["Solidity", "Backend services", "Payment workflows", "CI/CD"],
    problem: "The product had to keep evolving while contract or backend mistakes could affect customer funds.",
    decision:
      "I built controls around smart contracts, ledger-aware backend workflows, CI/CD, transaction checks, audit remediation, and production visibility.",
    proof: [
      "Roughly $4M in live assets safeguarded",
      "Zero recorded security incidents over about three years",
      "9/10 external security audit score",
    ],
    engineeringNote: {
      constraint: "Continue shipping changes while protecting live customer funds and transaction integrity.",
      invariant: "Deposits, withdrawals, and ledger records must remain consistent across releases.",
    },
    tags: ["security", "reliability", "payments", "devops"],
    legacySlugs: [
      "protecting-4m-in-live-digital-assets",
      "a-bad-release-could-put-customer-funds-at-risk",
    ],
  }),

  defineCase({
    index: 6,
    eyebrow: "Security automation",
    title: "Three SecOps Hours Reclaimed Daily",
    company: "Security operations team",
    role: "Security automation and enablement",
    oneLiner:
      "Automated repeatable checks so analysts recovered time and developers received earlier security feedback.",
    metric: {
      prefix: "",
      value: 3,
      suffix: " hrs",
      label: "reclaimed every day",
      points: [0.9, 0.76, 0.6, 0.46, 0.34, 0.26],
    },
    technologies: ["Security automation", "SDLC controls", "Operational checks"],
    problem: "Routine security operations consumed skilled analyst time and pushed useful findings too late into the development cycle.",
    decision:
      "I standardized recurring checks, automated repeatable outputs, and converted complex requirements into developer-ready guidance.",
    proof: [
      "Roughly three analyst hours reclaimed each day",
      "Reduced human-error exposure in repetitive checks",
      "Earlier, more usable security feedback for development teams",
    ],
    engineeringNote: {
      constraint: "Reduce repetitive work without hiding important security findings or removing human judgment.",
      invariant: "Automation should reduce routine work rather than suppress relevant findings.",
    },
    tags: ["security", "automation", "enablement", "stakeholder"],
    legacySlugs: [
      "automating-three-hours-of-daily-security-operations",
      "skilled-people-were-buried-in-repetitive-work",
    ],
  }),
];

const metricsByTitle = new Map(
  SELECTED_CASES.map((item) => [item.title, item.metric]),
);

export function getSelectedCaseMetric(
  item: SampleWork,
  fallbackIndex: number,
): Required<SelectedCaseMetric> {
  const metric = metricsByTitle.get(item.title);
  if (metric) {
    return {
      ...metric,
      points: pointsOrDefault(metric.points),
    };
  }

  return {
    prefix: "",
    value: fallbackIndex + 1,
    suffix: "",
    label: "case study",
    points: pointsOrDefault(),
  };
}

export function isSelectedCase(item: SampleWork): item is SelectedCase {
  return "oneLiner" in item && "problem" in item && "decision" in item && "proof" in item;
}
