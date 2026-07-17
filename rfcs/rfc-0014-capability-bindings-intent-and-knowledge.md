# RFC-0014 - Capability Bindings, Intent & Knowledge

**Status:** Draft · **Version:** 0.2 · **Depends on:** RFC-0001, RFC-0002, RFC-0003 · **Date:** 2026-07-16

The key words MUST, MUST NOT, SHOULD, RECOMMENDED, and MAY are to be interpreted as in RFC 2119/8174.

## 1. Summary

Enriches the capability and action model with: a semantic `intent` per action; multiple invocation `bindings` per action with priority and fallback; a top-level `knowledge` section declaring trusted grounding sources; and a fourth risk tier, `critical`. Together these let an agent match a capability to a user goal, choose the best available way to invoke it, ground on authoritative sources rather than scraping, and treat irreversible actions with the strictest controls.

## 2. Motivation

RFC-0002 defines actions with a single declared endpoint and transport. In practice the same capability is often reachable several ways (a structured API, a tool endpoint, or a human fallback), an agent needs to pick the best one it can use, and a model performs better when the site points it at authoritative content instead of leaving it to infer meaning from pages. A stable string name is also a weak way to match a capability to a user's goal; a declared semantic intent is stronger.

## 3. Specification

### 3.1 `intent` (string, optional, per action)

A semantic identifier for the action's purpose (for example `track_delivery`, `request_offer`, `start_return`). Namespaced custom intents are permitted (RFC-0010). `intent` is advisory: it aids goal-to-capability matching and MUST NOT change execution semantics.

### 3.2 `bindings` (array, optional, per action)

Each binding: `{ kind, ref, priority, fallback_only }` where `kind` is one of `rest | mcp | openapi | graphql | redirect | html`, `ref` locates it (endpoint, tool name, operationId, or URL), `priority` is an integer (lower is preferred), and `fallback_only` is a boolean.

- An agent SHOULD select the enabled binding with the lowest `priority` it is able to use.
- A binding with `fallback_only: true` MUST be used only when no non-fallback binding is usable.
- When `bindings` is absent, the action's declared endpoint and transport (RFC-0002) apply. This preserves backwards compatibility.

**Design intent (normative consequence).** Structured bindings keep execution inside the agent by default. A `redirect`/`html` binding, marked `fallback_only`, is the mechanism for a step an agent must not perform itself (for example entering payment or credentials, per RFC-0003 §4.4). Handoff is therefore an explicit last resort, never the default path.

### 3.3 `knowledge` (array, optional, top-level)

Each entry: `{ id, name, kind, ref, format }` where `kind` is one of `catalog | policy | faq | feed | index` and `ref` is a URL or endpoint. These declare authoritative content/data sources an agent SHOULD prefer for grounding over deriving content from rendered pages. Entries MAY reference an external structured index. `knowledge` is advisory and read-oriented; it grants no action rights.

### 3.4 Risk tier `critical`

Adds a fourth tier above `high` (RFC-0003) for irreversible or legally binding actions (for example settling a payment, accepting a contract). A `critical` action MUST require verified user approval, MUST require authentication, and MUST be audited (composing RFC-0003 §4 and RFC-0009). Consumers that do not recognise `critical` MUST treat it as at least `high`.

## 4. Examples

```json
{
  "name": "book_table",
  "intent": "reserve_table",
  "risk": "medium",
  "requires_user_approval": true,
  "bindings": [
    { "kind": "mcp", "ref": "book_table", "priority": 1 },
    { "kind": "rest", "ref": "/ai2w/actions/book-table", "priority": 2 },
    { "kind": "redirect", "ref": "/reserve", "priority": 9, "fallback_only": true }
  ]
}
```

```json
{
  "knowledge": [
    { "id": "menu", "name": "Menu", "kind": "catalog", "ref": "/ai2w/products", "format": "json" },
    { "id": "returns", "name": "Returns policy", "kind": "policy", "ref": "/policies/returns", "format": "html" }
  ]
}
```

## 5. Security & privacy considerations

`bindings` MUST NOT be a way to bypass consent: the RFC-0003 approval flow applies to an action regardless of which binding is used. The `fallback_only` handoff exists precisely so steps an agent must not perform are routed to a human context, consistent with the client credential rules (RFC-0003 §4.4). `knowledge` references MUST resolve to safe public hosts (RFC-0006).

## 6. Backwards compatibility

Additive. Single-endpoint actions are unaffected because `bindings`, `intent` and `knowledge` are optional. `critical` is a new enum value; unknown risk values are treated as at least `high`.

## 7. Acceptance criteria

- An agent selects the lowest-`priority` usable binding and uses a `fallback_only` binding only when nothing else is usable.
- A `critical` action is refused unless approval, authentication and audit are all satisfied.
- `knowledge` entries are read-only and grant no action rights.

## 8. Open questions

- A shared registry of standard `intent` values (composes with RFC-0010).
- Whether `knowledge` should express freshness/caching hints.
