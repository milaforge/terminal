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
    eyebrow: "Product Building",
    company: "Early-stage founder",
    role: "Product engineer",
    title: "Investor Demo Shipped in 10 Days",
    oneLiner:
      "Built the smallest convincing version of the product before the founder committed to a larger investment.",
    metric: {
      prefix: "",
      value: 10,
      suffix: " days",
      label: "from idea to working demo",
      points: [0.18, 0.32, 0.52, 0.74, 0.9],
    },
    technologies: ["GCP", "Full-stack web app", "Third-party integrations"],
    problem:
      "The founder needed evidence that the idea could work before spending months building the complete product.",
    decision:
      "I focused the first release on one complete, demonstrable customer journey and avoided features that would not strengthen the validation.",
    proof: [
      "Working demo shipped in 10 days",
      "Used in investor and early-customer conversations",
      "Core foundations remained usable for the next release",
    ],
    engineeringNote: {
      constraint: "Create credible proof within a fixed 10-day window.",
      invariant:
        "The main customer journey had to work from beginning to end.",
    },
    tags: ["fullstack", "product", "stakeholder"],
    legacySlugs: [
      "from-product-idea-to-investor-demo-in-10-days",
      "building-too-much-before-proving-the-product",
    ],
  }),

  defineCase({
    index: 2,
    eyebrow: "Scale & Efficiency",
    title: "AI Product Prepared for Its First Real Users",
    company: "Pre-beta AI product",
    role: "Product reliability engineer",
    oneLiner:
      "Made the product faster, safer to release, and easier to operate before its public beta.",
    metric: {
      prefix: "",
      value: 40,
      suffix: "%",
      label: "faster under tested demand",
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
      "The prototype worked in demonstrations, but errors, repeated requests, unsafe traffic, and unreliable releases could create problems for real users.",
    decision:
      "I added safeguards, reduced unnecessary work, improved error messages, introduced monitoring, automated releases, and separated test and live environments.",
    proof: [
      "Roughly 40% faster under tested demand",
      "Initial beta launched without major reported technical incidents",
      "Safer, controlled releases across development, staging, and production",
    ],
    engineeringNote: {
      constraint: "Improve readiness without delaying the planned beta.",
      invariant:
        "Bad or abusive requests had to be stopped before consuming expensive resources.",
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
    eyebrow: "Scale & Efficiency",
    title: "Supported 10x More Activity at the Same Hosting Cost",
    company: "Realtime gaming platform",
    role: "Backend performance engineer",
    oneLiner:
      "Removed the system bottlenecks limiting growth instead of solving the problem by buying more servers.",
    metric: {
      prefix: "",
      value: 10,
      suffix: "x",
      label: "more backend capacity",
      points: [0.14, 0.24, 0.42, 0.64, 0.82, 0.94],
    },
    technologies: [
      "Realtime backend",
      "Concurrency profiling",
      "Mobile coordination",
    ],
    problem:
      "Growing usage was overloading important parts of the platform, while adding servers would have increased cost without fixing the underlying limits.",
    decision:
      "I measured where requests were slowing or failing, then fixed the small number of paths controlling the platform's overall capacity.",
    proof: [
      "Roughly 10x more backend capacity",
      "Reliability improved from about 65% to 92%",
      "Thousands of concurrent users supported without higher hosting cost",
    ],
    engineeringNote: {
      constraint:
        "Support growth without making infrastructure cost rise at the same rate.",
      invariant:
        "One overloaded feature should not disrupt unrelated parts of the product.",
    },
    tags: ["backend", "performance", "reliability", "stakeholder"],
    legacySlugs: [
      "scaling-a-realtime-platform-without-higher-hosting-costs",
      "growth-was-breaking-the-product",
    ],
  }),

  defineCase({
    index: 4,
    eyebrow: "Scale & Efficiency",
    title: "AWS Spend Reduced by 60%",
    company: "Cost-sensitive software company",
    role: "Cloud infrastructure engineer",
    oneLiner:
      "Reduced unnecessary cloud spending while protecting product speed and reliability.",
    metric: {
      prefix: "",
      value: 60,
      suffix: "%",
      label: "lower monthly AWS spend",
      points: [0.9, 0.8, 0.68, 0.54, 0.4, 0.3],
    },
    technologies: ["AWS", "Service tuning", "Asynchronous processing"],
    problem:
      "Cloud costs had grown beyond what the business needed, but indiscriminate cuts could have made the product slower or less reliable.",
    decision:
      "I compared infrastructure usage with actual demand, removed waste, tuned services, and reorganized expensive workloads.",
    proof: [
      "Approximately 60% lower monthly AWS spend",
      "Product performance protected during the reduction",
      "Cloud resources better matched real usage",
    ],
    engineeringNote: {
      constraint:
        "Cut spending sharply without creating outages or slower customer experiences.",
      invariant: "Every saving had to preserve user-visible performance.",
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
    title: "$4M in Live Assets Protected",
    company: "Financial platform",
    role: "Financial systems and security engineer",
    oneLiner:
      "Strengthened the systems handling customer funds while the product continued to evolve.",
    metric: {
      prefix: "$",
      value: 4,
      suffix: "M",
      label: "protected with zero recorded incidents",
      points: [0.54, 0.52, 0.55, 0.53, 0.56, 0.55],
    },
    technologies: [
      "Solidity",
      "Backend services",
      "Payment workflows",
      "CI/CD",
    ],
    problem:
      "The company needed to keep releasing improvements even though a mistake in the payment or contract systems could affect customer funds.",
    decision:
      "I added checks around transactions, releases, account records, security findings, and production behavior so failures could be prevented or detected early.",
    proof: [
      "Roughly $4M in live assets safeguarded",
      "Zero recorded security incidents over about three years",
      "9/10 external security audit score",
    ],
    engineeringNote: {
      constraint:
        "Continue shipping changes while protecting live customer funds.",
      invariant:
        "Deposits, withdrawals, and account records had to remain consistent after every release.",
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
    title: "Security Team Saved Three Hours Every Day",
    company: "Security operations team",
    role: "Security automation engineer",
    oneLiner:
      "Automated repetitive security checks so specialists could spend more time on work requiring judgment.",
    metric: {
      prefix: "",
      value: 3,
      suffix: " hrs",
      label: "saved every working day",
      points: [0.9, 0.76, 0.6, 0.46, 0.34, 0.26],
    },
    technologies: [
      "Security automation",
      "Development controls",
      "Operational checks",
    ],
    problem:
      "Skilled analysts were spending hours on repeatable checks, while developers often received useful security feedback too late.",
    decision:
      "I standardized the recurring work, automated consistent results, and translated complex security requirements into clear actions for developers.",
    proof: [
      "Roughly three analyst hours reclaimed each day",
      "Less exposure to human error in repetitive checks",
      "Earlier and clearer security feedback for developers",
    ],
    engineeringNote: {
      constraint:
        "Save time without hiding important findings or removing human judgment.",
      invariant:
        "Automation had to remove repetitive work, not silence meaningful risks.",
    },
    tags: ["security", "automation", "enablement", "stakeholder"],
    legacySlugs: [
      "automating-three-hours-of-daily-security-operations",
      "skilled-people-were-buried-in-repetitive-work",
    ],
  }),

  defineCase({
    index: 7,
    eyebrow: "Product Building",
    title: "Community Platform Built from Scratch",
    company: "Block by Block",
    role: "Senior product engineer",
    oneLiner:
      "Built the customer product, admin tools, backend, cloud infrastructure, and release process for a new community platform.",
    metric: {
      prefix: "",
      value: 2,
      suffix: " products",
      label: "customer and admin areas separated",
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
      "The platform needed to support frequent member activity without giving ordinary product traffic access to sensitive administrative operations.",
    decision:
      "I separated the customer and admin systems, created a traceable record of value movements, improved high-traffic rankings with caching, and kept releases independently controllable.",
    proof: [
      "Built from scratch toward pre-beta",
      "Separate customer dashboard and admin panel",
      "Sensitive admin actions isolated and recorded for review",
    ],
    engineeringNote: {
      constraint:
        "Move quickly without mixing sensitive admin work into general customer traffic.",
      invariant:
        "Customer actions, admin actions, and value records had to remain separate and traceable.",
    },
    tags: ["fullstack", "backend", "product", "infra", "security"],
    legacySlugs: ["building-bbb-from-scratch-into-pre-beta"],
  }),

  defineCase({
    index: 8,
    eyebrow: "Applied AI",
    title: "Telegram Community Assistant Prepared for Alpha",
    company: "SEE / CommunityPulse",
    role: "AI product and reliability engineer",
    oneLiner:
      "Built a controlled workflow that turns community activity into reports, recommendations, approved actions, and measurable results.",
    metric: {
      prefix: "",
      value: 1,
      suffix: " loop",
      label: "from activity to action to results",
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
      "Community managers needed useful guidance from noisy conversations, but unchecked AI replies could damage trust or create unwanted actions.",
    decision:
      "I kept important actions under human approval, made normal work available through a simple admin interface, added predictable fallbacks, restricted sensitive access, and included emergency controls.",
    proof: [
      "Core alpha workflow implemented from activity collection to follow-up",
      "Reports, AI guidance, admin access, and Telegram data collection connected",
      "Human approval and predictable fallbacks reduced early-stage risk",
    ],
    engineeringNote: {
      constraint:
        "Make AI useful without allowing it to act beyond an administrator's approval.",
      invariant:
        "Every recommendation had to lead to one realistic action and one measurable result.",
    },
    tags: ["ai", "fullstack", "reliability", "product", "stakeholder"],
    legacySlugs: [
      "stabilizing-communitypulse-alpha-for-telegram-admins",
    ],
  }),

  defineCase({
    index: 9,
    eyebrow: "Product Building",
    title: "Security Platform Built from Scratch",
    company: "BugDasht",
    role: "Founding engineer",
    oneLiner:
      "Turned a founder's security product idea into a working platform used by real customers.",
    metric: {
      prefix: "",
      value: 1,
      suffix: " product",
      label: "from idea to customer use",
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
      "The founder needed a dependable product rather than a temporary prototype, in a market where customers expected clear records and trustworthy behavior.",
    decision:
      "I owned the backend, infrastructure, database, integrations, reports, activity records, and security-sensitive workflows while partnering on the interface.",
    proof: [
      "Laravel/PHP product built from scratch",
      "Delivered into real customer use",
      "Traceable activity and reporting added for regulatory expectations",
    ],
    engineeringNote: {
      constraint:
        "Turn demanding security requirements into workflows customers could actually use.",
      invariant:
        "Important customer actions needed a clear and reviewable history.",
    },
    tags: ["security", "backend", "fullstack", "product", "stakeholder"],
    legacySlugs: [
      "building-bugdasht-from-scratch-to-customer-use",
    ],
  }),

  defineCase({
    index: 10,
    eyebrow: "Product Building",
    title: "Three Core Banking Systems Delivered",
    company: "Saman Bank",
    role: "Software engineer",
    oneLiner:
      "Built and maintained important parts of a regulated banking product from its early version through its first full release.",
    metric: {
      prefix: "",
      value: 3,
      suffix: " systems",
      label: "delivered inside core banking",
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
      "A large banking system needed new capabilities and ongoing maintenance under strict operational and regulatory constraints.",
    decision:
      "I built three subsystems, maintained existing services, developed integrations, and learned to make careful changes inside a large production codebase.",
    proof: [
      "Three ASP.NET/C# banking subsystems built",
      "Contributed from MVP through version one",
      "Worked with Oracle, DB2, and a large engineering team",
    ],
    engineeringNote: {
      constraint:
        "Deliver changes in an environment where small mistakes could create operational risk.",
      invariant:
        "New work had to remain compatible with established banking processes and systems.",
    },
    tags: ["backend", "compliance", "fullstack"],
    legacySlugs: [
      "building-core-banking-subsystems-as-early-production-training",
    ],
  }),

  defineCase({
    index: 11,
    eyebrow: "Scale & Efficiency",
    title: "Transaction Fees Cut by 99%",
    company: "VENT Finance",
    role: "Web3 backend and smart contract engineer",
    oneLiner:
      "Redesigned an expensive blockchain operation while preserving the business function it supported.",
    metric: {
      prefix: "",
      value: 99,
      suffix: "%",
      label: "lower fees on a critical operation",
      points: [0.9, 0.78, 0.64, 0.5, 0.36, 0.24],
    },
    technologies: [
      "Solidity",
      "Web3 workflows",
      "Backend services",
      "Transaction checks",
    ],
    problem:
      "A necessary blockchain operation created high recurring fees, but removing it would have weakened the product.",
    decision:
      "I reduced the number and cost of blockchain interactions while keeping the required transaction behavior and records intact.",
    proof: [
      "Approximately 99% reduction in transaction fees",
      "Critical product operation preserved",
      "Backend and blockchain behavior kept consistent",
    ],
    engineeringNote: {
      constraint:
        "Reduce fees without hiding important changes or weakening transaction safety.",
      invariant:
        "The settlement and review history had to remain correct after optimization.",
    },
    tags: ["web3", "performance", "backend", "security"],
    legacySlugs: [
      "cutting-gas-fees-on-a-critical-on-chain-operation",
    ],
  }),

  defineCase({
    index: 12,
    eyebrow: "Security & Trust",
    title: "Fraud Detection Added to a Live Product",
    company: "Revision",
    role: "Backend and data engineer",
    oneLiner:
      "Built an early-warning system that helped the team identify suspicious activity inside a busy gaming product.",
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
      "The business needed to separate genuine customer activity from abuse without slowing down the live experience.",
    decision:
      "I built a system that surfaced likely fraud and worked with product and operations so the signals could support real decisions.",
    proof: [
      "About 10% of activity identified as likely fraudulent",
      "Signals used by product and operations teams",
      "Earlier visibility into abuse within a high-traffic product",
    ],
    engineeringNote: {
      constraint:
        "Find suspicious behavior without treating normal customer growth as fraud.",
      invariant:
        "Every signal had to be understandable and useful enough for a person to review.",
    },
    tags: ["data", "fraud", "backend", "product"],
    legacySlugs: [
      "adding-fraud-signals-to-a-realtime-gaming-product",
    ],
  }),

  defineCase({
    index: 13,
    eyebrow: "Applied AI",
    title: "Offline Security Monitoring Built for Staff",
    company: "Shahin",
    role: "Founder and applied AI engineer",
    oneLiner:
      "Turned security-camera activity into practical reports without sending footage to cloud AI services.",
    metric: {
      prefix: "",
      value: 0,
      suffix: " cloud",
      label: "AI processing required",
      points: [0.86, 0.74, 0.58, 0.42, 0.28],
    },
    technologies: [
      "Computer vision",
      "CPU-only inference",
      "Offline-first systems",
      "Reporting workflows",
    ],
    problem:
      "Local staff needed useful answers from camera footage, while cloud processing would add cost, dependency, and privacy concerns.",
    decision:
      "I built a local detection and reporting system, then shaped it around the question staff actually needed answered: who entered, and when.",
    proof: [
      "Offline computer-vision system built for ordinary computers",
      "No dependency on cloud AI processing",
      "Custom reports made usable for non-technical staff",
    ],
    engineeringNote: {
      constraint:
        "Provide useful monitoring without depending on cloud availability.",
      invariant:
        "Sensitive footage and results had to remain local, practical, and understandable.",
    },
    tags: ["ai", "product", "infra", "stakeholder", "ux"],
    legacySlugs: [
      "offline-security-monitoring-for-non-technical-staff",
    ],
  }),

  defineCase({
    index: 14,
    eyebrow: "Blockchain Products",
    title: "Transparent Crypto Donation MVP Shipped",
    company: "dTip",
    role: "Founder and full-stack Web3 engineer",
    oneLiner:
      "Built an open-source donation product that kept donors in control and made transactions publicly verifiable.",
    metric: {
      prefix: "",
      value: 1,
      suffix: " MVP",
      label: "contracts, website, and donation flow",
      points: [0.2, 0.36, 0.52, 0.7, 0.86],
    },
    technologies: [
      "Smart contracts",
      "Web frontend",
      "Web3",
      "Documentation",
    ],
    problem:
      "Crypto donations can be transparent, but the process is often intimidating for donors and difficult for recipients to explain or verify.",
    decision:
      "I connected the donation experience, blockchain contracts, public transaction visibility, website, and documentation into one simple product.",
    proof: [
      "Open-source donation product built",
      "Blockchain contracts and web interface connected",
      "Documentation written for users and contributors",
    ],
    engineeringNote: {
      constraint:
        "Keep the experience simple without taking control of donor funds.",
      invariant:
        "The donation process had to preserve transparency and user ownership.",
    },
    tags: ["web3", "fullstack", "product", "ux", "documentation"],
    legacySlugs: ["shipping-a-non-custodial-donation-mvp"],
  }),

  defineCase({
    index: 15,
    eyebrow: "Blockchain Products",
    title: "Car Customization MVP Built in 3 Months",
    company: "Khavar",
    role: "Technical co-founder",
    oneLiner:
      "Built a system that let buyers verify each stage of a vehicle customization process instead of relying only on dealer promises.",
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
      "Customers had no independent way to verify whether promised customization work had actually reached each stage.",
    decision:
      "I recorded manufacturing and customization milestones as verifiable events and built the complete product from requirements to working MVP.",
    proof: [
      "Solo MVP built in about three months",
      "Customization progress made verifiable",
      "Important changes recorded on Hyperledger Fabric",
    ],
    engineeringNote: {
      constraint:
        "Use blockchain only where a permanent, shared record created real value.",
      invariant:
        "Every important customization milestone had to be traceable and verifiable.",
    },
    tags: ["blockchain", "backend", "fullstack", "compliance", "product"],
    legacySlugs: ["verifiable-car-customization-tracking"],
  }),

  defineCase({
    index: 16,
    eyebrow: "Security & Trust",
    title: "Critical Cryptography Risks Found and Fixed",
    company: "NEAR Threshold Signatures",
    role: "Open-source security contributor",
    oneLiner:
      "Found and fixed security, stability, and performance problems in software responsible for sensitive cryptographic operations.",
    metric: {
      prefix: "",
      value: 80,
      suffix: "x",
      label: "faster on one critical operation",
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
      "Small mistakes in cryptographic software can create security failures, crashes, or incorrect behavior across different systems.",
    decision:
      "I reported a portability vulnerability, fixed denial-of-service and memory-safety risks, reduced side-channel exposure, strengthened type safety, contributed verification work, and added automated checks.",
    proof: [
      "Reported a cryptographic vulnerability affecting big-endian systems",
      "Fixed denial-of-service and buffer-overflow risks",
      "Improved performance on a critical cryptographic operation",
    ],
    engineeringNote: {
      constraint:
        "Improve speed without weakening security or correctness.",
      invariant:
        "The software had to behave safely and consistently across supported systems.",
    },
    tags: [
      "security",
      "cryptography",
      "reliability",
      "performance",
      "open_source",
    ],
    legacySlugs: [
      "hardening-threshold-signature-cryptography",
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
