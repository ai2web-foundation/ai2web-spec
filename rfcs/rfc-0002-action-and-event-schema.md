# RFC-0002 - Action & Event Schema

**Status:** Draft · **Version:** 0.1 · **Depends on:** RFC-0000, RFC-0001 · **Date:** 2026-07-09

## 1. Summary

Defines two structures: the **action** (a declared, callable operation) and the **event** (a structured, subscribable notification), including stable identifiers and the event payload envelope. Field-level shapes are defined by the AI2Web Specification and its JSON Schema; this document states the normative rules, not the full field list.

## 2. Motivation

Agents need a precise, machine-checkable contract for *what they can invoke* and *what they can subscribe to*, with unambiguous auth/approval semantics and a stable event payload shape. Without a fixed envelope, every site's events differ and assistants cannot generically consume them.

## 3. Specification

### 3.1 Action identity (MUST)
An action MUST carry a **stable identifier** distinct from its label:
- `id` - a stable, immutable identifier (`^[a-z0-9_]+$`). Once assigned it MUST NOT change or be reused for a different action, so agents can reference an action across versions.
- `name` - a machine name; MAY change between versions.
- `display_name` - OPTIONAL human-readable label; presentation only.

Agents MUST key on `id`, not `name`.

### 3.2 Action object (MUST)
Beyond identity, an action MUST declare: `description`, `method` (GET/POST/PUT/PATCH/DELETE), `endpoint`, `requires_auth`, `requires_user_approval`, `risk` (`low|medium|high`), and `input_schema` (a JSON Schema). It MAY declare `output_schema` and `idempotency_key` (RECOMMENDED for non-GET writes). The full field definitions are in the AI2Web Specification (§6) and JSON Schema.

- Write actions (non-GET) SHOULD be idempotent or accept an `idempotency_key`.
- `risk` is declared by the server; its client-side enforcement is defined in RFC-0003 and RFC-0006 (not restated here).

### 3.3 Event object (MUST)
Events are declared under `events` (spec §7): `endpoint`, `subscribe`, `delivery` (`webhook|poll|sse`), and `types` (each matching `^[a-z0-9_]+\.[a-z0-9_]+$`).

### 3.4 Event payload envelope (MUST)
Every delivered event MUST use this envelope:
```json
{
  "type": "order.shipped",
  "id": "evt_01H...",
  "occurred_at": "2026-07-09T10:31:00Z",
  "subject": { "kind": "order", "id": "A1023" },
  "data": { "carrier": "DPD", "tracking": "..." }
}
```
Required: `type`, `id`, `occurred_at` (RFC 3339). `subject`/`data` are event-specific.

### 3.5 Standard event vocabulary (SHOULD)
`order.created|shipped|delayed|delivered` · `return.requested|approved|rejected` · `refund.processed` · `booking.confirmed|changed|cancelled|reminder` · `support_ticket.updated` · `product.back_in_stock` · `price.drop` · `new_article.published`. Sites MAY define namespaced custom types.

### 3.6 Subscription authorization
User-specific events (e.g. `order.*`, `booking.*`) MUST require authorization and consent (RFC-0003). Public events (e.g. `new_article.published`) MAY be anonymous.

## 4. Examples
Illustrative `actions` and `events` are given in the AI2Web Specification (Appendix B) and reference manifests. A delivered `order.shipped` follows §3.4.

## 5. Security & privacy
Discovery of actions is not execution (RFC-0000 §3.4). Event subscriptions to personal data require scoped, revocable authorization (RFC-0003). Payloads MUST NOT include more personal data than the subscription's scope permits.

## 6. Backwards compatibility
Additive: the envelope constrains delivered payloads; identity (§3.1) requires a stable `id`. Agents MUST ignore unknown fields (RFC-0000 §3.9).

## 7. Acceptance criteria
- Every declared action carries a stable `id` and validates against the action schema in the specification.
- Every declared event `type` matches the naming pattern.
- Delivered events carry `type` + `id` + `occurred_at`.
- User-scoped event subscriptions require auth + consent.

## 8. Open questions
- Batch/digest delivery for high-volume events.
- Event schema registry vs. free-form `data`.
