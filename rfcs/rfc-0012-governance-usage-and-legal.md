# RFC-0012 - Governance, Usage Policy & Legal Transparency

**Status:** Draft · **Version:** 0.2 · **Depends on:** RFC-0000, RFC-0002, RFC-0003, RFC-0009 · **Date:** 2026-07-16

The key words MUST, MUST NOT, SHOULD, RECOMMENDED, and MAY are to be interpreted as in RFC 2119/8174.

## 1. Summary

Defines three optional manifest modules that let a site bound and disclose *how* its capabilities may be used:

- `governance` - operational limits (rate, data scope, consent mode, audit) that a conforming server **enforces** at the endpoint, not merely declares.
- `usage_policy` - declarative signals about acceptable bulk, monitoring, reproduction and training use.
- `legal` - transparency and legal metadata, including declarative fields relevant to AI-transparency obligations.

The central rule: **`governance` is declared in the manifest and enforced by the server; declaration without enforcement is not conformant.** `usage_policy` and `legal` are declarative aids and are advisory by nature.

## 2. Motivation

RFC-0003 specifies authentication and consent; RFC-0009 specifies privacy, audit and retention. What is still missing is a way to bound *how much* and *in what manner* an agent may exercise a capability (rate, data scope), to signal acceptable-use expectations, and to carry transparency metadata. A declaration that a server does not enforce is a weak guarantee. This RFC ties operational governance to server-side enforcement so the manifest is a contract, not a suggestion.

## 3. Specification

### 3.1 `governance` (object, optional) - enforced

- `rate_limits`: a global limit and optional per-action overrides, each `{ requests, window_seconds }`. A conforming server MUST enforce these and, on exceed, MUST return `429` with error code `rate_limited` (`retryable: true`).
- `data_scope`: per-action list of the data fields or classes an action may return. A server MUST NOT return fields outside the declared scope (extends the data-minimisation requirement of RFC-0009).
- `consent_mode`: per-action value in `none | preview | explicit | authenticated`, aligning with the approval flow of RFC-0003 §4.3. Where both this and RFC-0003 `consent`/`risk` apply, the **stricter** requirement governs.
- `audit`: per-action list of fields the server logs for state-changing actions (extends RFC-0009); the server returns an `audit_ref` per RFC-0003 §4.5.

### 3.2 `usage_policy` (object, optional) - declarative

Boolean allowance flags describing the operator's acceptable-use position: `bulk_extraction`, `price_monitoring`, `content_reproduction`, `model_training`. These are **declarative signals**; enforcement of them (bot management, terms of service, network controls) is out of band and out of scope for this RFC. A site MUST NOT declare a permissive flag it does not intend to honour.

### 3.3 `legal` (object, optional) - declarative

- `terms_url`, `privacy_url`, `jurisdiction`.
- `ai_transparency`: indicates the interface is machine-facing and that automated responses are disclosed as such.
- `ai_risk_classification`: an informational self-assessment label from `minimal | limited | high`. This is a **declarative aid**, not a determination of regulatory status.
- `data_processing_basis`, `restricted_uses`: optional strings/enums.

> **Scope (normative caveat).** `usage_policy` and `legal` fields are declarative aids to transparency and due diligence. They are **not** legal compliance and **not** legal advice. Field definitions in the JSON Schema MUST be written against, and cite, the applicable regulation; implementations MUST NOT present these fields as certifying compliance.

### 3.4 Enforcement vs declaration

A conforming server MUST enforce every `governance.*` control. `usage_policy.*` and `legal.*` MAY be treated as advisory metadata. A validator MAY score governance completeness and expose it as a tier.

## 4. Examples

```json
{
  "governance": {
    "rate_limits": { "requests": 60, "window_seconds": 60,
      "per_action": { "search_products": { "requests": 120, "window_seconds": 60 } } },
    "consent_mode": { "request_refund": "explicit", "track_order": "authenticated" },
    "data_scope": { "track_order": ["order_id", "status", "eta"] },
    "audit": { "request_refund": ["order_id", "user_confirmation", "timestamp"] }
  },
  "usage_policy": { "bulk_extraction": false, "model_training": false },
  "legal": {
    "terms_url": "https://example.com/ai-terms",
    "jurisdiction": "EU",
    "ai_transparency": true,
    "ai_risk_classification": "limited"
  }
}
```

## 5. Security & privacy considerations

Rate limits mitigate enumeration and denial-of-service. `data_scope` operationalises data minimisation (RFC-0009). `consent_mode` composes with the RFC-0003 approval flow and the client credential rules; the stricter of the two always applies.

## 6. Backwards compatibility

Additive and optional. Unknown fields MUST be ignored (RFC-0000 §3.9). Existing manifests remain valid; absence of `governance` means only RFC-0003/RFC-0009 defaults apply.

## 7. Acceptance criteria

- A server enforces `rate_limits` (returns `429 rate_limited` on exceed).
- A server never returns fields outside `data_scope`.
- A server honours `consent_mode`, applying the stricter of it and RFC-0003.
- `legal`/`usage_policy` fields are defined against cited regulation and never presented as compliance certification.

## 8. Open questions

- A standard vocabulary for `restricted_uses`.
- Whether `ai_risk_classification` should reference an external taxonomy. `[VERIFY]` field definitions against the primary regulatory text before finalising the schema.
