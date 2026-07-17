# RFC-0016 - Signals & Analytics Events

**Status:** Draft · **Version:** 0.2 · **Depends on:** RFC-0002, RFC-0003, RFC-0009, RFC-0013 · **Date:** 2026-07-16

The key words MUST, MUST NOT, SHOULD, RECOMMENDED, and MAY are to be interpreted as in RFC 2119/8174.

## 1. Summary

Defines an optional, privacy-preserving **event model** for agent interactions. Every meaningful interaction a site handles (discovery, a capability query, an action outcome) can produce one structured event, seeded by the `audit_ref` already defined in RFC-0003. Events are captured server-side, are free of personal data by default, and are stored local-first with opt-in aggregation. This is the foundation an owner uses to understand agent-mediated outcomes, and the substrate the trust model (RFC-0017) builds on.

## 2. Motivation

In the agentic channel, an action is performed by an agent on a user's behalf, so there is no human browser session to instrument. Conventional client-side analytics is therefore blind exactly when the stakes rise: an owner cannot see what agents asked for, what converted, or, critically, the demand that was requested and could not be met. A minimal, standard, personal-data-free event lets owners measure the agentic channel and surfaces otherwise-invisible demand.

## 3. Specification

### 3.1 Capture

Capture is **server-side**: a conforming server SHOULD emit an event for each meaningful interaction it handles. Agents do not execute site-provided instrumentation, so client-side capture is out of scope.

### 3.2 Event object

An event contains: `ts`; `type` in `discovery | query | action | outcome`; the `capability` or action `name`; optional `intent` (RFC-0014); optional `filters` (the sanitised query parameters, for example date, price band, party size); `result` in `hit | miss | count | success | error`; `audit_ref` for state-changing actions (RFC-0003); optional coarse `agent` identity (RFC-0013); optional `latency` and `error`.

### 3.3 Personal-data rule (MUST)

An event MUST NOT contain personal data by default: no names, no full order or message contents, no end-user identifiers beyond the opaque `audit_ref`. Data minimisation and retention follow RFC-0009. `filters` MUST be sanitised to non-identifying parameters.

### 3.4 Missed demand

A `query` event whose `result` is `miss` (no match or no availability) is a first-class outcome. Aggregating `miss` events quantifies unmet demand, which no read-only crawl of the site can produce.

### 3.5 Sink

Storage is **local-first by default**: the site's own store, owned by the operator. Sending events to a central or network aggregator is **opt-in**; when used, events MUST be aggregated or personal-data-stripped before leaving the site and remain subject to RFC-0009 retention.

### 3.6 Self-report caveat

An operator's own local events are authoritative **for that operator**. A single party's self-reported events are **not** trustworthy across the network; any network-level trust signal derived from events requires the corroboration model of RFC-0017 (two-sided attestation).

## 4. Examples

```json
{ "ts": "2026-07-16T19:00:00Z", "type": "query", "capability": "availability",
  "intent": "reserve_table", "filters": { "date": "Fri 20:00", "party": 4, "area": "terrace" },
  "result": "miss", "agent": "assistant-x" }
```

## 5. Security & privacy considerations

Personal-data-free by default (§3.3); minimisation and retention per RFC-0009; central aggregation is opt-in and aggregated (§3.5). The `audit_ref` links an event to a transaction for later corroboration without exposing the end user's identity.

## 6. Backwards compatibility

Additive and optional. No manifest field is required; a site MAY declare analytics support as an optional capability. Servers that emit no events remain conformant.

## 7. Acceptance criteria

- A server emits personal-data-free events for discovery/query/action interactions.
- `miss` outcomes are captured for empty or unavailable queries.
- Any central send is opt-in and aggregated/stripped before leaving the site.

## 8. Open questions

- A shared vocabulary for event `type` and `intent` (composes with RFC-0010 and RFC-0014).
- Whether to declare analytics support explicitly in the manifest, and how a client discovers it.
