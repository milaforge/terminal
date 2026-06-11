---
title: "Prevention Will Fail Somewhere"
date: "2024-10-02"
summary: "Design the blast radius before compromise arrives."
slug: cybersecurity-harsh-truth
authors: ["milad"]
tags: ["Security", "Software Engineering & Practices"]

---

A secure system is not a system that can never be compromised.

That standard sounds reassuring, but it is not realistic. Real systems depend on credentials, cloud services, CI pipelines, third-party packages, internal tools, and people making decisions under pressure.

Any one of those boundaries can fail.

The useful question is not only:

> How do we prevent compromise?

It is also:

> What happens after one control fails?

Consider a simple example:

> An attacker obtains a production API key.

The key should have remained secret. Prevention failed.

What happens next depends on how the system was designed.

<!--truncate-->

This is the security method I trust: start from the failed control, trace the blast radius, then design the system so damage is bounded, visible, and recoverable.

## One Failure, Two Outcomes

In a fragile system, the key may have broad access.

It can read customer data, modify records, trigger expensive operations, or reach unrelated services. Its use may look similar to ordinary traffic. Logs may exist, but nobody is watching them. Revoking the key may require investigation, coordination, and manual changes across several systems.

One compromised credential becomes a large incident.

In a more resilient system, the same failure has a smaller effect.

The key has narrowly scoped permissions. It can reach only the service that needs it. Unusual usage patterns trigger alerts. Every sensitive action leaves evidence. The key can be revoked quickly. Related sessions can be invalidated. Damaged state can be identified and restored.

The compromise still matters.

But one failure does not automatically become a catastrophe.

## Prevention Is Only One Layer

Security work often concentrates on keeping the key secret:

- store it outside the codebase
- avoid printing it in logs
- restrict access to production environments
- rotate it periodically
- scan repositories for accidental exposure

These controls are necessary.

But they answer only one question:

> How do we reduce the chance that the key is exposed?

A production system also needs answers to different questions:

- What can the key do?
- Which services can it reach?
- How would unusual behavior become visible?
- How quickly can access be revoked?
- Can affected state be reconstructed?
- Has the recovery path been tested?

Prevention reduces the probability of failure.

Resilience reduces the cost of failure.

A serious security design needs both.

## Limit the Blast Radius

The first question after a credential is compromised is:

> How far can the attacker go?

A key should not have more authority than its task requires.

A service that sends transactional emails does not need database-admin access.

A background worker that reads from one queue does not need permission to modify every queue.

A reporting process does not need write access to production data.

Least privilege is not merely a compliance rule. It limits the number of assumptions that must remain correct at the same time.

The narrower the permission, the smaller the incident when one credential fails.

## Make Misuse Visible

A bounded failure is safer than an unbounded one.

A visible failure is safer than an invisible one.

Sensitive actions should leave enough evidence to answer basic questions:

- Which credential was used?
- What action was performed?
- Which resource was affected?
- When did the behavior begin?
- How does it differ from normal usage?
- Can the affected records be identified?

Logging alone is not enough. A large pile of logs does not automatically become detection.

The system needs signals that someone owns:

- unusual request volume
- access from an unexpected environment
- use of rarely needed permissions
- repeated failures
- large exports
- destructive actions
- sudden changes in spending or resource usage

The goal is not to record everything.

The goal is to make dangerous behavior difficult to miss.

## Prepare the Revocation Path

A credential is not safely managed merely because it can be rotated in theory.

The operational questions matter:

- Who is allowed to revoke it?
- How quickly can they act?
- Which services cache it?
- Which active sessions remain valid afterward?
- What breaks when the key is disabled?
- Is a replacement process documented?
- Has the process been tested?

During an incident, undocumented assumptions become delays.

Delays increase damage.

A recovery path should be designed before it is needed.

## Preserve a Way Back

Some effects cannot be reversed easily.

A leaked record cannot be made secret again. A fraudulent transfer may not be recoverable. A deleted audit trail may remove the evidence needed to understand the incident.

But many systems can still preserve partial recovery paths:

- keep tested backups
- use append-only audit logs
- delay permanent deletion
- support rollback for risky changes
- record idempotency keys for irreversible operations
- separate approval from execution for high-impact actions
- retain enough evidence to reconstruct affected state

Recovery is not an admission of defeat.

It is part of the design.

## Security Is an Operating Loop

A strong security program does not rely on one perfect control.

It asks:

1. What matters most?
2. How can it fail?
3. How do we reduce the probability of that failure?
4. How far can the failure spread?
5. How quickly will we notice?
6. How do we stop it?
7. How do we recover?
8. What should change afterward?

This applies beyond API keys.

A retry mechanism can improve availability while duplicating a payment.

A deployment script can remove unused infrastructure while deleting something that still contains evidence.

A permission change can fix one customer issue while weakening authorization for everyone.

A compromised CI pipeline can turn a small dependency mistake into a production breach.

The common lesson is the same:

> Do not design only for the path where every control works.

Design for the path where one control fails.

## A Practical Checklist

Before calling a system secure, ask:

1. What is the most damaging credential, permission, or trust boundary?
2. What can an attacker do after crossing it?
3. Is the access narrower than the task requires?
4. How large is the maximum blast radius?
5. Which signals would make misuse visible?
6. Who owns the response?
7. Can access be revoked quickly?
8. Can damaged state be identified and restored?
9. Has the recovery path been tested?

Perfect prevention is not a realistic promise.

The better goal is a system where one failure remains bounded, visible, and recoverable.
