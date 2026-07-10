# AI2Web Protocol Specification - `ai2w`

**Version:** 0.1 (Draft) · **Status:** Early technical draft · **Date:** 2026-07-09
**Steward:** AI2Web Foundation · **Licence:** CC-BY 4.0

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are to be interpreted as in RFC 2119.

---

## 1. Overview

AI2Web is a protocol that lets a website expose a **capability model** to AI agents, and negotiate a shared capability set with them. It answers six questions for any visiting agent:

1. **Who are you?** - identity
2. **What do you know?** - content, products, services, docs, policies
3. **What can you do?** - actions
4. **How do I authenticate?** - auth
5. **How do I communicate?** - transports + negotiation
6. **What events can I subscribe to?** - events

AI2Web **does not define a transport protocol**. It defines the *model* above transports (MCP, REST, feeds) and a *negotiation handshake* to choose between them. This is the protocol's permanent scope boundary.

### 1.1 Layered position

```
robots.txt   → a site exists
sitemap.xml  → its pages
schema.org   → its entities
OpenAPI      → its API
OAuth        → identity
MCP          → callable tools
AI2Web       → the whole business: model + discovery + negotiation + events   ← this spec
```

---

## 2. Endpoints

| Endpoint | Requirement | Purpose |
|---|---|---|
| `GET /ai2w` | **MUST** | Canonical home. Returns the AI2Web **manifest** (JSON). |
| `GET /.well-known/ai2w` | **MUST** | Discovery anchor (RFC 8615). Returns the manifest **or** a `{ "ai2w": "<url>" }` pointer / 302 redirect to `/ai2w`. Guarantees zero-knowledge discovery. |
| `GET|POST /ai2w/negotiate` | **SHOULD** | Capability negotiation (§5). |
| `GET /ai2w/{module}` | per-module | Live module routes, e.g. `/ai2w/content`, `/ai2w/products`, `/ai2w/actions`, `/ai2w/events`, `/ai2w/search`, `/ai2w/agent`, `/ai2w/mcp`. |
| `GET /ai` or `/.ai` | MAY | Non-normative friendly alias → `/ai2w`. |

Responses MUST be `application/json` (UTF-8). Discovery endpoints SHOULD be publicly accessible unless the entire site is private, and SHOULD send permissive CORS (`Access-Control-Allow-Origin: *`) for read-only discovery.

> **Discovery is pluggable.** `/.well-known/ai2w` is a *bootstrap* anchor for use while no neutral cross-vendor discovery standard exists. The capability model - not the location - is the normative core; if a neutral mechanism is standardised (e.g. a common `/.well-known/ai`, or a reference from `llms.txt`/`robots.txt`/structured metadata), AI2Web is carried by it rather than competing with it. See RFC-0000 §11 and RFC-0001 §3.4.

---

## 3. The manifest

`GET /ai2w` returns the manifest. It is the serialised capability model.

### 3.1 Top-level fields

| Field | Req | Type | Notes |
|---|---|---|---|
| `protocol` | MUST | string | Always `"ai2w"`. |
| `version` | MUST | string | Spec version, e.g. `"0.1"`. SemVer once stable. |
| `site` | MUST | object | Identity (§4.1). |
| `capabilities` | MUST | object | Declared capabilities (§4.2). |
| `identity` | SHOULD | object | Legal/trust metadata (§4.3). |
| `transports` | SHOULD | object | Available transports for negotiation (§4.4). |
| `auth` | cond. | object | Required if any protected capability exists (§4.5). |
| `consent` | cond. | object | Required if action capabilities exist (§4.6). |
| `actions` | MAY | array | Inline action declarations (§6); MAY be served at `/ai2w/actions`. |
| `events` | MAY | object | Subscribable events (§7). |
| `agent_service` | MAY | object | Site's own AI agent (§8). |
| `rate_limits` | MAY | object | Advertised limits. |
| `contact` | SHOULD | object | Support + security contact. |
| `x-*` | MAY | any | Namespaced extensions (§10). |

### 3.2 Minimum valid manifest

```json
{
  "protocol": "ai2w",
  "version": "0.1",
  "site": { "name": "Example Store", "url": "https://example.com", "type": "ecommerce" },
  "capabilities": { "content": true, "commerce": true }
}
```

---

## 4. Core objects

### 4.1 `site` (MUST)
```json
{ "name": "Example Store", "url": "https://example.com", "type": "ecommerce",
  "description": "Online footwear retailer.", "jurisdiction": "GB", "languages": ["en-GB"], "logo": "https://example.com/logo.png" }
```
Required: `name`, `url`, `type`. `type` is a free string; common values: `ecommerce`, `saas`, `publisher`, `services`, `booking`, `government`, `education`, `healthcare`, `other`.

### 4.2 `capabilities` (MUST)
A map of **module name → boolean | object**. Boolean = declared/undeclared. Object = declared with detail.

Canonical modules: `content · commerce · support · actions · events · communication · identity · search · agent · extensions`. The **`support`** module covers post-purchase support - order tracking, returns, refunds, cancellations, issue reporting and human handoff - profiled in RFC-0007. The **`content`** and **`search`** modules are profiled in RFC-0008, and the **`extensions`** module in RFC-0010.

```json
"capabilities": {
  "content": true,
  "commerce": { "enabled": true, "endpoint": "/ai2w/products", "checkout": false },
  "search":  { "enabled": true, "endpoint": "/ai2w/search" },
  "actions": { "enabled": true, "endpoint": "/ai2w/actions" },
  "events":  { "enabled": true, "endpoint": "/ai2w/events" },
  "booking": false
}
```
Structured capability object fields: `enabled` (bool, MUST), `endpoint` (string), plus module-specific keys. Commerce is **one module among equals** - the model is not commerce-centric.

### 4.3 `identity` (SHOULD for commercial/regulated)
```json
{ "legal_name": "Example Store Ltd", "privacy_policy": "https://example.com/privacy",
  "terms": "https://example.com/terms", "support_url": "https://example.com/support" }
```

### 4.4 `transports` (SHOULD)
Declares which transports the site can speak, for negotiation (§5). AI2Web is a **multi-protocol interoperability layer**: it provides one capability model across whichever protocols a site supports, and references them - it never redefines them (§1, §13 - the permanent scope boundary). The set is **open and additive**: a site may advertise any of the recognised transports and future ones, exactly as a browser supports HTTP/1.1, HTTP/2, HTTP/3, WebSockets and WebRTC behind one experience without being tied to any of them. Adapter rules and the full profile list are in RFC-0006.
```json
"transports": {
  "rest":    { "enabled": true, "base": "/ai2w" },
  "mcp":     { "enabled": true, "endpoint": "/ai2w/mcp" },
  "acp":     { "enabled": true, "endpoint": "/ai2w/acp" },
  "graphql": { "enabled": false, "endpoint": "/ai2w/graphql" },
  "openapi": { "enabled": false, "url": "/openapi.json" },
  "feeds":   { "product_feed": "/ai2w/products.json", "json_feed": "/ai2w/feed.json" },
  "webhooks":{ "enabled": true, "endpoint": "/ai2w/events" },
  "cms_abilities": { "enabled": false },
  "webmcp":  { "enabled": false }
}
```

**Transport taxonomy (backend-first).** AI2Web is API-driven. Each module maps to the transport(s) best suited to it (this is guidance, not an exhaustive list - see RFC-0006 for the open profile set):

| Module | Primary transport(s) | Notes |
|---|---|---|
| content, search | REST + feeds (JSON/RSS), MCP | Read-oriented; cache-friendly. |
| actions, agent | **MCP** (+ REST) | General tool/action invocation, headless. |
| commerce | **ACP** (checkout) + product feed + MCP | AI2Web does NOT reimplement checkout; the commerce module **points to / emits ACP**. |
| events | webhook / SSE / poll | Push/subscribe. |

- **MCP** and **ACP** are backend/API-driven → the reliable, headless, transactional, auditable default. Both are **generated** from the capability model.
- **WebMCP** is frontend/DOM-driven (depends on JS, page state, a live browser). It is an **optional adapter**, `enabled: false` by default, generated *later* for frontend-only sites and agentic-browser contexts. Backend-first core; WebMCP deferred, never rejected - if agentic browsers matter, the site adds the adapter with no rework.

### 4.5 `auth` (conditional)
```json
{ "methods": ["none", "oauth2"],
  "oauth2": { "authorization_url": "https://example.com/oauth/authorize",
              "token_url": "https://example.com/oauth/token", "pkce": true,
              "scopes": ["read_products","read_orders","track_delivery","submit_form","create_cart","checkout"] } }
```
Methods: `none`, `oauth2` (RECOMMENDED, with PKCE), `signed_request`, `session`, `api_key` (server-to-server only). Consumer flows SHOULD use `oauth2`+PKCE with short-lived, scoped, revocable tokens. Static consumer API keys SHOULD NOT be used.

### 4.6 `consent` (conditional)
```json
{ "requires_user_approval_for": ["purchase","payment","account_change","data_export","booking_confirmation","support_escalation"] }
```

---

## 5. Capability negotiation

This is what makes `ai2w` a **protocol**, not just a manifest format. Modelled on HTTP content negotiation: the **site advertises its full capability set; the agent uses the subset it understands**. New agent capabilities require **no site change**.

### 5.1 Handshake
`POST /ai2w/negotiate`
```json
// Agent → Site
{ "agent": { "id": "claude", "supports": {
    "transports": ["mcp","rest"],
    "capabilities": ["content","commerce","events"],
    "auth": ["oauth2"] } } }
```
```json
// Site → Agent
{ "negotiated": {
    "transport": "mcp",
    "capabilities": ["content","commerce","events"],
    "auth": "oauth2",
    "endpoints": { "commerce": "/ai2w/products", "events": "/ai2w/events", "mcp": "/ai2w/mcp" } },
  "unsupported": [] }
```

### 5.2 Static negotiation
Agents MAY skip the handshake and self-select from the manifest's `capabilities` + `transports`. The result MUST be equivalent. `/ai2w/negotiate` exists for dynamic/authenticated negotiation and future extension.

### 5.3 Rules
- The site MUST offer the intersection of what both sides support.
- The site MUST NOT expose a capability at negotiation it does not honour.
- Absent/false capabilities MUST be treated as unsupported, never guessed.

---

## 6. Action model

Actions are structured, discoverable operations. Served inline or at `/ai2w/actions`.
```json
{ "name": "check_stock",
  "description": "Check availability by SKU, size and colour.",
  "method": "POST", "endpoint": "/ai2w/actions/check-stock",
  "requires_auth": false, "requires_user_approval": false, "risk": "low",
  "input_schema": { "type": "object", "properties": {
    "sku": {"type":"string"}, "size":{"type":"string"}, "colour":{"type":"string"} },
    "required": ["sku"] },
  "output_schema": { "type": "object" } }
```
Each action MUST declare `name`, `description`, `method`, `endpoint`, `requires_auth`, `requires_user_approval`, `risk`, `input_schema`. `risk` ∈ `low | medium | high` (§9). Discovery is not execution - declaring an action never performs it.

---

## 7. Events

Sites publish **structured events** an agent can subscribe to - the replacement for email newsletters/notifications. "Follow this site in your assistant" instead of "enter your email."

```json
"events": {
  "endpoint": "/ai2w/events",
  "subscribe": "/ai2w/events/subscribe",
  "delivery": ["webhook","poll"],
  "types": ["order.created","order.shipped","order.delayed","order.delivered",
            "refund.processed","support_ticket.updated","product.back_in_stock",
            "price.drop","new_article.published","booking.confirmed","booking.changed"] }
```
Event names use `namespace.event` dot notation. Subscriptions to user-specific events (e.g. `order.*`) MUST require authentication + consent. Public events (e.g. `new_article.published`) MAY be anonymous.

---

## 8. `agent_service` (agent-to-agent)

A site MAY expose its own AI agent so a user's agent can talk to the business's agent (A2A) instead of scraping.
```json
{ "enabled": true, "endpoint": "/ai2w/agent",
  "supported_intents": ["product_question","check_stock","track_order","start_return","raise_ticket","handoff_to_human"] }
```

---

## 9. Security model

**Principle: discovery is safe; execution is controlled.**

| Risk | Examples | Requirement |
|---|---|---|
| **low** | read content, search, public pricing | no auth, no approval |
| **medium** | create ticket, check order, reserve stock, request quote | auth SHOULD; approval MAY |
| **high** | purchase, payment, change/export personal data, confirm booking, cancel account, accept terms | auth MUST; user approval MUST |

Approval flow (high-risk): discover → prepare → **site returns action preview** → user approves → execute → confirmation + audit reference.

Principles: least privilege · explicit capability declaration · separation of discovery and execution · human approval for high-impact actions · strong auth for account actions · audit logging · rate limiting · no hidden write operations · safe default = read-only. **Make safe things easy and dangerous things explicit.**

Audit log SHOULD record: agent id (if any), user id (if any), action, approval status, result, timestamp, error (if any). Privacy, audit, and data-retention obligations are profiled in RFC-0009.

---

## 10. Extensions & versioning

- **Extensions:** namespaced keys `x-<vendor>` (e.g. `x-woocommerce`, `x-shopify`). Core fields remain stable; extensions never override core semantics. Namespacing, reserved names, and the registry are profiled in RFC-0010.
- **Versioning:** `version` uses SemVer once stable - `0.x` drafts, `1.0` stable, `1.x` backwards-compatible additions, `2.x` breaking. Version negotiation, deprecation, and compatibility rules are profiled in RFC-0011.
- **Unknown fields:** agents MUST ignore unknown fields (forward compatibility).

---

## 11. Compliance tiers

| Tier | Requirements |
|---|---|
| **Basic** | valid JSON · `protocol` · `version` · `site` · `capabilities` |
| **Standard** | Basic · `transports` · `consent` (if actions) · `contact` · negotiation supported |
| **Enterprise** | Standard · `identity` · `auth` · audit model · `rate_limits` · security contact |

The validator (`npx ai2web validate <url>`) reports the tier + an AI Readiness Score /100.

---

## 12. Error model

```json
{ "error": { "code": "approval_required", "message": "This action requires explicit user approval.", "retryable": true } }
```
Codes: `invalid_manifest · unsupported_capability · auth_required · approval_required · rate_limited · invalid_request · forbidden · temporarily_unavailable · human_handoff_required`.

---

## 13. Out of scope for v0.1

Transport definition (never - permanent boundary) · payment execution · identity verification · full checkout flow · legal contract execution · multi-agent negotiation beyond §5 · marketplace governance. These follow the discovery/model layer once validated.
