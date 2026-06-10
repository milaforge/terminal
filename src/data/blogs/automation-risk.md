---
title: "When Instructions Become Actions"
date: "2026-01-01"
slug: "automation-risk"
summary: "A method for automation risk: name the invariant, bound authority, separate review from execution, and preserve evidence."
tags: ["Artificial Intelligence", "Software Engineering & Practices"]
---

King Midas asked for a simple power: everything he touched should turn to gold.

The instruction was clear. The result was disastrous. Food, water, and eventually his daughter became gold. The wish was granted exactly as stated, but it violated what he actually wanted.

<!--truncate-->

<p align="center">
  <img
    src="https://failuresmith.github.io/terminal/images/blog/midas.jpeg"
    alt="Midas myth, Midas' daughter turns to a golden statue when he touches her (illustration by Walter Crane for the 1893 edition)"
  />
</p>

That is the old shape of a modern engineering problem:

> A system can satisfy the written instruction while violating the real intent.

Consider a routine production task:

> Delete stale records older than 90 days.

The instruction sounds precise. It is also incomplete.

- What counts as stale?
- Can audit records be deleted?
- What about records linked to unresolved payments?
- Should the deletion happen immediately?
- How many records may be removed in one run?
- What evidence should remain afterward?

A human operator may notice these questions before acting. An automated system may not. It can apply the instruction consistently, quickly, and at scale.

That is what makes automation useful.

It is also what makes incomplete intent dangerous.

The method I trust is deliberate: identify what the instruction omits, define what must remain true, narrow what the system can affect, and leave evidence for review.

## The Missing Context

Suppose a database contains temporary records created during payment processing.

Most records older than 90 days are safe to remove. But some belong to failed or disputed transactions. Those records are no longer active, yet they may still be needed for reconciliation, support, or audit purposes.

A naive cleanup job might look like this:

```sql
DELETE FROM payment_attempts WHERE created_at < NOW() - INTERVAL '90 days';
```

The query does exactly what it says.
That is the problem.

The real requirement was not:

> Delete every old record.

It was closer to:

> Delete records that are old, no longer operationally useful, not linked to unresolved work, not required for audit, and safe to remove permanently.

The original instruction omitted most of that meaning.

Human language often works this way. Words such as `stale`, `safe`, `done`, and `unused` depend on context. They are not complete specifications.

**Automation does not remove that ambiguity**. It only makes the consequences arrive faster.

## The Risk Comes From Authority

An incomplete instruction is not always dangerous.

A read-only report that lists records older than 90 days may contain mistakes, but it does not destroy data.

A deletion job running with production permissions is different. The same misunderstanding now creates real effects.

The important question is not only:

> Did the system follow the instruction?

The better question is:

> What can the system affect if the instruction was incomplete?

This is the key difference between assistance and authority.

A system that suggests a cleanup query has limited authority.

A system that runs the query against production has more authority.

A system that runs it automatically every night, across every customer account, with no recovery path, has much more authority.

The instruction did not become clearer. The blast radius became larger.

## Define the Boundaries Before Execution

The answer is not to avoid automation. Cleanup jobs are useful. They reduce storage costs, remove clutter, and keep systems manageable.

The answer is to define the boundaries of being wrong before the job is allowed to act.

For a cleanup job, that means making the hidden assumptions explicit.

### 1. Define the invariant

Some conditions must remain true even when the cleanup logic is wrong.

For example:

> Records linked to unresolved transactions must never be deleted.

This is stronger than a general instruction to remove stale data. It defines a property the system must preserve.

### 2. Narrow the scope

Do not give a cleanup job more authority than it needs.

Instead of deleting from the entire table, restrict it to records with a known terminal status:

```sql
SELECT id
FROM payment_attempts
WHERE created_at < NOW() - INTERVAL '90 days'
  AND status IN ('completed', 'cancelled')
  AND audit_hold = false;
```

The narrower the scope, the smaller the number of hidden assumptions.

### 3. Separate selection from deletion

A cleanup job should first show what it intends to remove.

Run the selection query in dry-run mode. Record the count. Inspect a sample. Compare the result with previous runs.

The first question is not:

> Can this system delete the records?

It is:

> Can this system reliably identify the records that are safe to delete?

Execution should come later.

### 4. Cap the blast radius

Even a well-tested cleanup job can encounter unexpected data.

Set a hard limit:

```
Delete at most 1,000 records per run.
Stop if the candidate count is unusually high.
```

A boundary turns a potentially catastrophic mistake into a bounded incident.

### 5. Preserve evidence

The system should record:

- when the job ran
- which rule version it used
- how many records it selected
- how many records it removed
- why each record qualified
- whether any limit or stop condition was triggered

Observability is not an optional extra. It is part of the safety model.

### 6. Keep a recovery path

Permanent deletion should usually be the last step.

A safer process may first move records into a quarantine table or mark them for delayed deletion. That creates time to detect mistakes before the data disappears.

Reversibility buys time for judgment.

## Human Approval Is Not Enough

A common response is to add a confirmation step:

> The system prepares the cleanup. A human clicks approve.

That is better than immediate deletion, but it is still a weak control if the reviewer sees only:

`Delete 18,432 stale records?`

The system has already framed the decision. The human is being asked to approve a conclusion without enough evidence.

A useful review should expose the reasoning:

```txt
Candidate records: 18,432
Previous run: 412
Increase: 4,374%
Excluded due to unresolved transactions: 287
Excluded due to audit hold: 91
Configured maximum deletion count: 1,000
Action: stopped automatically
```

The human role is not merely to add friction.

It is to define the conditions under which automation is allowed to proceed.

## The Same Pattern Appears Elsewhere

The cleanup job is only one example.

A retry mechanism can improve reliability while duplicating an irreversible payment.

A permission update can fix access for one customer while weakening authorization for everyone.

A deployment script can remove unused infrastructure while deleting a resource that still contains audit evidence.

An AI coding agent can satisfy a request to “fix the tests” by weakening the test suite instead of fixing the behavior.

In each case, the written instruction is smaller than the real intent.

The risk increases when the system can act with speed, consistency, and broad authority.

## A Practical Checklist

Before allowing automation to create real effects, ask:

1. What must remain true even if the instruction is incomplete?
2. Which actions are irreversible?
3. What is the maximum acceptable blast radius?
4. Can selection be reviewed separately from execution?
5. What evidence will remain after the action?
6. Can the system stop automatically when the situation looks unusual?
7. Is there a recovery path?

Automation is not risky merely because it acts quickly.

It becomes risky when it acts on incomplete intent without strong boundaries.

The more authority we delegate, the more explicitly we must define the boundaries of being wrong.
