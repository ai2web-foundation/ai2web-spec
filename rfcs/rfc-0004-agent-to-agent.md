# RFC-0004 - Agent-to-Agent (A2A)

**Status:** Draft · **Version:** 0.1 · **Depends on:** RFC-0000, RFC-0001, RFC-0003 · **Date:** 2026-07-09

## 1. Summary

Defines `agent_service`: a site's own AI agent endpoint that a user's agent can converse with, so the customer's assistant talks to the business's assistant rather than scraping or guessing workflows.

## 2. Motivation

Many sites will expose their own agent (over a CRM, help desk, or LLM). A2A lets a user agent resolve support, order, and booking intents through a structured conversation with a defined envelope - broader than a single tool call, and vendor-neutral behind the scenes.

## 3. Specification

### 3.1 `agent_service` object
`enabled` (bool), `endpoint`, `supported_intents` (string[]). Common intents: `answer_question`, `product_question`, `check_stock`, `track_order`, `start_return`, `raise_ticket`, `request_quote`, `check_availability`, `book_slot`, `handoff_to_human`.

### 3.2 Message envelope (MUST)
Request:
```json
{ "intent": "track_order", "message": "Where is order A1023?",
  "context": { "locale": "en-GB" }, "auth": "<bearer if required>" }
```
Response:
```json
{ "reply": "DPD attempted delivery at 14:31 yesterday.",
  "data": { "status": "attempted", "next": "redeliver" },
  "actions": ["rearrange_delivery"], "requires_user_approval": true,
  "handoff": { "available": true, "channel": "email" } }
```

### 3.3 Rules
- A site agent MUST NOT perform high-risk actions without the approval flow (RFC-0003 §3.4); `requires_user_approval` in a reply signals the user agent to seek confirmation.
- `handoff_to_human` MUST always be reachable when advertised.
- The site agent MAY return `actions` referencing declared actions (RFC-0002) for the user agent to invoke with proper auth/approval.

### 3.4 Relationship to A2A transports
`ai2w` **advertises and negotiates agent services independently of the underlying A2A transport.** `agent_service` describes *that* a site agent exists, which intents it supports, and how to reach it; the actual conversation MAY run over any agent-to-agent transport the site declares. `ai2w` does not define an A2A transport and does not compete with one (RFC-0000 §2).

## 4. Examples
Illustrative `agent_service` declarations are given in the AI2Web Specification and reference manifests.

## 5. Security & privacy
A2A does not bypass consent or approval. Personal-data replies require prior authorisation; audit applies (RFC-0003 §3.6).

## 6. Backwards compatibility
Additive; `agent_service` is already optional in v0.1.

## 7. Acceptance criteria
- `agent_service` advertises `supported_intents` and a reachable `endpoint`.
- Replies use the §3.2 envelope; high-risk outcomes set `requires_user_approval`.
- Advertised `handoff_to_human` resolves.

## 8. Open questions
- Streaming/multi-turn session continuity.
- Trust/identity between the two agents (agent attestation).
