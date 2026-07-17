# RFC-0015 - Manifest Interoperability & Export Profiles

**Status:** Draft · **Version:** 0.2 · **Depends on:** RFC-0000, RFC-0001, RFC-0006, RFC-0014 · **Date:** 2026-07-16

The key words MUST, MUST NOT, SHOULD, RECOMMENDED, and MAY are to be interpreted as in RFC 2119/8174.

## 1. Summary

Defines how one capability model can be served in several wire formats and at several discovery locations, and how a site can serve agent-specific representations, so a site stays legible to whatever discovery convention an agent expects without maintaining more than one source of truth.

## 2. Motivation

The way agents discover a site's machine-readable description is still unsettled: several conventions and file locations exist and are evolving, and large platforms are introducing their own. A site should be able to describe its capabilities once and remain usable across those conventions, rather than betting on a single file name or format and being stranded if a different one prevails. This mirrors the transport strategy of RFC-0001 (one capability model, many transports), extended to the description format itself.

## 3. Specification

### 3.1 Canonical model

The AI2Web manifest (RFC-0001) is the single source of truth. Every representation defined here MUST be derived from it.

### 3.2 Export representations

A conforming implementation MAY emit the canonical model as additional representations, including: a well-known agent-description document; a plain-text content-and-guidance file; an OpenAPI description of the declared actions; and a tool listing for an agent-tool transport. Each export is a best-effort projection. Where a target representation cannot express a field, the exporter MUST omit that field rather than approximate or misstate it, and the mapping's lossiness MUST be documented.

### 3.3 Discovery surfaces

A site MAY serve the manifest and its exports at more than one location: the canonical `/ai2w` plus the well-known anchor (RFC-0001), and additional well-known paths that a target convention expects. All surfaces MUST derive from the one canonical model and MUST NOT diverge.

### 3.4 Per-agent profiles

A site MAY vary the representation it serves by request (for example a profile selector parameter, or content negotiation) to return the format a given agent expects. A profile selects a **representation or subset** only. A profile MUST NOT expose a capability, action, or data field that the canonical model does not, and MUST NOT relax any consent, auth, or governance requirement. Profiles are presentation, never policy.

### 3.5 Composing with external services

A site MAY reference an external content index or service rather than reproduce it: as a `knowledge` source (RFC-0014 §3.3) for reads, or as an action `binding` (RFC-0014 §3.2) for invocation. This lets a site compose with an adjacent content or discovery service instead of duplicating it. External references MUST resolve to safe public hosts (RFC-0006).

## 4. Examples

A mapping table (canonical field to each export representation, with lossiness notes) is maintained alongside the schema. Illustrative row:

| Canonical (`/ai2w`) | Well-known agent doc | Content text file | OpenAPI |
|---|---|---|---|
| `actions[]` with `bindings` | capability list (bindings flattened to primary) | omitted (reads only) | operations (write bindings only) |
| `knowledge[]` | knowledge list | linked sources | omitted |
| `consent` / `governance` | policy fields (subset) | omitted | `x-` extensions |

Lossiness note: a target that has no concept of consent MUST omit consent fields, not drop the requirement; the canonical `/ai2w` remains authoritative for execution.

## 5. Security & privacy considerations

Exports and profiles are the main new risk surface. An export MUST NOT leak any field beyond the canonical model. A profile MUST NOT widen capabilities or weaken consent/auth/governance (§3.4). External references MUST pass the SSRF checks of RFC-0006. Because the canonical `/ai2w` is always authoritative for execution, a lossy or stale export cannot escalate what an agent may do.

## 6. Backwards compatibility

Additive. A site that serves only `/ai2w` (RFC-0001) is fully conformant and unchanged. Exports, extra surfaces, and profiles are all optional.

## 7. Acceptance criteria

- Every export is derived from the one canonical model; no surface diverges.
- Lossy mappings are documented and omit rather than misstate.
- A profile never exposes a capability, or relaxes a control, absent from the canonical model.

## 8. Open questions

- Which specific well-known paths and target formats to emit first. `[VERIFY]` each target's current shape before emitting it, and record the chosen targets and their mapping tables alongside the schema.
- Whether profile selection should be standardised (parameter name vs negotiation).
