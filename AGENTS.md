# AGENTS.md

## Repository Purpose

This repository produces two primary public artifacts:

1. **The website landing page** — a concise representation of the problems I work on, how I think, and the evidence supporting those claims.
2. **The Unfinished Book** — an evolving, interconnected body of writing about systems, failure, reliability, authority, judgment, human systems, and trustworthy operation under uncertainty.

Both should create inspectable evidence of:

* engineering judgment;
* reliability mindset;
* clarity under failure;
* containment and recovery thinking;
* operational ownership;
* ability to reduce complex situations to useful decisions;
* ability to explain technical relevance to both technical and non-technical readers.

The repository should demonstrate these qualities through its structure and artifacts rather than merely claiming them.

---

## Instruction Authority

When instructions or documentation conflict, use this order:

1. the current user instruction;
2. current working code and tests;
3. this `AGENTS.md`;
4. stable project goal and architecture documents;
5. mutable state or handoff documents.

Code and tests are stronger evidence than stale documentation.

Do not silently reinterpret an explicit current request based on older project notes.

---

## Repository Context

Before making meaningful changes:

1. inspect the relevant code;
2. inspect `git status` and the current diff;
3. identify the existing architecture and conventions;
4. preserve unrelated functionality;
5. choose the smallest coherent implementation that satisfies the task.

Do not begin with a broad redesign when a focused change is sufficient.

Do not stop after producing a plan when the task asks for implementation.

---

# Website Landing Page

## Landing-Page Objective

The landing page should let a serious technical lead, hiring manager, founder, or reliability team quickly determine:

* what problems I am equipped to own;
* how I reason about those problems;
* what evidence supports that positioning;
* where they can inspect the work;
* what action they should take next.

The page is not a résumé rendered as a website.

It is an evidence-oriented interface to the work.

## Landing-Page Priorities

When editing the landing page, prioritize:

1. clear positioning;
2. concrete evidence;
3. selected work and inspectable artifacts;
4. operational or business relevance;
5. readable information hierarchy;
6. accessibility and responsive behavior;
7. visual polish.

A claim should preferably point to evidence such as:

* a working system;
* a failure-mode demonstration;
* an experiment;
* a postmortem;
* an article;
* a repository;
* an architectural decision;
* a measurable outcome;
* a reproducible scenario.

Prefer:

> Designed command acknowledgement semantics that distinguish intent, receipt, execution, and observed robot state.

Over:

> Passionate about reliable systems.

## Public Claims

Do not introduce inflated claims, unverifiable metrics, or implied experience unsupported by the repository.

Distinguish clearly between:

* production experience;
* experiments;
* prototypes;
* research;
* hypotheses;
* current interests.

Do not present a demo as a production deployment.

Do not present an idea as an established result.

## Landing-Page Design Rules

Preserve the existing visual identity unless the task explicitly requires a broader redesign.

The page should feel:

* deliberate;
* restrained;
* technically credible;
* readable;
* compact;
* evidence-led.

Avoid:

* generic personal-brand language;
* excessive animation;
* decorative terminal effects without meaning;
* large areas of visual polish unsupported by useful content;
* duplicated claims;
* dense résumé-style inventories;
* SaaS-dashboard styling;
* claims that require the visitor to trust the author without inspecting evidence.

Every significant section should answer at least one of these questions:

* What does this person understand?
* What can this person build or own?
* What evidence can I inspect?
* Why does this matter operationally?
* Where should I go next?

## Landing-Page Completion Standard

A landing-page change is not complete merely because it looks better.

It should improve at least one of:

* comprehension;
* credibility;
* discoverability of evidence;
* navigation;
* accessibility;
* performance;
* conversion to a relevant next action.

---

# The Unfinished Book

The unfinished-book project converts `/blog` from a chronological post index into an interconnected book in progress.

Future agents must treat this section as a map, not the full product specification. Read the permanent project documents in order:

```text
docs/unfinished-book/
├── GOAL.md
├── ARCHITECTURE.md
└── STATE.md
```

1. `docs/unfinished-book/GOAL.md`
2. `docs/unfinished-book/ARCHITECTURE.md`
3. `docs/unfinished-book/STATE.md`

Authority order for unfinished-book work:

1. current user instruction;
2. current code and tests;
3. `docs/unfinished-book/GOAL.md`;
4. `docs/unfinished-book/ARCHITECTURE.md`;
5. `docs/unfinished-book/STATE.md`.

Before modifying code, inspect the current implementation and Git diff. Repository code and tests are stronger evidence than stale statements in `STATE.md`.

Preserve existing article URLs. Avoid modifying unrelated website surfaces, large framework migrations, and one-off architecture that cannot be validated.

Implement one coherent vertical slice at a time, run the repository's relevant checks, and update `docs/unfinished-book/STATE.md` before ending a meaningful implementation session.

---

# Public Signal Rule

This repository is expected to produce public evidence.

When creating code, documentation, experiments, or editorial artifacts, consider whether the result can be surfaced through:

* the landing page;
* selected work;
* the unfinished book;
* a repository README;
* a technical case study;
* a reproducible demonstration;
* a postmortem.

Ask:

> Would this artifact provide useful, inspectable evidence to a serious engineering, reliability, autonomous-systems, or agent-safety team?

If not, determine whether the work is:

* a necessary dependency;
* maintenance required for correctness;
* or drift.

Not every internal change must be publicly visible, but it should support a defensible user-facing or engineering outcome.

---

# Anti-Drift Protocol

Stop and reassess when work is becoming:

* branding without evidence;
* planning without implementation;
* research without a reproducible result or useful synthesis;
* refactoring without correctness, reliability, maintainability, or delivery benefit;
* abstraction without a concrete motivating case;
* visual polish that does not improve comprehension;
* book structure that does not help readers navigate ideas;
* feature work unrelated to the repository’s stated goals;
* a framework migration undertaken for novelty rather than need.

Redirect to the nearest concrete artifact appropriate to the task.

## For technical and reliability work

Prefer:

* a failing test;
* a reproducible failure scenario;
* an invariant;
* a minimal schema;
* a containment primitive;
* a recovery mechanism;
* a postmortem;
* a measurable validation.

## For the landing page

Prefer:

* a clearer claim;
* an evidence-backed section;
* a selected-work entry;
* a direct path to an artifact;
* a responsive or accessibility fix;
* a reduction in ambiguity;
* a demonstrably improved information hierarchy.

## For the unfinished book

Prefer:

* a valid content entry;
* a chapter assignment;
* centralized metadata;
* a defensible relationship;
* relationship validation;
* a useful navigation path;
* an unresolved question;
* a revision note;
* an article or fragment with a clear claim.

Communication work is not automatically drift.

It becomes drift when presentation grows while evidence, meaning, or usability does not.

---

# Default Decision Rules

When multiple implementation paths are available, prefer the one that:

1. preserves correctness and existing URLs;
2. creates a coherent user-visible improvement;
3. produces inspectable evidence;
4. is easy to validate;
5. introduces the least unnecessary architecture;
6. remains maintainable;
7. can be extended without duplication.

## Reliability work priority

1. executable failure-mode reproduction;
2. prevention test;
3. containment primitive;
4. recovery mechanism;
5. postmortem;
6. supporting documentation;
7. refactor;
8. polish.

## Landing-page priority

1. truthful positioning;
2. evidence;
3. information hierarchy;
4. navigation to work;
5. accessibility and responsiveness;
6. performance;
7. polish.

## Unfinished-book priority

1. content model and validation;
2. preservation of existing content and routes;
3. chapter and entry navigation;
4. article reading experience;
5. meaningful relationships;
6. revisions and open questions;
7. conceptual map;
8. polish.

Do not allow polish to precede a stable content or interaction foundation.

---

# Engineering Standards

Follow the repository’s existing conventions unless there is a concrete reason to change them.

Prefer:

* small coherent vertical slices;
* explicit data models;
* deterministic behavior;
* reusable components with clear responsibility;
* central sources of truth;
* build-time validation where possible;
* accessible semantic HTML;
* responsive layouts;
* minimal dependencies;
* tests for structural and behavioral assumptions.

Avoid:

* broad unrelated rewrites;
* duplicate sources of truth;
* hidden coupling;
* speculative abstraction;
* unnecessary dependencies;
* silent fallback for corrupted content;
* complex systems where static generation or simple data structures are sufficient.

When adding a dependency, be prepared to explain:

* what problem it solves;
* why the existing stack is insufficient;
* its runtime and maintenance cost;
* the simpler alternatives considered.

---

# Final Standard

This repository should make the following evident without relying on unsupported claims:

> I do not only build systems that work in demonstrations.
> I examine what happens under retries, crashes, stale state, partial failure, ambiguous authority, and expensive side effects.

It should also show:

> I can turn those observations into clear systems, useful artifacts, and connected ideas that other people can inspect, understand, and act on.
