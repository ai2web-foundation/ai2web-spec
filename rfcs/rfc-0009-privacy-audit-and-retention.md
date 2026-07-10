# RFC-0009 - Privacy, Audit & Data Retention

**Status:** Draft · **Version:** 0.1 · **Depends on:** RFC-0000, RFC-0003 · **Date:** 2026-07-10

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, RECOMMENDED, and MAY are to be interpreted as in RFC 2119/8174.

## 1. Summary

Defines the privacy, audit-logging, and data-retention obligations for `ai2w`: what data may appear at the discovery layer, how personal data is handled by actions, what an audit log records, and how long implementations retain sensitive material. It turns the data-minimisation principle (RFC-0000 §3.10) and the security model (specification §9) into concrete, testable requirements.

## 2. Motivation

`ai2w` sits between users, agents, and sites, and adds a public discovery and (in the ecosystem) an analytics layer. That makes data leakage a first-class risk: a manifest, a discovery record, an analytics event, or an audit log could each expose more than intended. Privacy therefore needs one normative home rather than being scattered across other RFCs. This document is that home.

## 3. Specification

### 3.1 Discovery is public-only (MUST)
Discovery-level data (the manifest, the discovery anchor, any discovery-network record) MUST contain only public metadata. It MUST NOT contain personal data, credentials, order data, customer data, or any user-scoped record (RFC-0000 §3.10). Any ecosystem index or analytics surface built on discovery MUST store public metadata only and MUST NOT persist per-user data.

### 3.2 Personal data lives behind authorization (MUST)
Any action that reads or writes personal data is at least medium-risk and MUST require scoped authorization (RFC-0003). Actions that export, erase, rectify, or otherwise change personal data are high-risk and MUST require explicit user approval (specification §9, RFC-0003 §4.3). Implementations SHOULD expose data-subject-rights operations as a recognised action category (for example `data.access`, `data.export`, `data.rectify`, `data.erase`) so an agent can fulfil a user's request under approval rather than improvising.

### 3.3 Audit log (SHOULD)
An implementation SHOULD maintain an audit log. Each entry SHOULD record: agent id (if any), user id (if any), action, approval status, result, timestamp, and error (if any) (specification §9). For every high-risk action an implementation SHOULD return an `audit_ref` to the user. An audit entry MUST NOT store more personal data than is necessary to establish what happened; request/response bodies containing personal data SHOULD be referenced or redacted rather than copied verbatim.

### 3.4 Retention and minimisation (SHOULD)
Implementations SHOULD define and honour retention limits for tokens, authorization state, and audit logs. Credentials and short-lived authorization state (for example PKCE verifiers and pending-authorization records) MUST be one-time-use or short-lived (RFC-0003). Retained data SHOULD be the minimum needed for security, dispute resolution, and legal obligations, and no longer.

### 3.5 Transparency (SHOULD)
A site that handles personal data SHOULD declare `identity.privacy_policy` (specification §4.3; required at the Enterprise tier). It SHOULD make the data-subject-rights actions of §3.2 discoverable so an agent can act on a user's behalf. A site MAY additionally reference a rights or contact endpoint through `identity`/`contact`.

### 3.6 Cross-origin and same-origin data rules (MUST)
User data and credentials MUST NOT be sent to an origin other than the one they were issued for (the same-origin credential rule, RFC-0003 §4.4, RFC-0006 §3.4). Personal or sensitive data MUST NOT be placed in URLs, query strings, or any discovery-visible field.

## 4. Examples

A rights action, approval-gated:

```json
{ "name": "export_my_data", "id": "data.export", "method": "POST", "endpoint": "/ai2w/actions/data-export",
  "requires_auth": true, "requires_user_approval": true, "risk": "high", "input_schema": { "type": "object" } }
```

An audit reference returned after a high-risk action:

```json
{ "status": "completed", "audit_ref": "aud_01H8" }
```

## 5. Security & privacy considerations

This document is the privacy contract. The failure modes it closes are: personal data in a public manifest or discovery record; personal data in analytics; unbounded or over-broad audit logs; credentials or PII in URLs; and cross-origin data exfiltration. An implementation that violates §3.1, §3.2, or §3.6 is non-conformant even if functionally correct.

## 6. Backwards compatibility

Additive. It codifies obligations already implied by RFC-0000 §3.10 and specification §9; existing conformant manifests are unaffected. The `data.*` action category is a recommended vocabulary, not a required field. Unknown fields MUST be ignored (RFC-0000 §3.9).

## 7. Acceptance criteria

- No personal, order, or customer data appears in any manifest or discovery/analytics record.
- Personal-data actions require scoped auth; export/erase/rectify require approval.
- High-risk actions return an `audit_ref`; audit entries hold no unnecessary personal data.
- Credentials and PII never appear in URLs and are never sent cross-origin.

## 8. Open questions

- A standard, machine-readable `privacy` object (retention windows, DSAR endpoint, lawful basis) for a future specification version.
- Alignment of the `data.*` action category with GDPR/CCPA request types.
- Whether audit references should be verifiable (signed) receipts.
