import type { SampleWork } from "@types";

export type SelectedCaseMetric = {
  prefix: string;
  value: number;
  suffix: string;
  label: string;
  points?: number[];
};

export type CaseStudySection = {
  eyebrow: string;
  title: string;
  body: string[];
  highlights?: string[];
};

export type SelectedCase = SampleWork & {
  company?: string;
  industry?: string;
  role?: string;
  summary: string;
  metric: SelectedCaseMetric;
  services?: string[];
  technologies?: string[];
  context: {
    title: string;
    body: string[];
  };
  challenge: CaseStudySection;
  solution: CaseStudySection;
  results: {
    eyebrow: string;
    title: string;
    body: string[];
    highlights: string[];
  };
  engineeringNotes?: {
    hardestConstraint?: string;
    invariants?: string[];
    implementation?: string[];
    verification?: string[];
  };
  tags: string[];
  legacySlugs?: string[];
};

const pointsOrDefault = (points?: number[]) => points ?? [0.35, 0.5, 0.42, 0.62];

function buildDescription(item: Omit<SelectedCase, "description">): string {
  const sections = [
    item.summary,
    `## Client context\n${item.context.body.join("\n\n")}`,
    `## Business challenge\n${item.challenge.body.join("\n\n")}`,
    `## Intervention\n${item.solution.body.join("\n\n")}`,
    `## Result\n${item.results.body.join("\n\n")}`,
    item.results.highlights.length
      ? `### Highlights\n${item.results.highlights.map((line) => `- ${line}`).join("\n")}`
      : "",
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
    company: "Early-stage founder",
    industry: "Product validation",
    role: "Full-stack product engineering",
    title: "From Product Idea to Investor Demo in 10 Days",
    summary:
      "Turned an early product concept into a working demo that investors and first users could evaluate before a larger build commitment.",
    metric: {
      prefix: "",
      value: 10,
      suffix: " days",
      label: "to working investor demo",
      points: [0.18, 0.32, 0.52, 0.74, 0.9],
    },
    services: ["MVP scoping", "Full-stack delivery", "Investor demo readiness"],
    technologies: ["GCP", "Full-stack web app", "Third-party integrations"],
    context: {
      title: "A founder needed proof before committing to a larger build.",
      body: [
        "The idea had enough promise to justify exploration, but not enough evidence to justify months of engineering.",
        "The immediate need was a credible product flow that could support investor and early-user conversations.",
      ],
    },
    challenge: {
      eyebrow: "Challenge",
      title: "Validate the core experience without building the whole company first.",
      body: [
        "A broad product surface would have absorbed time and budget before proving whether the central workflow made sense.",
        "The demo also had to be realistic enough that later engineering would not start from a completely disposable artifact.",
      ],
    },
    solution: {
      eyebrow: "Intervention",
      title: "Reduced the product to one inspectable end-to-end path.",
      body: [
        "I scoped the first release around the smallest flow investors and users needed to understand, then built it as a real full-stack product rather than a static walkthrough.",
        "Temporary MVP shortcuts were kept visible and separate from the service and deployment boundaries that could survive later development.",
      ],
      highlights: ["Focused validation scope", "Cloud-backed demo", "Explicit MVP boundaries"],
    },
    results: {
      eyebrow: "Result",
      title: "The founder could test the opportunity with a working product flow.",
      body: [
        "A working investor demo shipped in 10 days and gave product conversations something concrete to inspect.",
        "The technical structure preserved a path into further development instead of forcing a full restart after validation.",
      ],
      highlights: [
        "Investor-ready demo in 10 days",
        "Earlier user and fundraising conversations",
        "Clear separation between validation code and longer-lived foundations",
      ],
    },
    engineeringNotes: {
      hardestConstraint:
        "Deliver credible proof quickly without letting secondary product ideas expand the first release.",
      invariants: [
        "The core product flow must be demonstrable inside the fixed validation window.",
        "Non-critical systems must stay outside first-release scope.",
      ],
      verification: ["A working demo was delivered and used in investor and early product conversations."],
    },
    tags: ["fullstack", "product", "stakeholder"],
    legacySlugs: ["building-too-much-before-proving-the-product"],
  }),

  defineCase({
    index: 2,
    title: "Preparing an AI Product for Real Users",
    company: "Pre-beta AI product",
    industry: "AI software",
    role: "Launch readiness and reliability engineering",
    summary:
      "Moved a working prototype toward a safer beta by strengthening request boundaries, deployment paths, performance, and operational visibility.",
    metric: {
      prefix: "",
      value: 40,
      suffix: "%",
      label: "faster under tested load",
      points: [0.86, 0.72, 0.58, 0.42, 0.32],
    },
    services: ["Launch hardening", "Observability", "CI/CD"],
    technologies: ["React", "Python", "Google Cloud", "Caching", "Monitoring"],
    context: {
      title: "The prototype worked, but real users were about to arrive.",
      body: [
        "The React frontend and Python backend already demonstrated value.",
        "The operating paths were not ready for real users: errors were hard to interpret, releases were inconsistent, and redundant API calls increased response time.",
      ],
    },
    challenge: {
      eyebrow: "Challenge",
      title: "Make launch safer without slowing the beta.",
      body: [
        "Input handling, API access, error states, and deployment flow all needed stronger controls before beta.",
        "The work had to reduce launch risk without turning readiness into a long rewrite.",
      ],
    },
    solution: {
      eyebrow: "Intervention",
      title: "Hardened the product across the user, API, and delivery paths.",
      body: [
        "I added validation, rate limiting, caching, actionable application errors, error tracking, metrics, logging, and alerts.",
        "I also introduced unit testing, continuous deployment, and separate development, staging, and production environments.",
      ],
      highlights: ["Backend request controls", "Actionable failure states", "Release environments"],
    },
    results: {
      eyebrow: "Result",
      title: "The product entered beta with stronger operating foundations.",
      body: [
        "Before-and-after Lighthouse measurements showed roughly 40% lower response time under tested load.",
        "The beta launched with no major technical incidents reported.",
      ],
      highlights: [
        "Lower response time under tested load",
        "No major technical incidents reported during initial beta",
        "Controlled releases across development, staging, and production",
      ],
    },
    engineeringNotes: {
      hardestConstraint:
        "Improve launch readiness across the stack without delaying the beta window.",
      invariants: [
        "Invalid or abusive requests should be rejected by the backend.",
        "Operators should detect important failures before relying only on user reports.",
      ],
      implementation: ["Validation, rate limiting, caching, observability, CI/CD, and staged environments."],
      verification: ["Before-and-after Lighthouse measurements under expected load."],
    },
    tags: ["fullstack", "reliability", "observability", "devops"],
    legacySlugs: [
      "preparing-an-ai-product-for-its-first-real-users",
      "the-prototype-wasn-t-ready-for-real-users",
    ],
  }),

  defineCase({
    index: 3,
    title: "Scaling a Realtime Platform Without Higher Hosting Costs",
    company: "Realtime gaming platform",
    industry: "Gaming",
    role: "Backend performance engineering",
    summary:
      "Increased backend throughput roughly 10x and improved reliability while avoiding a proportional increase in hosting cost.",
    metric: {
      prefix: "",
      value: 10,
      suffix: "x",
      label: "throughput, same hosting cost",
      points: [0.14, 0.24, 0.42, 0.64, 0.82, 0.94],
    },
    services: ["Performance profiling", "Backend scaling", "Infrastructure efficiency"],
    technologies: ["Realtime backend", "Concurrency profiling", "Mobile coordination"],
    context: {
      title: "Growth was putting pressure on realtime user sessions.",
      body: [
        "The product needed to support thousands of concurrent players while protecting session quality and infrastructure spend.",
        "Reliability was roughly 65% under the existing operating conditions.",
      ],
    },
    challenge: {
      eyebrow: "Challenge",
      title: "Increase capacity without buying more servers by default.",
      body: [
        "Adding infrastructure would have raised cost without necessarily fixing the overloaded backend paths.",
        "The work had to improve throughput and reliability together, not trade one against the other.",
      ],
    },
    solution: {
      eyebrow: "Intervention",
      title: "Profiled the limiting paths and focused engineering effort there.",
      body: [
        "I identified backend bottlenecks that limited concurrent-user capacity and prioritized the fixes with the largest user impact.",
        "The work was coordinated with mobile and product teams so performance changes mapped to the parts of the experience users actually felt.",
      ],
      highlights: ["Concurrency bottleneck profiling", "Cross-team prioritization", "Cost-aware scaling"],
    },
    results: {
      eyebrow: "Result",
      title: "The platform handled growth with better reliability and no higher hosting cost.",
      body: [
        "Backend throughput increased by roughly 10x, supporting thousands of concurrent users without higher hosting costs.",
        "Reliability improved from roughly 65% to 92% under the measured operating conditions.",
      ],
      highlights: [
        "Roughly 10x backend throughput",
        "Reliability improved from about 65% to 92%",
        "Thousands of concurrent users supported without higher hosting cost",
      ],
    },
    engineeringNotes: {
      hardestConstraint:
        "Support rising concurrency without turning traffic growth into proportional infrastructure growth.",
      invariants: [
        "One overloaded path should not destabilize unrelated parts of the system.",
        "User completion reliability should improve rather than regress.",
      ],
      verification: ["Validated against production concurrency and hosting-cost outcomes."],
    },
    tags: ["backend", "performance", "reliability", "stakeholder"],
    legacySlugs: ["growth-was-breaking-the-product"],
  }),

  defineCase({
    index: 4,
    title: "Reducing AWS Costs by 60% Without Slowing the Product",
    company: "Cost-sensitive software company",
    industry: "Cloud infrastructure",
    role: "Infrastructure optimization",
    summary:
      "Reduced monthly AWS spend by approximately 60% by matching infrastructure to workload behavior while protecting product performance.",
    metric: {
      prefix: "",
      value: 60,
      suffix: "%",
      label: "less AWS spend, performance held",
      points: [0.9, 0.8, 0.68, 0.54, 0.4, 0.3],
    },
    services: ["Cloud cost reduction", "Architecture simplification", "Performance protection"],
    technologies: ["AWS", "Service tuning", "Asynchronous processing"],
    context: {
      title: "The business needed more runway without weakening the product.",
      body: [
        "AWS spend had grown beyond what the operating model justified.",
        "The company needed a lower bill, but blind cuts could have moved the cost into latency, incidents, or emergency infrastructure work.",
      ],
    },
    challenge: {
      eyebrow: "Challenge",
      title: "Remove waste without creating a reliability regression.",
      body: [
        "Workloads with different traffic patterns were being supported by an inefficient infrastructure shape.",
        "Capacity decisions needed to reflect measured demand rather than permanent overprovisioning.",
      ],
    },
    solution: {
      eyebrow: "Intervention",
      title: "Simplified the architecture around real workload behavior.",
      body: [
        "I reviewed AWS usage, removed unnecessary resources, tuned services, and separated workload paths where the existing shape was creating cost without value.",
        "Performance was checked while the reductions were applied so cost savings did not silently degrade user experience.",
      ],
      highlights: ["Usage review", "Resource simplification", "Performance checks"],
    },
    results: {
      eyebrow: "Result",
      title: "The company gained runway while keeping the product responsive.",
      body: [
        "Monthly AWS spending fell by approximately 60% after architecture simplification and service tuning.",
        "No performance regression was reported as the lower-cost infrastructure shape took effect.",
      ],
      highlights: [
        "Approximately 60% lower monthly AWS spend",
        "Performance protected during reductions",
        "Infrastructure shape better matched to demand",
      ],
    },
    engineeringNotes: {
      hardestConstraint:
        "Reduce infrastructure spending sharply without creating a reliability or performance regression.",
      invariants: [
        "Cost reduction must not create a user-visible performance regression.",
        "Burst traffic must not require permanent overprovisioning.",
      ],
      verification: ["AWS billing showed the reduction while application performance remained protected."],
    },
    tags: ["infra", "performance", "reliability"],
    legacySlugs: ["cloud-spend-was-eating-the-runway"],
  }),

  defineCase({
    index: 5,
    title: "Protecting $4M in Live Digital Assets",
    company: "Financial platform",
    industry: "Web3 finance",
    role: "Smart contract and backend reliability",
    summary:
      "Hardened smart contracts, backend services, testing, and release practices for a platform managing roughly $4M in live client assets.",
    metric: {
      prefix: "$",
      value: 4,
      suffix: "M",
      label: "assets protected, zero incidents",
      points: [0.54, 0.52, 0.55, 0.53, 0.56, 0.55],
    },
    services: ["Security-sensitive delivery", "CI/CD", "Audit remediation"],
    technologies: ["Solidity", "Backend services", "Payment workflows", "CI/CD"],
    context: {
      title: "A live financial platform needed to keep shipping safely.",
      body: [
        "The platform managed roughly $4M in on-chain client assets across deposits, withdrawals, launchpad transactions, and ledger workflows.",
        "Product changes could not be treated as ordinary releases because contract and backend mistakes could affect customer funds.",
      ],
    },
    challenge: {
      eyebrow: "Challenge",
      title: "Protect asset integrity while the product continued to evolve.",
      body: [
        "Manual release practices increased regression risk, and security findings needed to become concrete engineering changes.",
        "On-chain payment behavior and backend ledger handling had to stay consistent across releases.",
      ],
    },
    solution: {
      eyebrow: "Intervention",
      title: "Built controls around contracts, backend workflows, and delivery.",
      body: [
        "I maintained and hardened the smart contracts and backend services behind financial workflows.",
        "Automated tests, CI/CD, transaction checks, audit remediation, and production visibility made security part of the implementation path rather than a document at the end.",
      ],
      highlights: ["Contract hardening", "Ledger-aware backend checks", "Audit remediation"],
    },
    results: {
      eyebrow: "Result",
      title: "The platform kept operating without recorded security incidents.",
      body: [
        "Roughly $4M in client assets were safeguarded over approximately three years.",
        "The product recorded zero security incidents during that period and achieved a 9/10 external security audit score.",
      ],
      highlights: [
        "Roughly $4M in live assets safeguarded",
        "Zero recorded security incidents over about three years",
        "9/10 external security audit score",
      ],
    },
    engineeringNotes: {
      hardestConstraint:
        "Continue shipping changes while protecting live customer funds and transaction integrity.",
      invariants: [
        "Contract and backend changes must not create loss-of-funds conditions.",
        "Deposits, withdrawals, and ledger records must remain consistent.",
      ],
      verification: ["Operational record, safeguarded asset volume, and external audit result."],
    },
    tags: ["security", "reliability", "payments", "devops"],
    legacySlugs: ["a-bad-release-could-put-customer-funds-at-risk"],
  }),

  defineCase({
    index: 6,
    title: "Automating Three Hours of Daily Security Operations",
    company: "Security operations team",
    industry: "Cybersecurity",
    role: "Security automation and enablement",
    summary:
      "Automated repeatable security operations so analysts reclaimed roughly three hours each day while developers received earlier, more usable security feedback.",
    metric: {
      prefix: "",
      value: 3,
      suffix: " hrs",
      label: "reclaimed every day",
      points: [0.9, 0.76, 0.6, 0.46, 0.34, 0.26],
    },
    services: ["Security automation", "Developer enablement", "Operational process design"],
    technologies: ["Security automation", "SDLC controls", "Operational checks"],
    context: {
      title: "Analysts were spending skilled time on repetitive checks.",
      body: [
        "Routine security operations consumed roughly three hours of analyst time each day.",
        "The repetition created inconsistency risk and left less time for investigation, prevention, and useful guidance to product teams.",
      ],
    },
    challenge: {
      eyebrow: "Challenge",
      title: "Automate the routine work without hiding important signals.",
      body: [
        "The team needed consistency and speed, but security automation could not become a black box that suppressed judgment.",
        "Developers also needed findings earlier, before issues were expensive to correct.",
      ],
    },
    solution: {
      eyebrow: "Intervention",
      title: "Standardized recurring checks and moved feedback earlier.",
      body: [
        "I automated repetitive SecOps tasks, standardized recurring outputs, and shifted vulnerability communication earlier into the software development lifecycle.",
        "Complex requirements were converted into practical guidance and tools development teams could apply directly.",
      ],
      highlights: ["Repeatable checks", "Earlier vulnerability feedback", "Developer-ready guidance"],
    },
    results: {
      eyebrow: "Result",
      title: "Analysts recovered time while security feedback became easier to act on.",
      body: [
        "The workflow reclaimed roughly three hours of analyst time each day and reduced human-error exposure in repetitive checks.",
        "Development teams received security feedback earlier and in a form they could use without constant direct support.",
      ],
      highlights: [
        "Roughly three analyst hours reclaimed each day",
        "Reduced human-error exposure in repetitive checks",
        "Earlier, more usable security feedback for development teams",
      ],
    },
    engineeringNotes: {
      hardestConstraint:
        "Reduce repetitive work without hiding important security findings or removing human judgment.",
      invariants: [
        "Repetitive checks should produce consistent results.",
        "Automation should reduce routine work rather than hide relevant findings.",
      ],
      verification: ["The automated workflow reclaimed approximately three hours per day."],
    },
    tags: ["security", "automation", "enablement", "stakeholder"],
    legacySlugs: ["skilled-people-were-buried-in-repetitive-work"],
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
  return "summary" in item && "context" in item && "challenge" in item && "results" in item;
}
