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

export const SELECTED_CASES = [
  defineCase({
    index: 1,
    eyebrow: "Product Delivery",
    company: "Early-stage founder",
    role: "Product engineer",
    title: "Investor Demo Shipped in 10 Days",
    oneLiner:
      "Owned product scoping and end-to-end delivery for an early-stage founder.",
    metric: {
      prefix: "",
      value: 10,
      suffix: " days",
      label: "from idea to working demo",
      points: [0.18, 0.32, 0.52, 0.74, 0.9],
    },
    technologies: ["GCP", "Full-stack web app", "Third-party integrations"],
    problem:
      "The founder needed credible evidence before committing months of time and capital to a full product build.",
    decision:
      "I reduced the first release to one complete customer journey and deferred anything that did not strengthen validation.",
    proof: [
      "Used in investor and early-customer conversations",
      "Validated the core workflow before further investment",
      "Foundations remained usable for the next release",
    ],
    engineeringNote: {
      constraint: "Fixed 10-day validation window.",
      invariant:
        "A real user had to complete the core journey from end to end.",
    },
    tags: ["fullstack", "product", "stakeholder"],
    legacySlugs: [
      "from-product-idea-to-investor-demo-in-10-days",
      "building-too-much-before-proving-the-product",
    ],
  }),

  defineCase({
    index: 2,
    eyebrow: "Scale & Reliability",
    company: "Pre-beta AI product",
    role: "Product reliability engineer",
    title: "AI Product Made Ready for Real Users",
    oneLiner:
      "Owned the reliability work required to turn a working prototype into an operable beta.",
    metric: {
      prefix: "",
      value: 40,
      suffix: "%",
      label: "faster under tested load",
      points: [0.86, 0.72, 0.58, 0.42, 0.32],
    },
    technologies: [
      "React",
      "Python",
      "Google Cloud",
      "Caching",
      "Monitoring",
    ],
    problem:
      "Demo conditions hid failure modes that would surface under real traffic, repeated requests, unsafe input, and frequent releases.",
    decision:
      "I introduced request controls, caching, actionable errors, monitoring, automated deployments, and separate development, staging, and production environments.",
    proof: [
      "Initial beta launched without major reported technical incidents",
      "Releases became controlled and repeatable",
      "Production failures became visible and diagnosable",
    ],
    engineeringNote: {
      constraint: "Improve readiness without delaying the beta window.",
      invariant:
        "Invalid or abusive requests had to stop before expensive work began.",
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
    eyebrow: "Scale & Reliability",
    company: "Realtime gaming platform",
    role: "Backend performance engineer",
    title: "Realtime Capacity Increased 10x",
    oneLiner:
      "Removed the backend bottlenecks limiting growth without increasing hosting cost.",
    metric: {
      prefix: "",
      value: 10,
      suffix: "x",
      label: "backend throughput",
      points: [0.14, 0.24, 0.42, 0.64, 0.82, 0.94],
    },
    technologies: [
      "Realtime backend",
      "Concurrency profiling",
      "Mobile coordination",
    ],
    problem:
      "Growth was causing delayed and failed sessions, while adding servers would have increased spend without fixing the limiting paths.",
    decision:
      "I profiled concurrency, isolated the highest-impact bottlenecks, and focused changes where they would improve the whole system.",
    proof: [
      "Reliability improved from about 65% to 92%",
      "Thousands of concurrent users supported",
      "Hosting cost remained unchanged",
    ],
    engineeringNote: {
      constraint:
        "Support growth without proportional infrastructure expansion.",
      invariant:
        "One overloaded path could not destabilize unrelated product features.",
    },
    tags: ["backend", "performance", "reliability", "stakeholder"],
    legacySlugs: [
      "scaling-a-realtime-platform-without-higher-hosting-costs",
      "growth-was-breaking-the-product",
    ],
  }),

  defineCase({
    index: 4,
    eyebrow: "Scale & Reliability",
    company: "Cost-sensitive software company",
    role: "Cloud infrastructure engineer",
    title: "AWS Spend Reduced by 60%",
    oneLiner:
      "Aligned cloud resources with actual workload demand instead of cutting capacity blindly.",
    metric: {
      prefix: "",
      value: 60,
      suffix: "%",
      label: "lower monthly AWS spend",
      points: [0.9, 0.8, 0.68, 0.54, 0.4, 0.3],
    },
    technologies: ["AWS", "Service tuning", "Asynchronous processing"],
    problem:
      "Cloud spend was reducing runway, but aggressive cuts could have shifted the cost into slower performance or incidents.",
    decision:
      "I audited usage, removed unnecessary resources, tuned services, and moved suitable work away from expensive synchronous paths.",
    proof: [
      "User-visible performance held during the reduction",
      "Infrastructure capacity better matched measured demand",
    ],
    engineeringNote: {
      constraint: "Reduce spend without creating a reliability regression.",
      invariant: "Every saving had to preserve the customer experience.",
    },
    tags: ["infra", "performance", "reliability"],
    legacySlugs: [
      "reducing-aws-costs-by-60-without-slowing-the-product",
      "cloud-spend-was-eating-the-runway",
    ],
  }),

  defineCase({
    index: 5,
    eyebrow: "Security & Trust",
    company: "Financial platform",
    role: "Financial systems and security engineer",
    title: "$4M in Live Assets Protected",
    oneLiner:
      "Owned the controls around contracts, payments, releases, and production monitoring.",
    metric: {
      prefix: "$",
      value: 4,
      suffix: "M",
      label: "in live assets protected",
      points: [0.54, 0.52, 0.55, 0.53, 0.56, 0.55],
    },
    technologies: [
      "Solidity",
      "Backend services",
      "Payment workflows",
      "CI/CD",
    ],
    problem:
      "The product had to keep evolving while a contract, payment, or release failure could directly affect customer funds.",
    decision:
      "I established transaction checks, ledger consistency controls, automated releases, audit remediation, and production visibility.",
    proof: [
      "Zero recorded security incidents over about three years",
      "9/10 external security audit score",
    ],
    engineeringNote: {
      constraint: "Continue shipping while protecting live customer funds.",
      invariant:
        "Deposits, withdrawals, and account records had to remain consistent across releases.",
    },
    tags: ["security", "reliability", "payments", "devops"],
    legacySlugs: [
      "protecting-4m-in-live-digital-assets",
      "a-bad-release-could-put-customer-funds-at-risk",
    ],
  }),

  defineCase({
    index: 6,
    eyebrow: "Security & Trust",
    company: "Security operations team",
    role: "Security automation engineer",
    title: "Three Security Hours Reclaimed Daily",
    oneLiner:
      "Turned repetitive analyst work into consistent checks and earlier developer feedback.",
    metric: {
      prefix: "",
      value: 3,
      suffix: " hrs",
      label: "reclaimed each day",
      points: [0.9, 0.76, 0.6, 0.46, 0.34, 0.26],
    },
    technologies: [
      "Security automation",
      "Development controls",
      "Operational checks",
    ],
    problem:
      "Skilled analysts were spending too much time on repeatable checks, while developers received important findings late.",
    decision:
      "I standardized recurring checks, automated their outputs, and translated security requirements into clear developer actions.",
    proof: [
      "Reduced exposure to manual error",
      "Security feedback moved earlier in the development process",
    ],
    engineeringNote: {
      constraint: "Save analyst time without removing human judgment.",
      invariant:
        "Automation could reduce routine work, but not suppress meaningful findings.",
    },
    tags: ["security", "automation", "enablement", "stakeholder"],
    legacySlugs: [
      "automating-three-hours-of-daily-security-operations",
      "skilled-people-were-buried-in-repetitive-work",
    ],
  }),

  defineCase({
    index: 7,
    eyebrow: "Product Delivery",
    company: "Block by Block",
    role: "Senior product engineer",
    title: "Community Platform Built from Zero to Pre-Beta",
    oneLiner:
      "Owned the user product, admin product, backend, cloud infrastructure, and delivery pipeline.",
    metric: {
      prefix: "",
      value: 2,
      suffix: " products",
      label: "user and admin surfaces",
      points: [0.16, 0.28, 0.44, 0.62, 0.78, 0.88],
    },
    technologies: [
      "React",
      "Node.js",
      "Express",
      "Cloud Run",
      "Firestore",
      "Redis",
      "Terraform",
    ],
    problem:
      "The platform needed to support high-volume member activity without exposing sensitive administrative operations to the same risks.",
    decision:
      "I separated user and admin APIs, modeled value movements as an auditable ledger, cached high-traffic rankings, and kept deployments independent.",
    proof: [
      "Pre-beta platform delivered end to end",
      "Admin operations isolated behind least-privilege access",
      "Value movements recorded with a traceable history",
    ],
    engineeringNote: {
      constraint:
        "Move quickly without mixing sensitive and public workflows.",
      invariant:
        "User actions, admin actions, and ledger state had to remain separate and auditable.",
    },
    tags: ["fullstack", "backend", "product", "infra", "security"],
    legacySlugs: ["building-bbb-from-scratch-into-pre-beta"],
  }),

  defineCase({
    index: 8,
    eyebrow: "Applied AI",
    company: "SEE / CommunityPulse",
    role: "AI product and reliability engineer",
    title: "Telegram Community Assistant Stabilized for Alpha",
    oneLiner:
      "Built the loop from community activity to reports, recommendations, approved actions, and measurement.",
    metric: {
      prefix: "",
      value: 1,
      suffix: " loop",
      label: "from signal to measured action",
      points: [0.82, 0.72, 0.58, 0.46, 0.34, 0.24],
    },
    technologies: [
      "Telegram Mini Apps",
      "Python",
      "Firestore",
      "AI analysis",
      "Typed JSON contracts",
    ],
    problem:
      "Community managers needed useful guidance from noisy conversations, but unchecked AI actions could damage trust.",
    decision:
      "I kept actions human-approved, added typed contracts and deterministic fallbacks, restricted sensitive APIs, and provided emergency controls.",
    proof: [
      "Telegram ingestion, reports, AI guidance, and the admin Mini App connected",
      "Normal admin work moved into one controlled interface",
      "Unsupported actions failed safely instead of being invented",
    ],
    engineeringNote: {
      constraint: "Make AI useful without allowing unapproved action.",
      invariant:
        "Each recommendation had to map to one feasible action and one measurable outcome.",
    },
    tags: ["ai", "fullstack", "reliability", "product", "stakeholder"],
    legacySlugs: [
      "stabilizing-communitypulse-alpha-for-telegram-admins",
    ],
  }),

  defineCase({
    index: 9,
    eyebrow: "Product Delivery",
    company: "BugDasht",
    role: "Founding engineer",
    title: "Security Platform Built from Scratch",
    oneLiner:
      "Owned the backend, infrastructure, data model, integrations, reporting, and sensitive workflows.",
    metric: {
      prefix: "",
      value: 1,
      suffix: " product",
      label: "delivered to real customers",
      points: [0.2, 0.36, 0.5, 0.64, 0.8],
    },
    technologies: [
      "Laravel",
      "PHP",
      "Database design",
      "Infrastructure",
      "Security workflows",
    ],
    problem:
      "The founder needed a production product in a market where customers expected traceability, reliable reporting, and trustworthy behavior.",
    decision:
      "I designed the operational foundation and audit trail while partnering on the customer-facing interface.",
    proof: [
      "Delivered into real customer use",
      "Auditability and reporting built into core workflows",
      "Critical technical ownership remained in-house",
    ],
    engineeringNote: {
      constraint:
        "Turn complex security requirements into usable workflows.",
      invariant:
        "Important customer actions needed a clear, reviewable history.",
    },
    tags: ["security", "backend", "fullstack", "product", "stakeholder"],
    legacySlugs: [
      "building-bugdasht-from-scratch-to-customer-use",
    ],
  }),

  defineCase({
    index: 10,
    eyebrow: "Product Delivery",
    company: "Saman Bank",
    role: "Software engineer",
    title: "Three Core Banking Subsystems Delivered",
    oneLiner:
      "Contributed from MVP to v1 inside a regulated, large-team banking environment.",
    metric: {
      prefix: "",
      value: 3,
      suffix: " systems",
      label: "built for core banking",
      points: [0.18, 0.34, 0.48, 0.62, 0.76],
    },
    technologies: [
      "ASP.NET",
      "C#",
      "Oracle",
      "DB2",
      "Core banking APIs",
    ],
    problem:
      "A large financial codebase needed new capabilities without disrupting established banking processes or production systems.",
    decision:
      "I built subsystems and APIs, integrated newer interfaces, and maintained existing services with conservative release discipline.",
    proof: [
      "Delivered across Oracle, DB2, ASP.NET, and C# systems",
      "Worked within a large coordinated engineering team",
      "Supported the product through its first full release",
    ],
    engineeringNote: {
      constraint: "Ship safely inside a regulated production environment.",
      invariant:
        "New work had to remain compatible with established banking systems.",
    },
    tags: ["backend", "compliance", "fullstack"],
    legacySlugs: [
      "building-core-banking-subsystems-as-early-production-training",
    ],
  }),

  defineCase({
    index: 11,
    eyebrow: "Scale & Reliability",
    company: "VENT Finance",
    role: "Web3 backend and smart contract engineer",
    title: "Blockchain Transaction Fees Cut by 99%",
    oneLiner:
      "Redesigned a recurring on-chain operation without changing its business outcome.",
    metric: {
      prefix: "",
      value: 99,
      suffix: "%",
      label: "lower fees on a critical path",
      points: [0.9, 0.78, 0.64, 0.5, 0.36, 0.24],
    },
    technologies: [
      "Solidity",
      "Web3 workflows",
      "Backend services",
      "Transaction checks",
    ],
    problem:
      "A necessary operation carried high recurring fees, but removing it would have weakened product behavior and transaction visibility.",
    decision:
      "I reduced the number and cost of blockchain interactions while preserving settlement, records, and backend consistency.",
    proof: [
      "Critical product behavior preserved",
      "Backend and smart-contract state remained aligned",
      "Settlement and audit paths remained intact",
    ],
    engineeringNote: {
      constraint: "Reduce cost without weakening transaction integrity.",
      invariant:
        "Optimization could not break settlement or the audit trail.",
    },
    tags: ["web3", "performance", "backend", "security"],
    legacySlugs: [
      "cutting-gas-fees-on-a-critical-on-chain-operation",
    ],
  }),

  defineCase({
    index: 12,
    eyebrow: "Security & Trust",
    company: "Revision",
    role: "Backend and data engineer",
    title: "Fraud Signals Added to a Live Gaming Product",
    oneLiner:
      "Built a review pipeline that turned suspicious activity into actionable signals for product and operations.",
    metric: {
      prefix: "",
      value: 10,
      suffix: "%",
      label: "of activity flagged for review",
      points: [0.18, 0.3, 0.44, 0.58, 0.74, 0.86],
    },
    technologies: [
      "Backend services",
      "Data pipelines",
      "Realtime product systems",
      "Fraud signals",
    ],
    problem:
      "The business needed to distinguish genuine engagement from abuse without turning normal growth into noise.",
    decision:
      "I designed explainable fraud signals and integrated them into the teams responsible for investigation and response.",
    proof: [
      "Signals used by product and operations teams",
      "Suspicious activity became visible earlier",
    ],
    engineeringNote: {
      constraint:
        "Detect abuse without overwhelming reviewers with false positives.",
      invariant:
        "Each signal had to be understandable enough for human review.",
    },
    tags: ["data", "fraud", "backend", "product"],
    legacySlugs: [
      "adding-fraud-signals-to-a-realtime-gaming-product",
    ],
  }),

  defineCase({
    index: 13,
    eyebrow: "Applied AI",
    company: "Shahin",
    role: "Founder and applied AI engineer",
    title: "Offline AI Monitoring Built for On-Site Staff",
    oneLiner:
      "Converted camera activity into practical local reports without cloud inference.",
    metric: {
      prefix: "",
      value: 0,
      suffix: " cloud",
      label: "inference dependency",
      points: [0.86, 0.74, 0.58, 0.42, 0.28],
    },
    technologies: [
      "Computer vision",
      "CPU-only inference",
      "Offline-first systems",
      "Reporting workflows",
    ],
    problem:
      "Staff needed clear answers from security footage, while cloud processing would add cost, dependency, and privacy risk.",
    decision:
      "I built a CPU-only detection and reporting flow around the operational question that mattered: who entered, and when.",
    proof: [
      "Ran locally on ordinary CPU hardware",
      "Produced reports usable by non-technical staff",
      "Kept footage and processing on site",
    ],
    engineeringNote: {
      constraint: "Remain useful without cloud availability.",
      invariant:
        "Sensitive footage and results had to stay local and understandable.",
    },
    tags: ["ai", "product", "infra", "stakeholder", "ux"],
    legacySlugs: [
      "offline-security-monitoring-for-non-technical-staff",
    ],
  }),

  defineCase({
    index: 14,
    eyebrow: "Blockchain Products",
    company: "dTip",
    role: "Founder and full-stack Web3 engineer",
    title: "Non-Custodial Donation MVP Shipped",
    oneLiner:
      "Built the contracts, donor experience, public transaction view, and contributor documentation.",
    metric: {
      prefix: "",
      value: 1,
      suffix: " MVP",
      label: "end-to-end donation product",
      points: [0.2, 0.36, 0.52, 0.7, 0.86],
    },
    technologies: [
      "Smart contracts",
      "Web frontend",
      "Web3",
      "Documentation",
    ],
    problem:
      "Crypto donations were transparent in theory but still difficult for ordinary donors to use and recipients to verify.",
    decision:
      "I simplified the complete donation flow while preserving donor control and public transaction visibility.",
    proof: [
      "Released as an open-source product",
      "Smart contracts and web experience integrated",
      "Documentation written for users and contributors",
    ],
    engineeringNote: {
      constraint:
        "Simplify the experience without taking custody of funds.",
      invariant:
        "Donors had to retain control throughout the transaction.",
    },
    tags: ["web3", "fullstack", "product", "ux", "documentation"],
    legacySlugs: ["shipping-a-non-custodial-donation-mvp"],
  }),

  defineCase({
    index: 15,
    eyebrow: "Blockchain Products",
    company: "Khavar",
    role: "Technical co-founder",
    title: "Verifiable Car Customization MVP Built in 3 Months",
    oneLiner:
      "Owned requirements, product design, blockchain modeling, and delivery as technical co-founder.",
    metric: {
      prefix: "",
      value: 3,
      suffix: " months",
      label: "from requirements to solo MVP",
      points: [0.14, 0.3, 0.5, 0.7, 0.88],
    },
    technologies: [
      "Hyperledger Fabric",
      "Angular",
      "Permissioned blockchain",
      "Auditable workflows",
    ],
    problem:
      "Buyers had no independent way to verify whether promised customization work had reached each stage.",
    decision:
      "I modeled manufacturing milestones as verifiable state changes and built the complete system around that audit trail.",
    proof: [
      "Buyers could verify customization progress",
      "Each important state change became traceable",
      "End-to-end MVP delivered as a solo build",
    ],
    engineeringNote: {
      constraint:
        "Use blockchain only where shared auditability created value.",
      invariant:
        "Every customization milestone had to be traceable and verifiable.",
    },
    tags: ["blockchain", "backend", "fullstack", "compliance", "product"],
    legacySlugs: ["verifiable-car-customization-tracking"],
  }),

  defineCase({
    index: 16,
    eyebrow: "Security & Trust",
    company: "NEAR Threshold Signatures",
    role: "Open-source security contributor",
    title: "Critical Cryptography Risks Found and Fixed",
    oneLiner:
      "Improved security, portability, and performance in threshold-signature libraries.",
    metric: {
      prefix: "",
      value: 80,
      suffix: "x",
      label: "faster on one critical path",
      points: [0.18, 0.28, 0.44, 0.66, 0.84, 0.94],
    },
    technologies: [
      "Rust",
      "Cryptography",
      "Threshold signatures",
      "CI",
      "Formal verification",
    ],
    problem:
      "Small portability, memory, or failure-handling mistakes in cryptographic code can become serious security issues.",
    decision:
      "I prioritized correctness first, then performance, and backed changes with stronger typing, verification, and automated checks.",
    proof: [
      "Reported a vulnerability affecting big-endian systems",
      "Fixed denial-of-service and buffer-overflow risks",
      "Accelerated a critical cryptographic path by up to 80x",
    ],
    engineeringNote: {
      constraint: "Improve speed without weakening security properties.",
      invariant:
        "The code had to remain portable, memory-safe, and predictable under failure.",
    },
    tags: [
      "security",
      "cryptography",
      "reliability",
      "performance",
      "open_source",
    ],
    legacySlugs: ["hardening-threshold-signature-cryptography"],
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
