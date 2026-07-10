# RFC-0007 - Support & Post-Purchase

**Status:** Draft · **Version:** 0.1 · **Depends on:** RFC-0000, RFC-0001, RFC-0002, RFC-0003, RFC-0004, RFC-0005 · **Date:** 2026-07-09

The key words MUST, MUST NOT, SHOULD, RECOMMENDED, and MAY are to be interpreted as in RFC 2119/8174.

## 1. Summary

Defines the **support** capability: everything a customer needs *after* purchase - order tracking, delivery status, returns, refunds, cancellations, issue reporting, and escalation to a human. A user should be able to *ask their assistant* ("where's my order?", "these arrived damaged, I want a refund") and have it resolved, whichever fulfilment path the site exposes.

`ai2w` does not define a support back-end; it declares the support capability and how to reach it, and negotiates the path (RFC-0000 §3.2–3.3).

## 2. Motivation

Post-purchase support is where users most want an assistant to act on their behalf, and where getting it wrong is most costly (money, PII, fraud). It therefore needs a precise capability model, standard actions/events, and - for anything that moves money or state - mandatory approval (RFC-0003).

## 3. Specification

### 3.1 `support` capability object
The `support` capability declares which post-purchase functions a site offers, for example: `order_tracking`, `returns`, `refunds`, `cancellation`, `issue_report`, `human_handoff`. It also declares its **fulfilment path(s)** (§3.4). Field shapes are in the specification.

### 3.2 Standard support actions
Support actions are ordinary actions (RFC-0002) with stable `id`s. RECOMMENDED vocabulary and risk tiers:

| `id` | Purpose | Risk | Approval |
|---|---|---|---|
| `track_order` | Delivery status / tracking for an order | low–medium | no |
| `check_return_status` | Status of an existing return/refund | low | no |
| `report_issue` | Report a problem (e.g. damaged item), with evidence | low | no |
| `start_return` | Initiate a return (RMA, label) | medium | SHOULD |
| `request_refund` | Request a refund | **high** | **MUST** |
| `cancel_order` | Cancel an unshipped order | **high** | **MUST** |
| `raise_ticket` | Open a support ticket | medium | SHOULD |
| `handoff_to_human` | Escalate to a human agent | low | no |

Accessing a user's order requires scoped authorization (RFC-0003 §4.1) - e.g. `read_orders`, `manage_returns`.

### 3.3 Evidence
`report_issue` (and `start_return` for damage) MAY accept **evidence**: an array of references, each with a `type` (e.g. `image`, `text`) and a `url` or inline description. Sites SHOULD accept image evidence for damage claims. Evidence is user data and is subject to §5.

### 3.4 Fulfilment paths (transport-independent)
A site MAY fulfil support through any combination of:
- **Direct actions** - the actions in §3.2 served over any adapter (MCP, REST, …) (RFC-0006).
- **Checkout-transport post-purchase operations** - where a checkout transport profile (RFC-0005 §3.3) defines returns/refunds (for example an agentic-commerce protocol's post-purchase operations), the site MAY route those actions to it.
- **Brand agent service** - the site's own agent (RFC-0004) MAY handle support intents conversationally and return structured results and `requires_user_approval` signals.

The manifest declares which paths exist; the agent negotiates and uses whichever it understands. The outcome MUST be equivalent regardless of path.

### 3.5 Approval & confirmation
`request_refund`, `cancel_order`, and any state-changing financial action MUST follow the approval flow (RFC-0003 §4.3): the site returns a **preview** (amount, method, RMA, timing), the user approves, then the site executes and returns confirmation + `audit_ref`. A client MUST enforce this by risk tier regardless of the manifest's self-declared flag (RFC-0003 §4.4, RFC-0006 §3).

### 3.6 Events
Support publishes events (RFC-0002 §3.5): `order.shipped`, `order.delayed`, `order.delivered`, `return.requested`, `return.approved`, `return.rejected`, `refund.processed`, `support_ticket.updated`. User-scoped events require authorization and consent.

## 4. Example flow (informative)

> User: "Where's my order?" → agent calls `track_order` (scoped read) → tracking returned.
> User: "They arrived damaged - I want a refund." → agent calls `report_issue` with image evidence → then `request_refund`. Because refund is `high`, the site returns a **preview** (amount, method, return label); the user approves; the site executes and returns confirmation + `audit_ref`; a `refund.processed` event follows. The same flow works whether fulfilled by direct actions, a checkout transport's post-purchase ops, or the brand agent.

## 5. Security & privacy

Refunds/cancellations MUST NOT execute without explicit approval. Order and evidence data require scoped authorization and MUST be minimised to the request. Evidence images are personal data: retention and access follow the site's policy and MUST NOT exceed the purpose. Audit applies (RFC-0003 §4.5). These rules bind every fulfilment path in §3.4 equally.

## 6. Backwards compatibility

Additive. `support` is a new optional capability; its actions/events use the existing action/event models. Unknown fields/paths MUST be ignored (RFC-0000 §3.9).

## 7. Acceptance criteria

- Declared support actions carry stable `id`s and correct risk tiers (`request_refund`/`cancel_order` = `high`).
- Financial support actions are approval-gated and produce an `audit_ref`.
- Order/evidence access is scoped; user-scoped support events require authorization.
- Whichever fulfilment path is used, equivalent outcomes and the same approval semantics apply.

## 8. Open questions

- A standard return/refund status enumeration and RMA object.
- Cross-path idempotency (e.g. avoid double refunds when both an agent and a checkout transport are present).
