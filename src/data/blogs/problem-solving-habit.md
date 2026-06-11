---

title: "Find What Cannot Change"
date: "2026-05-19"
slug: problem-solving-habit
summary: "The fixed constraint makes the problem smaller."
tags: ["Engineering", "Problem Solving", "Ethereum", "Security"]
authors: ["milad"]
---

Unfamiliar problems often feel difficult because several layers arrive at once.

The instinct is to understand everything before acting.

A better first question is:

> What is not allowed to change?

Once the fixed constraint is visible, the problem usually becomes smaller.

I learned this while solving an Ethereum security puzzle.

## The Puzzle

The challenge was to deploy a piece of bytecode unchanged and make its `flag()` function return a chosen wallet address.

Bytecode is the compiled program that Ethereum executes. A wallet is an address controlled by a private key. A smart contract is an address with executable code.

The important constraint was explicit:

> The bytecode could not be changed.

That ruled out a large class of false solutions.

I could not rewrite the contract. I had to understand its existing rules and satisfy them from the outside.

<!--truncate-->

## Isolate the State Change

The contract behavior could be reduced to this:

```text
flag():
    return stored_address

fallback():
    ask the caller to return true

    if the answer is true:
        stored_address = caller
```

Most of the bytecode no longer mattered.

Only one state change mattered:

> The contract stores the caller's address if the caller can answer the callback correctly.

That reduced the puzzle to one question:

> How can the target wallet call the contract and also return the expected answer?

## Expose the Contradiction

The obvious approaches failed for opposite reasons.

| Caller         | Correct address | Callback behavior |
| -------------- | --------------: | ----------------: |
| Normal wallet  |             Yes |                No |
| Smart contract |              No |               Yes |

A normal wallet had the required address, but it did not have executable behavior.

A smart contract could return the expected answer, but the stored value would be the contract address rather than the target wallet.

The original problem sounded large:

> Solve an unfamiliar Ethereum bytecode puzzle.

The reduced problem was much smaller:

> Make one address keep its wallet address while gaining the required callback behavior.

The contradiction revealed the missing condition.

## Change One External Condition

EIP-7702 provided the mechanism.

It allows a wallet address to delegate calls to implementation code. The wallet keeps the same address, but incoming calls can execute the delegated behavior.

The final design became simple:

1. Deploy the challenge bytecode unchanged.
2. Deploy implementation code that returns the expected answer.
3. Authorize the wallet to delegate to that implementation.
4. Call the challenge contract from the wallet.
5. Read `flag()` and verify the stored address directly.

The solution did not require changing the fixed bytecode.

It required changing one condition outside that boundary.

## The Reusable Habit

The Ethereum details are specific. The reasoning pattern is not.

When an unfamiliar problem feels too large, ask:

1. What must remain unchanged?
2. Which output or state change actually matters?
3. What exact condition allows that change?
4. Why do the obvious approaches fail?
5. What is the smallest condition that can change outside the fixed boundary?
6. How can the result be verified directly?

The goal is not to understand the entire system at once.

The goal is to reduce the problem until only one blocked condition remains.

Then change that condition without violating the constraint.

That is the habit I want visible in my work: do not rush to cleverness, reduce the problem until the necessary move can be verified.
