# RFC-0000 - Architecture & Design Principles

**Status:** Draft · **Version:** 0.1 · **Date:** 2026-07-09

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, RECOMMENDED, MAY, and OPTIONAL are to be interpreted as described in RFC 2119 and RFC 8174.

## 1. Summary

This document states the architectural principles that govern the `ai2w` protocol. The other RFCs (0001 and later) define concrete behaviour; they reference the principles here rather than restating them. Where a later document conflicts with a principle stated here, this document prevails unless the later document explicitly amends it.

## 2. What `ai2w` is (and is not)

`ai2w` is a **discovery and capability protocol**: a vendor-neutral way for a website to describe what it is and can do, and for an agent to discover, understand, and negotiate that. It is an **interoperability layer** across multiple agent protocols - not any one of them, and not an alternative to any of them.

`ai2w` is **not** a transport protocol, a commerce protocol, an authentication protocol, or an agent-to-agent transport. It references and negotiates those; it does not redefine them.

## 3. Principles

1. **Transport independence.** `ai2w` defines a capability model and a discovery/negotiation mechanism, not a wire transport. An implementation MAY expose the described behaviour through any transport that satisfies the relevant document.
2. **Multi-protocol by design.** A site MAY advertise multiple transports (for example MCP, ACP, REST, GraphQL, OpenAPI, webhooks, and future protocols). `ai2w` provides one discovery and capability model across them. Analogy: a web browser supports HTTP/1.1, HTTP/2, HTTP/3, WebSockets, and WebRTC behind one consistent experience without being tied to any of them.
3. **Protocols are adapters, not dependencies.** No transport is mandatory. The success or failure of any single transport MUST NOT invalidate a conforming manifest.
4. **Discovery is not execution.** Reading a manifest or discovering a capability MUST NOT cause a state change.
5. **Execution is capability-driven.** An agent acts only on capabilities and actions a site has explicitly declared.
6. **Consent precedes state changes.** State-changing or high-impact actions require explicit user approval (RFC-0003).
7. **Security before convenience.** Where a safe behaviour and a convenient behaviour conflict, the safe behaviour is normative.
8. **Backend-first.** The model is API-driven and does not depend on a rendered page, browser session, or DOM. Frontend-coupled transports are OPTIONAL adapters.
9. **Forward compatibility is mandatory.** Unknown fields MUST be ignored by consumers. New capabilities, transports, and profiles are additive.
10. **Least privilege and data minimisation.** Public discovery exposes only public metadata; private data requires scoped authorisation.
11. **Adopt neutral standards; do not reinvent discovery.** The **capability model is the durable contract**; the discovery envelope that carries it is a replaceable mechanism. Where a neutral, cross-vendor discovery mechanism exists or becomes standardised (for example a common `/.well-known/ai` manifest, or an entry in an existing surface such as `llms.txt`, `robots.txt`, or structured site metadata), `ai2w` SHOULD be carried by it rather than mandating a competing format. `ai2w`'s own discovery anchor is a bootstrap for use while no such neutral standard exists - not a rival discovery silo.

## 4. Layering

`ai2w` distinguishes three layers, which MUST be kept separate:

- **Protocol** - the normative behaviour in these RFCs and the specification. Implementation- and vendor-neutral.
- **Implementation** - conformant software. Referenced from project documentation, not from normative text.
- **Product/ecosystem** - tooling, hosted services, analytics, governance. Out of scope for the protocol.

## 5. Versioning

`ai2w` uses semantic versioning once stable (§ specification). Breaking changes require a new major version; a manifest declares the version it targets. Endpoints, field names, and profiles are designed so that a future major version can relocate or extend them without breaking discovery (RFC-0001).

## 6. Scope boundary

Permanently out of scope for `ai2w`: defining a transport, a payment mechanism, an identity-verification scheme, or a checkout flow. These are referenced as external protocols/profiles and negotiated, never redefined.
