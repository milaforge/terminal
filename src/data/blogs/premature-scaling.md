---
title: "The Bottleneck Was Smaller"
date: "2021-11-04"
slug: premature-scaling
summary: "Measure before buying complexity you must operate."
tags: ["Architecture & System Design", "Performance"]
authors: ["milad"]
---

When an API became slow, my first instinct was to add Redis and EC2 auto scaling.

The idea sounded reasonable:

- cache expensive work
- add more servers when traffic rises
- make the system scalable

The tools were not wrong.

The problem was that I had chosen them before proving what the bottleneck was.

After tracing the slow path, the real issue was smaller:

> The service repeated the same expensive calculation several times while processing one request.

I did not need a distributed cache yet.

I needed to stop recomputing the same value.

<!--truncate-->

The useful method was less impressive and more reliable: trace the slow path, name the constraint, change the smallest boundary that actually contains the waste, and measure again.

## Start With the Smallest Boundary

Suppose one request processes several items for the same account:

```python
def handle_request(items: list[Item]) -> list[Price]:
    results = []

    for item in items:
        rules = load_and_parse_rules(item.account_id)
        results.append(apply_rules(item, rules))

    return results
```

If the account rules are stable during the request, loading and parsing them repeatedly is waste.

A request-local cache is enough:

```python
def handle_request(items: list[Item]) -> list[Price]:
    rules_by_account: dict[str, Rules] = {}
    results = []

    for item in items:
        rules = rules_by_account.get(item.account_id)

        if rules is None:
            rules = load_and_parse_rules(item.account_id)
            rules_by_account[item.account_id] = rules

        results.append(apply_rules(item, rules))

    return results
```

This change has a narrow effect:

> Repeated work inside one request happens once.

It does not add a new service. It does not create shared state. It does not require credentials, network calls, deployment changes, or a new on-call concern.

It solves the bottleneck at the boundary where the bottleneck exists.

## Infrastructure Solves Specific Problems

Redis could still become useful later.

But Redis solves a different problem:

> Multiple processes need access to shared cached data.

Auto scaling also solves a different problem:

> The remaining workload exceeds the capacity of the current instances.

Those conditions should be measured, not assumed.

Each mechanism buys something and charges somewhere else.

| Mechanism           | What it solves                               | What it adds                                                              |
| ------------------- | -------------------------------------------- | ------------------------------------------------------------------------- |
| Request-local cache | Repeated work inside one request             | Minimal code complexity                                                   |
| In-process cache    | Repeated work across requests in one process | Staleness and invalidation concerns                                       |
| Redis               | Shared cache across processes or machines    | Network dependency, credentials, memory pressure, operational ownership   |
| Auto scaling        | Insufficient compute capacity under load     | Cold starts, deployment complexity, observability needs, cost variability |

The mistake is not using Redis or auto scaling.

The mistake is paying their costs before their benefits are needed.

## Name the Invariant

The useful invariant was simple:

> Repeated requests should not recompute stable data unnecessarily.

But a cache introduces a second question:

> How stale may the cached data become?

A request-local cache is easy to reason about because it disappears when the request ends.

An in-process cache persists longer. It may need:

- a size limit
- an expiration policy
- explicit invalidation
- versioned keys
- metrics for hit rate and memory use

A shared cache adds more questions:

- What happens when it is unavailable?
- Can the service continue without it?
- Which data is safe to store?
- Who can access it?
- How is invalidation coordinated?
- How do we detect incorrect cached values?

Moving the cache outward increases both its usefulness and its operational cost.

That is why the smallest sufficient boundary is usually the safest place to start.

## Remove Waste Before Adding Capacity

More servers do not automatically fix inefficient work.

If one request performs the same expensive calculation five times, scaling out may only multiply the waste across more machines.

The better sequence is:

1. Measure the slow path.
2. Remove redundant work.
3. Measure again.
4. Add shared infrastructure only if the remaining problem requires it.
5. Add capacity only when measured load exceeds current capacity.

This order matters.

It separates two different problems:

- **efficiency:** each request does unnecessary work
- **capacity:** the system cannot handle the remaining workload

Adding capacity before fixing efficiency can hide the root cause while making the system more expensive to operate.

## A Practical Checklist

Before adding infrastructure to solve a performance problem, ask:

1. Which operation is actually slow?
2. Is the expensive work repeated unnecessarily?
3. Does the fix need to persist beyond one request?
4. Does cached state need to be shared across processes?
5. How stale may the result become?
6. What invalidates the cached value?
7. What happens when the cache is empty, wrong, full, or unavailable?
8. Is the remaining problem efficiency or capacity?
9. Will the new component simplify operations or widen the incident surface?

Scaling tools are useful when they match a measured constraint.

Start by removing waste.

Add infrastructure when the remaining problem genuinely needs infrastructure.
