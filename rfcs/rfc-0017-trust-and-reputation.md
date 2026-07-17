# RFC-0017 - Trust & Reputation

**Status:** Draft (design) · **Version:** 0.2 · **Depends on:** RFC-0003, RFC-0009, RFC-0013, RFC-0016 · **Date:** 2026-07-16

The key words MUST, MUST NOT, SHOULD, RECOMMENDED, and MAY are to be interpreted as in RFC 2119/8174.

> **Design-first RFC.** This document sketches a design for verified trust signals so it can be reviewed and refined. Reputation systems are among the highest-risk things to build (manipulation, sybil attacks, privacy, neutrality, cold-start, power concentration, and legal exposure). Implementation MUST NOT begin until the open questions in §8 are resolved, and the capability MUST NOT be presented publicly as available before it is designed and reviewed.

## 1. Summary

Sketches how verified, hard-to-game trust signals can be grounded in protocol-verified transactions rather than anonymous reviews, using two-sided attestation and an open, neutral aggregation, so that a small but excellent provider can be surfaced on merit instead of budget.

## 2. Motivation

Anonymous reviews are gameable and tend to reward the largest or the best at faking, which entrenches incumbents. A trust signal anchored to a real, protocol-mediated transaction is much harder to fabricate, because a transaction and its audit record cannot be conjured. Making merit legible is the operational core of an open discovery layer: without a trustworthy signal, discovery collapses toward whoever is already known.

## 3. Specification (design)

### 3.1 Verified-transaction basis

A trust signal SHOULD reference a completed action's `audit_ref` (RFC-0003), anchoring it to a real transaction rather than an anonymous claim.

### 3.2 Two-sided attestation

A network-level trust signal requires attestation from **both** the acting agent (on the user's behalf) and the site, so neither can unilaterally fabricate a signal. This composes with verified agent identity (RFC-0013).

### 3.3 Signal content

A signal is minimal and outcome-oriented (for example fulfilled or not fulfilled, and an optional bounded rating), personal-data-free, and tied to an `audit_ref`. Storing free-text reviews is explicitly **out of scope** for the first design.

### 3.4 Neutral aggregation

Signals are aggregated in an open, neutral network so they are portable and not owned by any single party. Sybil resistance, rate limiting, decay, and privacy are design requirements, not add-ons.

### 3.5 Non-goals

Not a replacement for public review platforms; not a credit or scoring system for individuals; not a mechanism for any single party to own or gate reputation.

## 4. Examples

Illustrative only, pending design.

```json
{ "audit_ref": "aud_01H8", "outcome": "fulfilled", "rating": 5,
  "attested_by": ["site", "agent"] }
```

## 5. Security & privacy considerations

This is the most sensitive surface in the protocol. Anti-manipulation (sybil, collusion, spam), neutrality (no capture by one party), and privacy (no personal data, no user profiling) are load-bearing. A poorly designed reputation layer causes more harm than no layer at all, so the bar for shipping is a reviewed design that addresses §8.

## 6. Backwards compatibility

Additive and future. Nothing here changes existing manifests or behaviour.

## 7. Acceptance criteria

- A trust signal is anchored to an `audit_ref` and requires two-sided attestation.
- No unilateral self-report is treated as network-trustworthy.
- Signals carry no personal data.

## 8. Open questions (must resolve before any implementation)

- The attestation protocol (how agent and site co-sign a signal).
- Sybil resistance and anti-collusion.
- Who operates the neutral aggregation, and its governance.
- The privacy model and cold-start.
- Whether and how agents may query signals during discovery.
- Legal exposure of storing negative outcome signals about a business. `[VERIFY]` with legal counsel before any negative-signal design proceeds.
