---
title: "Design Tradeoffs"
date: "2023-04-20"
slug: design-tradeoffs
summary: "How I make design tradeoffs: identify the layer, expose constraints, and ask what must stay predictable under misuse."
tags: ["Architecture & System Design"]
authors: ["milad"]
---

A clean API is not always a flexible API.

That distinction matters because design judgment should not rest on taste. I try to make the method explicit: find the layer, locate the cost of being wrong, and decide where ambiguity is allowed to live.

In application code, flexibility is often useful. One function can accept a list, an options object, or a configuration structure:

```solidity
log(topics: Topic[], data: Bytes)
```

That interface is compact. It is easy to extend. For many applications, it is the right choice.

But flexibility has a cost: some behavior is decided at runtime.

In low-level systems, that cost may matter more than convenience.

The Ethereum Virtual Machine provides a small example. Instead of one generic logging instruction, it has five:

```solidity
LOG0
LOG1
LOG2
LOG3
LOG4
```

The number tells the VM how many topics the log contains.

At first glance, this looks repetitive. Why define five instructions when one dynamic instruction could do the job?

The answer reveals a useful design principle:

> Sometimes the safest interface is the one that makes its limits visible.

## The Example

Ethereum contracts can emit logs. Applications outside the blockchain can read and filter those logs.

A log contains:

- a payload stored in memory
- zero to four topics used for filtering

The EVM encodes the number of topics directly in the instruction:

```solidity

LOG0(offset, length)
LOG1(offset, length, topic0)
LOG2(offset, length, topic0, topic1)
LOG3(offset, length, topic0, topic1, topic2)
LOG4(offset, length, topic0, topic1, topic2, topic3)

```

Each instruction has an explicit stack shape.

Before execution begins, the VM already knows how many values the instruction consumes. The maximum number of topics is visible in the instruction set itself.

A generic alternative could also work:

```solidity
LOG(offset, length, topic_count, ...)
```

But that design would move one more decision into runtime interpretation.

The VM would need rules for the count, its valid range, the required operands, and the failure behavior for malformed input.

Those rules are not impossible to implement.

The question is whether the flexibility is worth the additional interpretation.

## Different Layers Need Different Tradeoffs

In a web application SDK, a single typed method is probably easier to use:

```js
emitLog({ topics, data });
```

The application can validate the topic count internally. Developers get a cleaner interface. The implementation absorbs the complexity.

That is often a good tradeoff.

A virtual machine used for consensus operates under different conditions.

Multiple implementations must execute the same instructions and reach the same result. Behavior must remain predictable across clients and over time. Small ambiguities can become expensive.

In that environment, an explicit instruction family has advantages:

- the valid range is visible
- the stack shape is predictable
- invalid forms are easier to reject
- the implementation surface stays small
- the behavior is easier to inspect and test

This does not mean explicit interfaces are always better.

It means the correct abstraction depends on where the complexity should live.

## Abstraction Can Move Risk

Abstraction is often described as a way to hide complexity.

That is useful when the hidden complexity is stable and well-contained.

But abstraction does not remove complexity. It moves it.

A flexible interface may move complexity into:

- runtime validation
- implicit defaults
- parser behavior
- configuration rules
- error handling
- operational debugging

Sometimes that is worthwhile.

Sometimes it hides the exact behavior that operators, reviewers, or implementers most need to see.

Consider two interfaces for deleting records:

```js
cleanup(options);
```

and:

```js
previewExpiredRecords();
deletePreviewedRecords(batchId);
```

The first interface is compact and flexible.

The second is more verbose. But it makes an operational boundary visible: selection and deletion are separate actions.

The better design depends on the risk.

If mistakes are easy to reverse, convenience may matter more.

If mistakes can destroy data, move money, weaken authorization, or break compatibility, explicitness becomes more valuable.

## Ask What Must Stay Predictable

The useful question is not:

> Which API looks more elegant?

It is:

> What must remain predictable when this interface is used incorrectly, under pressure, or years later?

That question changes design decisions.

A flexible interface may be appropriate when:

- requirements are changing quickly
- errors are cheap to reverse
- one implementation owns the behavior
- validation can be centralized
- developer speed matters most

A narrower interface may be safer when:

- operations are irreversible
- multiple implementations must agree
- behavior affects money or permissions
- auditability matters
- runtime ambiguity increases incident cost

Neither style is universally mature.

They optimize for different failure modes.

## A Practical Checklist

Before designing an interface, ask:

1. Which constraints should be visible to the caller?
2. Which decisions can safely happen at runtime?
3. What happens when the input is malformed?
4. Is the failure reversible?
5. Will multiple implementations interpret the behavior?
6. Does flexibility reduce misuse, or hide important limits?
7. Where should the complexity live?

The EVM logging instructions are a small example, but the lesson transfers.

A good interface does not merely look clean.

It makes the important constraints hard to miss.
