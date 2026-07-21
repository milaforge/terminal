import type { SampleWork } from "@types";

export type SelectedCaseMetric = {
  prefix: string;
  value: number;
  suffix: string;
  label: string;
  points: number[];
};

export type SelectedCase = SampleWork & {
  metric: SelectedCaseMetric;
};

export const SELECTED_CASES: SelectedCase[] = [
  {
    index: 1,
    title: "From Product Idea to Investor Demo in 10 Days",
    metric: {
      prefix: "",
      value: 10,
      suffix: " days",
      label: "to working investor demo",
      points: [0.18, 0.32, 0.52, 0.74, 0.9],
    },
    description: `A founder needed credible product demo before committing time and money to a larger build.

## Problem
- A raw product idea needed to become something investors and early users could evaluate.
- The full product surface was too large to build before validating the core flow.
- Moving too quickly could create a throwaway demo that had no useful path toward production.

## Failure mode
The team could spend months building secondary features before proving that the central product flow was understandable, useful, or worth funding.

## What changed
- Reduced the first release to the smallest surface needed for investor and user validation.
- Built a realistic full-stack MVP in 10 days rather than a static presentation.
- Implemented a cloud-native GCP backend and integrated the required third-party services.
- Kept explicit boundaries between temporary MVP shortcuts and components intended to survive beyond the demo.
- Defined service and deployment boundaries early enough to avoid unnecessary rework.

## Result
- A working investor demo was delivered in 10 days.
- Fundraising and user conversations could use a real product flow rather than an abstract idea.
- The technical structure could support further development without treating the entire MVP as disposable.

## Why it matters
The founder received evidence before making a larger investment. Engineering effort was directed toward the decision that mattered first: whether the product idea deserved a broader build.

## Technical details
- Stack: full-stack web application, GCP backend, third-party SaaS integrations
- Hardest constraint: Deliver credible proof quickly without creating entirely throwaway architecture

### Invariant
- The core product flow must be demonstrable within the fixed validation window
- Non-critical systems must not expand the first-release scope
- MVP shortcuts must remain visible and separated from longer-lived components

### Solution
Built one realistic end-to-end product path, integrated only the services required for that path, and kept the boundaries between validation code and production foundations explicit.

### Verification
A working demo was delivered in 10 days and used for investor and early product conversations.`,
    tags: ["fullstack", "product", "stakeholder"],
  },

  {
    index: 2,
    title: "Preparing an AI Product for Its First Real Users",
    metric: {
      prefix: "",
      value: 40,
      suffix: "%",
      label: "faster under expected load",
      points: [0.86, 0.72, 0.58, 0.42, 0.32],
    },
    description: `A pre-beta product worked as a prototype, but its delivery, failure handling, and operating paths were not ready for real users.

## Problem
- The React frontend and Python backend were approaching their first user onboarding.
- Input handling and API access needed stronger protection against obvious abuse.
- Failures were difficult for users to understand and difficult for operators to detect.
- Releases lacked a consistent path through development, staging, and production.
- Redundant API calls increased response time and backend load.

## Failure mode
The first real users could encounter silent errors, confusing failure states, preventable abuse, or deployment mistakes before the team had enough visibility to respond.

## What changed
- Reviewed the architecture and delivery pipeline for scalability, security, and operational risks.
- Added server-side validation and API rate limiting.
- Added caching to reduce redundant API calls and backend work.
- Replaced generic failures with actionable application-level messages.
- Added error tracking, metrics, logging, alerts, and baseline operational visibility.
- Introduced unit testing, continuous deployment, and separate development, staging, and production environments.
- Provided hands-on guidance across DevOps, refactoring, and development workflows without becoming a long-term team dependency.

## Result
- Lighthouse-measured response performance improved by roughly 40% under expected load.
- Deployment and testing paths became more consistent.
- The initial beta rollout completed with no major technical incidents reported.

## Why it matters
The product moved from “the demo works” toward “the team can safely operate this for users.” The work covered frontend behavior, backend controls, cloud delivery, observability, and team ownership.

## Technical details
- Stack: React, Python, Google Cloud, caching, CI/CD, monitoring and alerting
- Hardest constraint: Improve launch readiness across the whole stack without delaying the beta

### Invariant
- Invalid or abusive requests should be rejected by the backend
- Users should receive actionable feedback when an operation fails
- Operators should detect important failures before relying only on user reports
- Releases should move through controlled environments before production

### Solution
Hardened the request boundary, improved failure UX and performance, added operational visibility, and standardized testing and deployment across environments.

### Verification
Before-and-after Google Lighthouse measurements indicated roughly 40% lower response time under the tested conditions.`,
    tags: ["fullstack", "reliability", "observability", "devops"],
  },

  {
    index: 3,
    title: "Scaling a Realtime Gaming Platform Without Higher Hosting Costs",
    metric: {
      prefix: "",
      value: 10,
      suffix: "x",
      label: "throughput, same hosting cost",
      points: [0.14, 0.24, 0.42, 0.64, 0.82, 0.94],
    },
    description: `A realtime product needed to support thousands of concurrent users without allowing growth to turn into failed sessions and higher infrastructure cost.

## Problem
- Reliability was roughly 65% under the existing operating conditions.
- Increasing concurrency placed pressure on realtime traffic, matchmaking, and backend coordination.
- Simply adding servers would have increased hosting cost without correcting the underlying failure paths.
- Performance problems affected both user experience and product outcomes.

## Failure mode
Growth could increase packet loss, stalled work, failed user sessions, and operating cost at the same time.

## What changed
- Profiled the backend paths limiting concurrent-user capacity.
- Improved the highest-impact performance bottlenecks instead of increasing infrastructure by default.
- Worked with mobile and product teams to prioritize fixes with the greatest user impact.
- Validated the changes against production concurrency and hosting-cost outcomes.

## Result
- Backend throughput increased by roughly 10×.
- The system supported thousands of concurrent players without higher hosting cost.
- Reliability improved from roughly 65% to 92%.

## Why it matters
The company could accept growth without treating every increase in traffic as a matching increase in infrastructure spending. Reliability and capacity improved together rather than being traded against each other.

## Technical details
- Scope: realtime backend performance, concurrency, and infrastructure efficiency
- Hardest constraint: Support thousands of concurrent users without increasing hosting costs

### Invariant
- The backend must remain operational as concurrency rises
- One overloaded path should not destabilize unrelated parts of the system
- Increased throughput should not require proportional infrastructure growth
- User completion reliability should improve rather than regress

### Solution
Profiled and improved the backend paths limiting concurrency, worked with mobile and product teams to prioritize the highest-impact fixes, and increased throughput roughly 10× for thousands of concurrent users without raising hosting costs.

### Verification
Backend throughput increased by roughly 10×, supporting thousands of concurrent users without higher hosting costs.`,
    tags: ["backend", "performance", "reliability", "stakeholder"],
  },

  {
    index: 4,
    title: "Reducing AWS Costs by 60% Without Slowing the Product",
    metric: {
      prefix: "",
      value: 60,
      suffix: "%",
      label: "less AWS spend, performance held",
      points: [0.9, 0.8, 0.68, 0.54, 0.4, 0.3],
    },
    description: `The company needed more financial runway, but reducing AWS spending could not come at the cost of slower or less reliable service.

## Problem
- The existing AWS architecture included unnecessary cost and operational waste.
- Workloads with different traffic patterns were being supported by an inefficient infrastructure shape.
- Capacity decisions were not sufficiently aligned with actual demand.
- Blind cost cutting could reduce the bill while creating latency or availability problems.

## Failure mode
The company could gain runway on paper while quietly moving the cost into production incidents, slower user experiences, or emergency infrastructure work.

## What changed
- Reviewed AWS usage and identified unnecessary infrastructure and overprovisioned services.
- Simplified the backend architecture and removed resources that were not supporting a measured operating need.
- Tuned services and capacity around actual workload behavior.
- Checked application performance while applying the cost reductions.

## Result
Monthly AWS spending fell by approximately 60% after architecture simplification and service tuning, without a reported performance regression.

## Why it matters
The business gained more runway without weakening the product customers depended on. This was risk-adjusted efficiency: removing capacity and complexity that were not earning their cost while preserving the system's required behavior.

## Technical details
- Stack: AWS, service tuning, workload separation, asynchronous processing, scalable execution paths
- Hardest constraint: Reduce infrastructure spending sharply without creating a reliability or performance regression

### Invariant
- Cost reduction must not create a user-visible performance regression
- Burst traffic must not require permanent overprovisioning
- Infrastructure changes must be evaluated against both cost and operating behavior
- Simplification must not remove required recovery or scaling capacity

### Solution
Mapped infrastructure to workload behavior, removed unnecessary capacity and architectural waste, tuned services, and preserved the paths needed to handle production demand.

### Verification
AWS billing showed an approximately 60% reduction in monthly infrastructure spending while application performance remained protected.`,
    tags: ["infra", "performance", "reliability"],
  },

  {
    index: 5,
    title: "Protecting $4M in Live Digital Assets",
    metric: {
      prefix: "$",
      value: 4,
      suffix: "M",
      label: "assets protected, zero incidents",
      points: [0.54, 0.52, 0.55, 0.53, 0.56, 0.55],
    },
    description: `A financial platform needed to continue changing its smart contracts and backend services while protecting live customer assets.

## Problem
- The platform managed roughly $4M in on-chain client assets.
- Contract and backend changes affected deposits, withdrawals, launchpad transactions, and ledger integrity.
- Manual release practices increased the risk of regressions reaching production.
- Security findings needed to be translated into concrete engineering changes rather than remaining audit documents.

## Failure mode
A faulty contract or backend release could affect customer balances, disrupt financial workflows, weaken ledger integrity, or create an irreversible loss.

## What changed
- Maintained and hardened the smart contracts and backend services responsible for financial workflows.
- Added automated testing and CI/CD to catch regressions earlier and reduce manual release errors.
- Strengthened checks around contract and transaction behavior.
- Preserved consistency between on-chain payment flows and backend ledger handling.
- Worked with external auditors and translated findings into concrete contract and backend changes.
- Improved operational visibility around security-sensitive production behavior.

## Result
- Roughly $4M in client assets were safeguarded over approximately three years.
- No security incidents were recorded during that period.
- The product achieved a 9/10 external security audit score.
- The team continued shipping improvements while retaining ownership of the financial system.

## Why it matters
The business could improve a live financial platform without treating every release as an uncontrolled bet. Security became part of implementation, testing, delivery, and audit remediation.

## Technical details
- Stack: Solidity, backend services, payment and ledger workflows, automated tests, CI/CD
- Hardest constraint: Continue shipping changes while protecting live customer funds and transaction integrity

### Invariant
- Contract and backend changes must not create loss-of-funds conditions
- Deposits, withdrawals, and ledger records must remain consistent
- Security regressions should be caught before reaching production
- Audit findings must result in verifiable engineering changes

### Solution
Combined contract and backend hardening, automated testing, controlled delivery, ledger-aware transaction handling, and direct remediation of external audit findings.

### Verification
The platform operated for roughly three years with approximately $4M in safeguarded client assets, zero recorded security incidents, and a 9/10 external security audit result.`,
    tags: ["security", "reliability", "payments", "devops"],
  },

  {
    index: 6,
    title: "Automating Three Hours of Daily Security Operations",
    metric: {
      prefix: "",
      value: 3,
      suffix: " hrs",
      label: "reclaimed every day",
      points: [0.9, 0.76, 0.6, 0.46, 0.34, 0.26],
    },
    description: `Security analysts were spending a large part of each day on repetitive operational checks instead of investigation and prevention.

## Problem
- Routine security operations consumed roughly three hours of analyst time each day.
- Repetitive manual work increased the chance of inconsistency and human error.
- Vulnerabilities were more expensive to address when discovered late in development.
- Security requirements were difficult for development teams to apply without practical guidance.

## Failure mode
Important risks could remain behind repetitive work while analysts had less time for investigation, and developers could receive security feedback only after implementation was nearly complete.

## What changed
- Automated repetitive SecOps checks and operational tasks.
- Standardized recurring work so results depended less on manual repetition.
- Shifted vulnerability identification and communication earlier into the software development lifecycle.
- Worked with development teams to resolve issues before production.
- Converted complex security requirements into practical guidelines and tools engineers could use directly.

## Result
- Roughly three hours of analyst time were reclaimed each day.
- Human error exposure in repetitive checks was reduced.
- Development teams received security feedback earlier.
- Security knowledge became easier to apply without constant direct support.

## Why it matters
Repetitive work was automated so analysts could spend more time on investigation, while development teams received security findings earlier and in a more usable form.

## Technical details
- Stack: security automation, repeatable operational checks, SDLC security controls, engineering guidelines
- Hardest constraint: Reduce repetitive work without hiding important security signals or removing human judgment

### Invariant
- Repetitive checks should produce consistent results
- Security findings should reach developers before production
- Automation should reduce routine work rather than hide relevant findings
- Guidance should be practical enough for development teams to apply

### Solution
Automated repeatable security operations, moved vulnerability feedback earlier in development, and created practical tools and guidance for engineering teams.

### Verification
The automated workflow reclaimed approximately three hours per day while earlier security review and practical engineering guidance remained part of the process.`,
    tags: ["security", "automation", "enablement", "stakeholder"],
  },
];

const metricsByTitle = new Map(
  SELECTED_CASES.map((item) => [item.title, item.metric]),
);

export function getSelectedCaseMetric(
  item: SampleWork,
  fallbackIndex: number,
): SelectedCaseMetric {
  return (
    metricsByTitle.get(item.title) || {
      prefix: "",
      value: fallbackIndex + 1,
      suffix: "",
      label: "case study",
      points: [0.35, 0.5, 0.42, 0.62],
    }
  );
}
