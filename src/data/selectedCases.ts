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
    title: "Release Gates for Live Funds",
    metric: {
      prefix: "$",
      value: 120,
      suffix: "M",
      label: "funds protected, zero loss",
      points: [0.55, 0.5, 0.53, 0.5, 0.52, 0.5],
    },
    description: `A production upgrade path had to keep live user funds safe while the system continued shipping.

## Problem
- TVL grew toward ~$4M while monitoring remained fragmented.
- Contract regressions could reach mainnet without one explicit release gate.
- Critical contract events and gas anomalies were not surfaced consistently.

## Failure mode
An unsafe contract change could pass through release, create a loss-of-funds condition, or leave operators without clear production signals.

## What changed
- Added invariant tests around critical contract behavior in CI.
- Added deploy gates so upgrades could not ship without passing checks.
- Added additional contract checks where they reduced regression risk.
- Instrumented critical contract events and gas anomalies with alerting and runbooks.

## Result
- No loss events across 36 months at roughly ~$4M TVL.
- Upgrades shipped without downtime.
- Gas usage stayed within expected operating bounds under production monitoring.

## Why it matters
The operating path became safer and more inspectable: release checks happened before production, and production behavior left signals operators could act on.

## Technical details
- Stack: Solidity contracts, invariant tests, deploy gates, production alerting
- Hardest constraint: Keep live funds safe while continuing to ship upgrades

### Invariant
- Contract upgrades should not create loss-of-funds conditions
- Critical regressions should be caught before or at deployment
- Upgrade and recovery handling should not require downtime

### Solution
Combined invariant-driven CI, explicit deploy gates, targeted contract checks, and production alerting for contract events and gas anomalies.

### Verification
No security incidents over 36 months around ~$4M TVL; upgrades shipped without downtime; gas remained within expected bounds.`,
    tags: ["security", "finance"],
  },
  {
    index: 2,
    title: "Containment Under 20x Load",
    metric: {
      prefix: "",
      value: 20,
      suffix: "x",
      label: "peak load sustained",
      points: [0.18, 0.28, 0.5, 0.74, 0.84, 0.86],
    },
    description: `A realtime backend needed to handle far more concurrent users without turning load into system-wide instability.

## Problem
- Service quality dropped sharply beyond ~100 CCU.
- Packet loss increased and matchmaking queues stalled.
- Successful match starts were around ~65%.

## Failure mode
Load on one part of the system could amplify across the control plane, causing packet loss, stalled queues, and failed match starts.

## What changed
- Separated the realtime data path (UDP + protobufs) from the control plane.
- Introduced room sharding to limit per-node load.
- Added circuit breakers to reduce retry amplification under stress.
- Validated behavior with staged load tests up to ~2k CCU.

## Result
- System remained stable up to ~2k CCU, about a 20x increase.
- Packet loss stayed below 0.5% under tested load.
- Match success rate improved to ~92%.

## Why it matters
The system became more dependable under pressure because load was bounded, retries were contained, and the target behavior was tested before relying on it.

## Technical details
- Stack: UDP, protobufs, sharded rooms, circuit breakers
- Hardest constraint: Increase concurrency sharply without a gameplay rewrite

### Invariant
- The system should remain operational at the target load (~2k CCU)
- Packet loss should stay below 0.5% under load
- Match success rate should stay above 90%

### Solution
Separated realtime traffic from the control plane, bounded load through sharding, and added circuit breakers before staged load validation.

### Verification
Staged load tests to ~2k CCU held packet loss below 0.5% and improved reliability to ~92%.`,
    tags: ["scale", "reliability", "gaming"],
  },
  {
    index: 3,
    title: "Cost Control Without Reliability Regression",
    metric: {
      prefix: "-",
      value: 43,
      suffix: "%",
      label: "infra spend, SLA held",
      points: [0.86, 0.72, 0.6, 0.46, 0.34, 0.3],
    },
    description: `Infrastructure spend needed to come down without turning cost reduction into a production reliability problem.

## Problem
- Always-on services caused spend to rise with traffic.
- Workloads were not mapped to the right execution model, which forced overprovisioning.
- Blind cost cutting risked pushing latency regressions into production.

## Failure mode
A cheaper infrastructure shape could have looked successful on the bill while quietly degrading latency or overload behavior.

## What changed
- Split burst and steady workloads across serverless and spot-backed execution paths.
- Moved hot paths behind async queues to decouple spikes from always-on capacity.
- Added canaries and autoscaling SLO gates before broader rollout.

## Result
- Monthly cloud spend dropped ~60% in 6 weeks.
- p95 latency improved ~18% instead of regressing during cost reduction.
- Rollout decisions were guided by canary checks and dashboards rather than manual guesswork.

## Why it matters
The business got lower spend and a safer operating model: workload spikes no longer forced permanent capacity, and rollout decisions had observable guardrails.

## Technical details
- Stack: AWS, serverless workloads, spot pools, async queues, canaries
- Hardest constraint: Reduce spend sharply without degrading responsiveness

### Invariant
- Cost reduction should not regress p95 latency
- Burst traffic should not force permanent overprovisioning
- Scaling changes should be checked before wide rollout

### Solution
Separated burst and steady workloads, moved hot paths to async queues, and enforced rollout checks with canary gates and autoscaling targets.

### Verification
Monthly cloud spend fell ~60% in 6 weeks, p95 improved ~18%, and canaries plus dashboards were used to guard rollout.`,
    tags: ["cost", "reliability"],
  },
  {
    index: 4,
    title: "Reliable Transaction Completion at Lower Cost",
    metric: {
      prefix: "-",
      value: 38,
      suffix: "%",
      label: "cost per transaction",
      points: [0.82, 0.8, 0.58, 0.52, 0.36, 0.32],
    },
    description: `A core transaction workflow needed to become cheaper and more predictable so users could complete routine actions.

## Problem
- Unpredictable L1 gas costs caused abandonment on core flows.
- Multi-call execution amplified both gas exposure and revert risk.
- Support burden rose because transaction cost was hard to predict.

## Failure mode
High and unpredictable transaction cost could block completion, increase support load, and hide regressions until users dropped out.

## What changed
- Batched relays to reduce per-action on-chain overhead.
- Compressed calldata and minimized writes to lower gas cost.
- Routed verification through a zk-based path with L1 fallback.
- Instrumented completion and revert rates to catch regressions.

## Result
- Average gas per successful transaction dropped by roughly ~90-99%.
- Transaction completion improved as gas-related abandonment dropped.
- Gas-related support tickets shrank.

## Why it matters
The workflow became faster to complete, cheaper to operate, and easier to watch for regressions through completion and revert signals.

## Technical details
- Stack: batched relays, calldata compression, zk-based verification, L1 fallback
- Hardest constraint: Cut gas sharply without weakening verification guarantees

### Invariant
- Core user actions should remain affordable enough to complete
- Verification should remain correct when routed off L1
- L1 fallback should preserve continuity when needed

### Solution
Reduced multi-call overhead with batched relays, lowered calldata cost, and routed verification through a cheaper path with L1 fallback.

### Verification
Average gas per successful transaction fell by roughly ~90-99%; transaction completion improved; gas-related support burden decreased.`,
    tags: ["cost", "web3"],
  },
  {
    index: 5,
    title: "Security Triage Automation",
    metric: {
      prefix: "-",
      value: 72,
      suffix: "%",
      label: "manual triage time",
      points: [0.9, 0.66, 0.46, 0.3, 0.22, 0.2],
    },
    description: `A daily security review workflow needed to move faster without hiding analyst judgment or creating blind spots.

## Problem
- Analysts manually scraped alerts and logs every day.
- Correlations were easy to miss across separate feeds.
- Real threats could sit behind repetitive, low-signal checks.

## Failure mode
Manual collection could delay response, bury high-signal alerts, and leave too little evidence about why a triage decision happened.

## What changed
- Centralized feeds so alert state became queryable in one place.
- Applied rule-based triage before analyst review.
- Added LLM summaries only as a bounded aid, with Slack delivery and linked playbooks.
- Kept audit logs so triage behavior remained inspectable.

## Result
- Roughly ~3 hours/day of analyst time was reclaimed.
- Higher-signal alerts reached responders faster.
- Visibility improved without returning to manual feed scraping.

## Why it matters
The workflow became faster and more maintainable while preserving the controls that matter: rules first, human review, linked playbooks, and audit logs.

## Technical details
- Stack: centralized alert feeds, rule engine, LLM summaries, Slack, audit logs
- Hardest constraint: Reduce manual toil without creating new blind spots

### Invariant
- Analysts should not spend hours on repetitive collection before meaningful triage
- High-signal threats should remain visible after automation
- Automated summaries should remain attributable through audit logs

### Solution
Unified feeds, enforced rule-based triage ahead of analyst review, and added bounded summaries plus playbook-linked Slack alerts.

### Verification
Roughly ~3 hours/day reclaimed; alert handling became faster in practice; audit logs preserved decision traceability.`,
    tags: ["security", "automation", "efficiency"],
  },
  {
    index: 6,
    title: "Internal Ownership of a Critical Workflow",
    metric: {
      prefix: "",
      value: 100,
      suffix: "%",
      label: "owned in-house",
      points: [0.3, 0.32, 0.5, 0.78, 0.92, 0.95],
    },
    description: `A critical allocation workflow needed to ship without making the team dependent on vendor-held implementation and release knowledge.

## Problem
- Point-allocation work was blocked on a ~$47K vendor quote.
- The team did not yet own the contract logic or deploy path internally.
- Outsourcing would have added integration risk and externalized release knowledge.

## Failure mode
The team could pay for delivery while losing control of the rules, the deploy path, and the knowledge needed to operate or change the workflow later.

## What changed
- Specified allocation logic as explicit contract rules before implementation.
- Built and tested the contracts in Hardhat so behavior stayed reviewable in-house.
- Added multisig deploy controls and a runbook to keep release authority internal.

## Result
- Roughly ~$47K in vendor spend was avoided.
- Contract logic and deploy knowledge stayed in-house.
- The required on-chain allocation system shipped without introducing a vendor dependency.

## Why it matters
The workflow became more maintainable because the team owned the rules, tests, deploy controls, and operating knowledge instead of outsourcing the critical path.

## Technical details
- Stack: Solidity, Hardhat, multisig
- Hardest constraint: Deliver unfamiliar smart-contract work quickly without trading deploy safety for vendor lock-in

### Invariant
- Point-allocation rules should execute deterministically on-chain
- Deployment authority should remain internal
- Shipping the contract should not depend on vendor-held knowledge

### Solution
Implemented the allocation logic in-house, validated behavior with Hardhat tests, and constrained deployment through multisig plus a runbook.

### Verification
Hardhat tests covered contract behavior, the contract integrated with the existing backend and frontend flow, and the vendor engagement was no longer necessary.`,
    tags: ["cost", "ownership", "web3"],
  },
  {
    index: 7,
    title: "Scope Control for Investor Proof",
    metric: {
      prefix: "",
      value: 3,
      suffix: " wks",
      label: "to investor-ready proof",
      points: [0.2, 0.42, 0.7, 0.9],
    },
    description: `A founder needed credible product proof quickly without turning a fundraising demo into an expensive full build.

## Problem
- No working demo existed for investor conversations.
- Agency quotes were above ~$10K with multi-week timelines.
- Scope was expanding faster than proof.

## Failure mode
The team could spend weeks and thousands of dollars building around the wrong surface area before proving the core flow was useful.

## What changed
- Reduced scope to the one flow needed for fundraising.
- Built a typed vertical slice with reusable components to keep the surface area small.
- Mocked non-critical systems and added analytics plus a walkthrough for inspectability.

## Result
- An investor-ready MVP shipped in 10 days for under $300.
- Fundraising could proceed without committing to a larger build.
- Estimated agency spend was avoided by keeping scope bounded.

## Why it matters
The work became faster and easier to reason about because the demo focused on the decision that mattered, kept non-critical systems out, and left an inspectable path for follow-up.

## Technical details
- Stack: typed API, reusable UI components, analytics, Loom
- Hardest constraint: Meet a fixed investor timeline with almost no budget

### Invariant
- Founders should get working product proof before major build spend
- The core fundraising flow should be demoable inside 10 days
- Non-critical systems should not expand the initial build surface

### Solution
Built one typed vertical slice, mocked non-critical systems, and instrumented the core demo path.

### Verification
An investor-ready MVP shipped in 10 days for under $300, avoiding a larger upfront agency commitment.`,
    tags: ["mvp", "founder"],
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
