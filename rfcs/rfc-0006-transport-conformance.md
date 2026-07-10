# RFC-0006 - Transport Adapter Conformance

**Status:** Draft · **Version:** 0.1 · **Depends on:** RFC-0000, RFC-0001, RFC-0002, RFC-0003 · **Date:** 2026-07-09

The key words MUST, MUST NOT, SHOULD, and MAY are to be interpreted as in RFC 2119/8174.

## 1. Summary

Defines what it means for a **transport adapter** to be conformant: it MUST faithfully expose the declared capability model and preserve its authentication/authorization/approval/consent semantics - and add nothing the model does not declare. The set of adapters is open (RFC-0000 §3.2); this document defines the rules every adapter obeys and profiles the common ones.

## 2. Motivation

`ai2w` exposes one capability model across many transports. If an adapter drops approval gating, exposes undeclared capabilities, or leaks credentials, it breaks the security model regardless of how correct the manifest is. Every adapter - present or future - needs one conformance bar.

## 3. General adapter rules (MUST)

An adapter, for any transport, MUST:
1. Expose only capabilities/actions declared in the manifest - an adapter MUST NOT invent capabilities.
2. Preserve `requires_auth`, `requires_user_approval`, and `risk` semantics end to end.
3. Preview (seek approval) when the manifest requires approval or when `risk` is `high` - the `high` rule holds even if the manifest declares approval:false. `medium` SHOULD preview but MAY execute an authenticated read (RFC-0003 §4.4).
4. Not send user credentials to a different origin than the credential's issuing origin (same-origin rule, RFC-0003 §4.4).
5. Validate outbound targets as safe public hosts before fetching (no loopback/private/link-local/metadata).
6. Map errors to the AI2Web error model (specification §12).

These rules are transport-independent and apply equally to every profile in §4 and to any adapter not yet profiled.

## 4. Adapter profiles

The following transports are recognised; the list is open and additive (new profiles do not change §3):

- **MCP** - each declared action becomes a tool carrying the action's input schema; `agent_service` (RFC-0004) MAY be exposed as a single agent tool.
- **REST** - serves the discovery anchor, canonical endpoint, negotiation, and module/action routes (RFC-0001) with cross-origin reads for public data.
- **GraphQL** - exposes the declared model as a schema; resolvers MUST honour §3.
- **OpenAPI** - describes the declared actions as an API document referenced from the manifest.
- **Feeds** (JSON/RSS/product) - read-only projections of `content`/`commerce`; MUST NOT expose non-public or auth-gated data.
- **Webhooks** - event delivery (RFC-0002); user-scoped events require authorization.
- **Checkout transports** - commerce checkout profiles (RFC-0005); purchase/payment MUST remain approval-gated.
- **CMS ability adapters** (e.g. platform "abilities" APIs) - map platform-native capabilities into the model; MUST honour §3.
- **WebMCP** (OPTIONAL) - frontend/DOM-based; disabled by default. If provided it MUST still honour §3 and is never a substitute for a backend adapter.

## 5. Security & privacy

This document is the adapter security contract. An adapter that violates §3(2–5) is non-conformant even if functionally correct.

## 6. Backwards compatibility

Additive; new adapter profiles are registered without changing §3. Unknown transports MUST be ignored (RFC-0000 §3.9).

## 7. Acceptance criteria

- Adapter exposes exactly the declared capabilities/actions.
- Approval enforced by `risk` tier regardless of the manifest flag.
- No cross-origin credential transmission; no request to non-public hosts.
- Errors follow the AI2Web error model.

## 8. Open questions

- A language-neutral, machine-runnable adapter-conformance case file (portable across implementations).
- Profile-specific conformance requirements (e.g. GraphQL, checkout-transport profiles).
