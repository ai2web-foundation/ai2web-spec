# RFC-0011 - Versioning, Deprecation & Compatibility

**Status:** Draft · **Version:** 0.1 · **Depends on:** RFC-0000, RFC-0001, RFC-0002 · **Date:** 2026-07-10

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, RECOMMENDED, and MAY are to be interpreted as in RFC 2119/8174.

## 1. Summary

Defines how `ai2w` evolves without breaking deployed sites or agents: the versioning scheme, how a version is negotiated, how fields and capabilities are deprecated and retired, and the compatibility rules that decide what counts as an additive versus a breaking change. It makes the forward-compatibility principle (RFC-0000 §3.9, §5) operational.

## 2. Motivation

A protocol that many sites and agents implement independently only stays coherent if change is disciplined. Sites upgrade at different times; agents must keep working against older manifests and must not be tricked into weaker behaviour by a version claim. This document gives one set of rules so evolution is safe, predictable, and non-fragmenting.

## 3. Specification

### 3.1 Versioning scheme (MUST)
`ai2w` uses semantic versioning once stable (specification §10). A manifest's `version` field declares the version it targets: `0.x` are drafts, `1.0` is the first stable release, `1.x` are backwards-compatible additions, and `2.x` and beyond are breaking. Consumers MUST tolerate patch and minor differences and MUST ignore unknown fields (RFC-0000 §3.9).

### 3.2 Version negotiation (SHOULD)
Discovery and negotiation (RFC-0001) MAY carry version information; when it does, the agent and site select a mutually supported behaviour. A site MAY advertise support for more than one version. Absent explicit negotiation, an agent SHOULD interpret a manifest according to its declared `version` and degrade gracefully on anything it does not recognise.

### 3.3 Deprecation (SHOULD)
A field, capability, transport, or action MAY be marked deprecated. A deprecation SHOULD carry `since` (the version it was deprecated in), an OPTIONAL `sunset` (the version or date after which it may be removed), and an OPTIONAL `replacement` (the successor to prefer). A deprecated item MUST continue to function until its sunset. Agents SHOULD prefer the `replacement` when one is given. Runtime responses MAY additionally signal deprecation using standard HTTP semantics (the `Deprecation` and `Sunset` headers, RFC 8594).

### 3.4 Compatibility rules (MUST)
- Additive changes (new optional fields, modules, transports, profiles, or actions) are minor and MUST NOT break existing consumers.
- Removing or renaming a field, changing its meaning, or tightening a requirement is breaking and requires a major version.
- Stable identifiers survive presentation changes: an action's `id` (RFC-0002) MUST remain stable across `display_name` or description changes.
- Unknown fields, modules, transports, and profiles MUST be ignored, never rejected (RFC-0000 §3.9).

### 3.5 Discovery stability across versions (MUST)
The discovery anchor MUST remain stable across versions and always resolve to the current manifest (RFC-0001). Endpoints, field names, and profiles are arranged so a future major version can relocate or extend behaviour without breaking discovery (RFC-0000 §5). A site MAY additionally expose version-specific endpoints, but the anchor is the stable entry point.

### 3.6 No insecure downgrade (MUST)
Version negotiation MUST NOT be used to weaken security. An agent MUST NOT downgrade to a version or profile that removes required approval or authorization for an action (RFC-0003, specification §9), and a site MUST NOT be induced to operate below its declared minimum. Where a version claim and observed behaviour disagree, the safer interpretation is normative (RFC-0000 §3.7).

## 4. Examples

A deprecated action pointing at its replacement:

```json
{ "name": "old_track", "id": "order.track.v1", "method": "GET", "endpoint": "/ai2w/actions/track",
  "requires_auth": true, "requires_user_approval": false, "risk": "medium", "input_schema": { "type": "object" },
  "deprecated": { "since": "1.2.0", "sunset": "2.0.0", "replacement": "order.track" } }
```

## 5. Security & privacy considerations

The principal risk is the downgrade attack of §3.6: a manipulated version claim that strips approval or auth. This document forbids it and defers to the safer interpretation. Deprecation metadata is public and MUST NOT reveal non-public data (RFC-0009 §3.1).

## 6. Backwards compatibility

Additive. It formalises the versioning already described in specification §10 and RFC-0000 §5 and adds an OPTIONAL `deprecated` marker. Manifests that omit `deprecated` are unaffected; unknown fields MUST be ignored.

## 7. Acceptance criteria

- `version` is interpreted per SemVer; patch/minor differences are tolerated and unknown fields ignored.
- Deprecated items keep working until sunset and advertise a replacement when one exists.
- Additive changes never break consumers; removals/renames/semantic changes only occur across a major version.
- No negotiation path weakens required approval or authorization; the discovery anchor is stable across versions.

## 8. Open questions

- Whether `ai2w` should define a formal deprecation-to-removal window (in versions or time).
- A machine-readable capability-diff between two advertised versions.
- Whether agents should pin a maximum supported version to bound their compatibility surface.
