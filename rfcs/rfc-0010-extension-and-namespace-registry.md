# RFC-0010 - Extension & Namespace Registry

**Status:** Draft · **Version:** 0.1 · **Depends on:** RFC-0000, RFC-0001 · **Date:** 2026-07-10

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, RECOMMENDED, and MAY are to be interpreted as in RFC 2119/8174.

## 1. Summary

Governs how `ai2w` is extended: the `x-<namespace>` extension mechanism, the reserved names, the `extensions` module, and a lightweight namespace registry that prevents collisions without gatekeeping. The goal is extensibility without fragmentation, so the ecosystem does not repeat the pattern of a thousand incompatible, overlapping vendor formats.

## 2. Motivation

Every successful format eventually accretes vendor-specific and community extensions. Without a discipline for it, that accretion fragments the model: two vendors invent different keys for the same concept, agents cannot rely on anything, and the "describe once" promise (specification §1) erodes. `ai2w` needs a clear, permissionless-but-coordinated extension mechanism and a way to discover which extensions a manifest uses.

## 3. Specification

### 3.1 Extension mechanism (MUST)
Extensions are namespaced keys of the form `x-<namespace>` (specification §10). An extension MUST NOT override or redefine core semantics; where a core field or module already expresses a concept, implementations MUST use it rather than a parallel extension. Consumers MUST ignore unknown fields, including unknown extensions (RFC-0000 §3.9).

### 3.2 Namespace format and reservations (MUST)
A `<namespace>` is a lowercase, DNS-safe identifier (letters, digits, and hyphens). The following are reserved:
- `x-ai2w-*` is reserved for the project and MUST NOT be used by third parties.
- The canonical module names (`content`, `commerce`, `support`, `actions`, `events`, `communication`, `identity`, `search`, `agent`, `extensions`) and the core top-level field names are reserved and MUST NOT be shadowed by an extension.

### 3.3 The `extensions` module (SHOULD)
A manifest that carries extensions SHOULD declare them in the canonical `extensions` capability, enumerating the active namespaces (and OPTIONALLY a spec URL per namespace), so an agent can discover what is present and decide what it understands. Absence of the `extensions` module does not forbid `x-` keys; it means they are undeclared and simply ignored by agents that do not recognise them.

### 3.4 Registry (SHOULD)
A namespace registry (community-operated, out of the normative protocol) records `namespace -> owner -> specification URL` to prevent collisions. Registration is lightweight and additive. Use of an unregistered `x-` namespace is permitted (the mechanism is permissionless), but a party that wants a stable, collision-free namespace SHOULD register it. The registry is a coordination surface, not a gate on using the protocol.

### 3.5 Promotion path
A widely adopted extension MAY be proposed for promotion into a core module or field through a new RFC that updates the specification, the JSON Schema, and the conformance cases together. Promotion is how proven ideas become interoperable defaults instead of permanent vendor silos.

### 3.6 Anti-fragmentation rules
- Prefer reusing an existing module, field, or transport over introducing a namespace.
- One concept SHOULD have one representation; do not mint a vendor key for something a core field already covers.
- Extensions carry vendor-specific detail, not alternative core behaviour.

## 4. Examples

```json
"capabilities": {
  "extensions": { "enabled": true, "namespaces": ["woocommerce", "shopify"] }
},
"x-woocommerce": { "store_id": "42" },
"x-shopify": { "shop": "acme.myshopify.com" }
```

## 5. Security & privacy considerations

Extensions are subject to the same rules as core fields: no personal or private data at the discovery layer (RFC-0009 §3.1), no override of consent, auth, or approval semantics (RFC-0003), and unknown extensions ignored rather than executed (RFC-0000 §3.9). An extension MUST NOT be a channel for undeclared capabilities or actions (RFC-0006 §3.1).

## 6. Backwards compatibility

Additive. The `x-<vendor>` mechanism and the `extensions` module already exist (specification §10, §4.2); this document formalises namespacing, reservations, and the registry. Existing manifests remain valid; unknown namespaces MUST be ignored.

## 7. Acceptance criteria

- Extensions use `x-<namespace>`; `x-ai2w-*` and core names are never shadowed.
- Declared extensions appear in the `extensions` module; undeclared `x-` keys are ignored, not errored.
- No extension overrides core auth/consent/approval semantics or introduces an undeclared capability.

## 8. Open questions

- Where the canonical registry lives and how registration is operated (community vs foundation).
- Whether namespaces should map to reverse-DNS identifiers for global uniqueness.
- A conformance test that rejects a manifest whose extension shadows a core name.
