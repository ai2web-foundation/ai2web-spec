# RFC-0001 - Discovery Protocol

**Status:** Draft · **Version:** 0.1 · **Depends on:** RFC-0000 · **Date:** 2026-07-09
**Supersedes:** the original "RFC-0001 Website Capability Discovery" draft.

The key words MUST, MUST NOT, SHOULD, RECOMMENDED, and MAY are to be interpreted as in RFC 2119/8174.

## 1. Summary

This document defines **discovery**: how an agent locates and reads a site's capability model, and how the two parties **negotiate** a shared capability set and transport. Negotiation is a phase of discovery, not a separate protocol.

## 2. Motivation

Agents need a reliable, transport-independent way to learn what a website is and can do, and to agree on how to interact given that both sides have different, evolving capabilities. This must hold regardless of which transports (per RFC-0000 §3.2) a site exposes.

## 3. Discovery

### 3.1 The canonical discovery endpoint
A site MUST publish a **canonical discovery endpoint**: a URL that returns the site's manifest. Its location is not fixed by this document, so that a future major version may relocate it without breaking discovery (RFC-0000 §5).

### 3.2 The discovery anchor
So that an agent with no prior knowledge can locate the canonical endpoint, a site MUST expose a **discovery anchor** at the well-known location `/.well-known/ai2w` (RFC 8615). The anchor MUST either:
- return the manifest directly, or
- return a pointer `{ "ai2w": "<absolute-url-of-canonical-endpoint>" }` (or an HTTP redirect) to the canonical endpoint.

The **RECOMMENDED** canonical endpoint is `/ai2w`. A site MAY additionally expose non-normative aliases (e.g. `/ai`). Only the anchor location is fixed; the canonical endpoint is discovered through it.

### 3.3 Response
The manifest MUST be a JSON document conforming to the AI2Web capability model. Its structure is defined by the specification and its JSON Schema (see the AI2Web Specification v0.1, §3–§4 and the manifest JSON Schema); this document does not restate the field definitions. Discovery responses SHOULD be publicly accessible and SHOULD permit cross-origin reads.

### 3.4 Discovery-mechanism neutrality
The **capability model - not the discovery location - is the normative core** of `ai2w` (RFC-0000 §11). A site MUST be discoverable, but the mechanism is pluggable:
- The AI2Web anchor `/.well-known/ai2w` (§3.2) is defined here as a **bootstrap** for use while no neutral, cross-vendor discovery standard exists.
- Where such a mechanism exists or is standardised - for example a common `/.well-known/ai` manifest, or a reference from an existing surface such as `llms.txt`, `robots.txt`, or structured site metadata - a site MAY advertise its `ai2w` capability model through it, and a conforming agent SHOULD honour it. `ai2w` adopts such a mechanism rather than competing with it.
- However a site is located, the capability model an agent retrieves MUST be identical. This keeps `ai2w` **complementary** to discovery standards: it contributes a capability model, not a rival discovery silo.

## 4. Capability negotiation

### 4.1 Purpose
The site advertises its full declared capability set and available transports; the agent consumes the subset it understands. New agent capabilities require no change to a conforming site.

### 4.2 Mechanism
An agent MAY negotiate dynamically by submitting the transports, capabilities, and auth methods it supports; the site responds with the intersection and the selected transport, auth method, and endpoints. An agent MAY instead self-select statically from the manifest; the outcome MUST be equivalent. The concrete request/response shape is defined in the specification (§5).

### 4.3 Rules
1. A site MUST offer only the intersection of mutually supported items.
2. A site MUST NOT advertise at negotiation any capability it will not honour.
3. Absent or disabled capabilities/transports MUST be treated as unsupported - never inferred.
4. Unknown fields MUST be ignored (RFC-0000 §3.9).
5. Only transports explicitly enabled are negotiable.

## 5. Transport independence

Discovery and negotiation are transport-independent. An implementation MAY expose these behaviours through any transport that satisfies this document; the manifest itself is retrieved over HTTP(S) at the anchor/canonical endpoint.

## 6. Security

Discovery is read-only and MUST NOT perform actions (RFC-0000 §3.4). Negotiation MUST NOT expose protected capabilities without the authorisation declared in the manifest (RFC-0003).

## 7. Acceptance criteria

- A discovery anchor exists at `/.well-known/ai2w` and resolves to (or points to) a manifest conforming to the specification.
- The manifest declares the protocol identifier, version, site identity, and capabilities.
- Capability negotiation is supported (dynamically or via documented static equivalence).
- Approval-sensitive actions are declared where relevant.

## 8. Related documents

Principles: RFC-0000. Actions/events: RFC-0002. Authentication/authorization: RFC-0003. Agent services: RFC-0004. Commerce/checkout: RFC-0005. Adapter conformance: RFC-0006. Field-level definitions and examples: the AI2Web Specification v0.1 and its JSON Schema.
