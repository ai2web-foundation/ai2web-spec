# RFC-0013 - Agent Identity & Verification

**Status:** Draft (design) · **Version:** 0.2 · **Depends on:** RFC-0003, RFC-0004, RFC-0006, RFC-0009 · **Date:** 2026-07-16

The key words MUST, MUST NOT, SHOULD, RECOMMENDED, and MAY are to be interpreted as in RFC 2119/8174.

> **Design-first RFC.** This document specifies how a site *declares* an agent-identity requirement and how an asserted identity is *verified*, by composing existing signature standards. It deliberately does **not** define a new cryptographic scheme. Implementation MUST NOT begin until the open questions in §8 (key discovery) are resolved.

## 1. Summary

Defines how a site declares that agents must identify themselves, the levels of identity assurance, and how a site verifies an agent's asserted identity so actions can be attributed and gated by verified identity. Verification reuses HTTP Message Signatures (RFC 9421) and the `signed_request` method already named in RFC-0003 §3.1.

## 2. Motivation

RFC-0003 §3.1 lists `signed_request` as an authentication method but does not specify the identity-requirement declaration or the verification handshake. Higher-risk and audited actions (RFC-0003 §4, RFC-0009) need reliable attribution: which agent, acting for which user, performed an action. Sites also need a principled way to distinguish cooperative identified agents from anonymous traffic without resorting to fragile heuristics.

## 3. Specification

### 3.1 Identity requirement (manifest)

`identity.agent` (object, optional):
- `required` (boolean, default `false`).
- `allow_anonymous` (boolean, default `true`).
- `methods` (array): a subset of `http_message_signatures`, `oauth_client`, `attestation`.
- `min_level` (enum, optional): the minimum assurance level required to perform protected actions (see §3.3).

### 3.2 Verification methods

- `http_message_signatures`: the agent signs requests per **RFC 9421**. The site verifies the signature against the agent's public key, discovered per §8. Signatures MUST include a timestamp and nonce (or equivalent) so the server can reject replays.
- `oauth_client`: the agent authenticates as an OAuth client (client-credentials or attestation), composing with RFC-0003 §3.

### 3.3 Assurance levels

- `anonymous` - no identity asserted.
- `identified` - an identity is asserted but not cryptographically verified.
- `verified` - an identity is asserted and cryptographically verified by the server.

A site MAY require a minimum level per action (via `identity.agent.min_level` and/or per-action metadata), composing with `governance.consent_mode` (RFC-0012) and `risk` (RFC-0003).

### 3.4 Server behaviour

If `identity.agent.required` is true and the request's level is below the required level, the server MUST reject with `401` and error code `identity_required`. On success, the verified agent identity SHOULD be included in the audit record (RFC-0009). Key material and any discovery documents MUST be fetched only over safe public hosts (RFC-0006 SSRF rules).

### 3.5 Non-goals

This RFC does not define a new signature or key format; it composes RFC 9421 and OAuth. It does not mandate any specific bot-verification programme.

## 4. Examples

```json
{
  "identity": {
    "agent": {
      "required": true,
      "allow_anonymous": false,
      "methods": ["http_message_signatures"],
      "min_level": "verified"
    }
  }
}
```

## 5. Security & privacy considerations

Verification prevents spoofed attribution and lets a site apply stricter policy to unverified callers. Replay protection is mandatory (§3.2). Verified identity is sensitive; it is logged under the retention rules of RFC-0009 and MUST NOT be published to other callers. Anonymous access remains the default so the change is opt-in.

## 6. Backwards compatibility

Additive. Defaults (`required: false`, `allow_anonymous: true`) mean existing sites are unaffected. Unknown fields MUST be ignored.

## 7. Acceptance criteria

- With `required: true` and `min_level: verified`, a server rejects unsigned/unverifiable requests with `401 identity_required`.
- Signatures are validated per RFC 9421, including replay protection.
- Verified identity appears in the audit record.

## 8. Open questions (must resolve before implementation)

- **Key discovery.** How does a site obtain an agent's public key? Candidates: a well-known agent key document published by the agent operator, an existing verified-agent programme, or a key registry. `[VERIFY]` the current state of interoperable options and choose one before writing code.
- Whether to define an assurance-level vocabulary shared with RFC-0004 (agent-to-agent).
