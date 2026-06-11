---
title: "Savings Can Move Risk"
date: "2026-01-15"
slug: "gen-ai-token-compression"
tags: ["resourcefulness", "optimization", "gen-ai"]
summary: "Token cuts must preserve the delivery promise."
---

Optimization is not only about lowering a number.

A change is useful only if it reduces cost without quietly making the system less reliable.

I faced this while replacing a legacy decision point with a small generative-AI task. The model call worked well enough, but it sat inside a high-volume workflow. At peak, the system processed millions of items.

The first version handled each item independently:

```txt
Input tokens: 78
Output tokens: 11
Total tokens: 89
```

Eighty-nine tokens is small.

Multiplied by millions of items, it becomes an operating cost worth examining.

The goal was not merely:

> Use fewer tokens.

The real goal was:

> Reduce token cost without weakening the delivery promise or hiding new failure modes.

That made the work a methodical optimization problem, not a cost-cutting exercise: prove which risk moved before accepting the lower bill.

## The First Temptation

One available option was asynchronous provider-side batching.

It reduced the price per token, but it also introduced a target turnaround time of up to a day.

The workflow already had a daily delivery promise:

```
Input data
    -> preliminary processing
    -> hourly aggregation
    -> AI decision
    -> daily post-processing
    -> delivery
```

Moving the decision into a long-running asynchronous job would save money, but it could also delay every downstream step.

That is not a clean optimization.

It moves cost from the invoice into operational uncertainty.

## Reduce the Work First

Instead of sending each item independently, I grouped items by hour and compressed the repeated instructions.

For a bounded group of 50 items, the new prompt used:

```
Input tokens: 975
Output tokens: 399
Total tokens: 1,374
```

The original path would have used:

```
89 tokens * 50 items = 4,450 tokens
```

The aggregated path used:

`1,374 tokens`

That is about 69% fewer tokens.

The important distinction is:

- provider-side batching lowers the price per token
- application-level aggregation reduces the number of tokens

Both can be useful.

But reducing unnecessary work is usually the better first step.

## The Optimization Changed the Failure Shape

The cheaper path was not automatically safer.

When one request contains 50 items instead of one, the system behaves differently.

A failure no longer affects only one item.

It can affect the entire group.

The new design introduced several risks:

- One malformed item could disrupt many decisions.
- Weak separators could allow information from one item to influence another.
- Compression could remove a detail that changes the correct result.
- More data would be sent in a single request.
- Missing or duplicate outputs could become harder to notice.
- A valid-looking response could silently drift from the original behavior.
- Retaining only the compressed prompt could weaken later audits.

The token count improved.

The blast radius also changed.

That is the part an optimization review should make explicit.

### Define the Invariants

Before rolling out the new path, I needed to state what must remain true.

The core invariant was:

> Compression may remove tokens, but it must not remove facts required for the same business decision.

That statement becomes more useful when translated into concrete requirements:

- Every input item must have a stable ID.
- Every input item must receive exactly one output.
- Items must remain clearly separated.
- A malformed item must not block the whole group.
- Failed items must be retryable individually.
- The batch size must remain bounded.
- Differences from the original path must be measurable.
- Enough evidence must remain to explain a decision later.

These requirements define the boundary of a safe optimization.

### Use Stable Item Boundaries

A compressed prompt should not become an unstructured block of text.

Each item needs an explicit identity:

```txt
ITEM_ID: 7f2a
INPUT: ...
```

The response should use a strict schema:

```json
{
  "item_id": "7f2a",
  "decision": "...",
  "reason_code": "..."
}
```

The system can then validate:

- missing IDs
- unknown IDs
- duplicate IDs
- malformed outputs
- incomplete groups
- unexpected decision values

This turns a model response into something the surrounding software can check.

The model does not become reliable merely because the prompt is shorter.

Reliability comes from the boundaries around the model call.

## Cap the Blast Radius

The batch size should remain deliberately small.

Fifty items may be efficient. Five thousand items may be cheaper still.

But larger groups increase the cost of one bad response, one provider failure, or one malformed record.

A safe batch size is not simply the largest number the API accepts.

It is the largest number the system can fail, inspect, retry, and recover without creating an operational problem.

For this workflow, hourly aggregation preserved a useful boundary:

```
One failure affects at most one bounded group, not the entire day.
```

That matters more than maximizing compression.

## Compare Against the Old Path

A valid-looking response is not evidence that the new path is equivalent.

The compressed path should first run in shadow mode:

```
same input
  -> original path
  -> compressed path
  -> compare decisions
```

The rollout should track:

- disagreement rate
- missing-output rate
- duplicate-output rate
- malformed-response rate
- retry rate
- decision distribution shifts
- latency
- tokens per item

Disagreements should remain attributable to specific item IDs and prompt versions.

Without that comparison, a cheaper path can drift silently while continuing to return syntactically valid output.

## Preserve a Recovery Path

Failures should be recoverable at the smallest practical unit.

If one item fails validation, retry that item independently.

Do not replay the entire hourly group unless necessary.

Keep enough audit data to answer:

- Which prompt version was used?
- Which item was processed?
- What decision was returned?
- Which validation rules passed?
- Was the item retried?
- Did the compressed and original paths disagree?

This does not require storing raw sensitive data forever.

It requires retaining enough structured evidence to understand the system's behavior.

# A Practical Checklist

Before accepting an optimization, ask:

- Which cost did the change reduce?
- Which cost may have moved elsewhere?
- Did the latency contract change?
- Did the privacy boundary change?
- Did the blast radius become larger?
- Can failures be detected automatically?
- Can failed units be retried independently?
- Can the new path be compared against the old one?
- Can a past decision still be explained?

The final result was useful:

- about 69% fewer tokens
- no next-day dependency
- no downstream workflow rewrite
- bounded batches
- measurable disagreement
- item-level recovery
- explicit privacy and correctness risks

The important result was not only that the model call became cheaper.

The system became cheaper without making its failure boundaries harder to see.
