# RFC-0003 - Authentication & Authorization

**Status:** Draft · **Version:** 0.1 · **Depends on:** RFC-0000, RFC-0001, RFC-0002 · **Date:** 2026-07-09

The key words MUST, MUST NOT, SHOULD, RECOMMENDED, and MAY are to be interpreted as in RFC 2119/8174.

## 1. Summary

Defines how a site advertises **authentication** (establishing who an agent/user is) and **authorization** (determining what that identity may do), the consent/approval model, and the credential-handling rules a client MUST follow.

> **Authentication ≠ Authorization.** Authentication establishes an identity; authorization determines what that identity is permitted to do. They are specified separately (§3 and §4) and MUST NOT be conflated.

## 2. Motivation

"Execution is controlled" (RFC-0000 §3.6–3.7) only works if identity and permission are precise and if clients handle credentials safely. Ambiguity here is a security liability, not merely an interop gap.

## 3. Authentication (who)

### 3.1 Methods (`auth.methods`)
- `none` - no authentication (public discovery/read; default).
- `oauth2` - **RECOMMENDED** for delegated user actions; MUST use PKCE. Tokens MUST be short-lived; refresh + revocation SHOULD be supported.
- `signed_request` - trusted server-to-server agents (HTTP message signatures).
- `session` - existing logged-in session (frontend contexts only).
- `api_key` - server-to-server only; MUST NOT be used for consumer/agent delegation.

### 3.2 OAuth2 metadata
When `oauth2` is offered, the site declares its authorization and token endpoints, `pkce: true`, and the scopes it supports. Field shapes are in the specification (§4.5).

## 4. Authorization & consent (what is permitted)

### 4.1 Scopes
Authorization is expressed as least-privilege, additive **scopes**. A RECOMMENDED vocabulary: `read_content`, `read_products`, `read_orders`, `track_delivery`, `submit_form`, `create_cart`, `checkout`, `manage_account`, `manage_subscription`, `read_reports`, `create_ticket`. Sites MAY define namespaced custom scopes.

### 4.2 Consent
`consent.requires_user_approval_for` lists action classes requiring explicit user approval. High-risk classes MUST be present when the corresponding capability exists: `purchase`, `payment`, `account_change`, `data_export`, `booking_confirmation`, `contract_acceptance`, `account_deletion`.

### 4.3 Approval flow (MUST for high-risk)
Discover → prepare → the site returns an **action preview** → the user approves → the site executes → the site returns confirmation + an `audit_ref`.

### 4.4 Client credential rules (MUST)
- A client MUST NOT attach a user's credential to a request whose **origin differs** from the origin the credential was issued for (same-origin rule).
- A client MUST verify that a target URL resolves to a safe public host before sending credentials (no loopback/private/link-local/metadata targets).
- A client MUST preview (seek approval) when the manifest requires approval, **or** when `risk` is `high`. The `high` rule holds even if the manifest declares `requires_user_approval: false` - this defends against a manifest under-declaring a destructive action. For `medium`, a client SHOULD preview but MAY execute an authenticated read directly (e.g. order tracking), so routine reads do not require a needless confirmation.

### 4.5 Audit
Servers SHOULD log agent identity, user identity, action `id`, approval status, result, timestamp, and error, returning an `audit_ref` on state-changing actions.

## 5. Security & privacy

This document is the security contract for execution. Static consumer API keys are prohibited for delegation (§3.1). Cross-origin credential transmission is prohibited (§4.4). An implementation MAY use any transport that satisfies these rules.

## 6. Backwards compatibility

Additive. §4.4 constrains client behaviour; unknown fields MUST be ignored (RFC-0000 §3.9).

## 7. Acceptance criteria

- Protected actions advertise `oauth2` + PKCE.
- High-risk capabilities declare matching `consent` entries.
- A conforming client refuses cross-origin credential sends and enforces risk-tier approval.

## 8. Open questions

- Dynamic client registration for agents.
- Delegated, capability-scoped tokens across A2A hops (RFC-0004).
