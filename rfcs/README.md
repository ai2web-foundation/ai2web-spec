# AI2Web RFCs

Normative design documents for the `ai2w` protocol. They are **project RFCs** (specification proposals), not IETF Internet-Drafts (see *Status* below). They keep three layers separate - **protocol** (these documents + the specification), **implementation** (reference software, listed below), and **product/ecosystem** (tooling, hosted services) - and reference the specification and JSON Schema rather than restating field definitions.

All changes to protocol behaviour go through an RFC (copy [`rfc-template.md`](rfc-template.md)); an RFC is **Accepted** only when it updates the specification, the JSON Schema, and the conformance cases together.

| RFC | Title | Covers |
|---|---|---|
| [0000](rfc-0000-architecture-and-principles.md) | Architecture & Design Principles | transport independence, multi-protocol interoperability, layering, the principles 0001–0006 reference |
| [0001](rfc-0001-discovery-and-negotiation.md) | Discovery Protocol | the discovery anchor, the canonical endpoint (RECOMMENDED `/ai2w`), capability negotiation |
| [0002](rfc-0002-action-and-event-schema.md) | Action & Event Schema | stable action `id`/`name`/`display_name`, the event payload envelope, vocabulary |
| [0003](rfc-0003-authentication-and-consent.md) | Authentication & Authorization | auth methods, scopes, consent/approval, client credential rules (authN ≠ authZ) |
| [0004](rfc-0004-agent-to-agent.md) | Agent-to-Agent | `agent_service`, advertised/negotiated independently of the A2A transport |
| [0005](rfc-0005-commerce-profile.md) | Commerce Module & Checkout Transports | commerce capability; **checkout transports as profiles** (ACP = Profile 1) |
| [0006](rfc-0006-transport-conformance.md) | Transport Adapter Conformance | the rules every adapter obeys; open profile set (MCP, REST, GraphQL, OpenAPI, feeds, webhooks, checkout, CMS abilities, WebMCP) |
| [0007](rfc-0007-support-and-post-purchase.md) | Support & Post-Purchase | order tracking, returns, refunds, cancellations, issue reporting - via actions, checkout-transport post-purchase ops, or the brand agent |
| [0008](rfc-0008-content-and-search-profile.md) | Content & Search Capability Profile | the `content` and `search` modules; read-only, public-only, cache-friendly item and result shapes |
| [0009](rfc-0009-privacy-audit-and-retention.md) | Privacy, Audit & Data Retention | public-only discovery, personal-data actions, audit logging, retention and data minimisation |
| [0010](rfc-0010-extension-and-namespace-registry.md) | Extension & Namespace Registry | `x-<namespace>` extensions, reserved names, the `extensions` module, a collision-avoiding registry |
| [0011](rfc-0011-versioning-deprecation-and-compatibility.md) | Versioning, Deprecation & Compatibility | SemVer, version negotiation, the `deprecated` marker, additive-vs-breaking rules, no insecure downgrade |

## Reference implementations (project, non-normative)

The normative documents are implementation-neutral. Conformant reference implementations live in sibling repositories: `ai2web-js` (TypeScript), `ai2web-php`, `ai2web-python`, `ai2web-go`, `ai2web-dotnet`, and the `ai2web-wordpress` plugin. `ai2web-js` ships reference **transport adapters** - MCP (`@ai2web/mcp-bridge`), GraphQL (`@ai2web/graphql-adapter`), ACP checkout (`@ai2web/acp-adapter`, RFC-0005 Profile 1) and OpenAPI (`@ai2web/openapi-adapter`, descriptive). The executing adapters route through a single guarded executor so RFC-0006 §3 holds uniformly across transports; OpenAPI describes only declared actions and preserves their auth/risk semantics. Machine-runnable **adapter-conformance harnesses** (verifying RFC-0006 §3/§4 against adversarial manifests, for MCP, GraphQL/ACP and OpenAPI) ship with `ai2web-js` and run in CI. These are engineering artifacts, not part of the protocol.

## Status

These are **project RFCs** - a serious, internally consistent technical proposal used to guide the open specification and its implementations. They are **not** IETF Internet-Drafts and are not formatted or scoped for IETF submission: the IETF standardises protocols, not ecosystems, and would require removing implementation/product references (already stripped from the normative text here), IETF I-D structure/boilerplate, IANA and Security Considerations sections, and split normative/informative references. The intended path is to mature `ai2w` as an open specification with real implementations and adoption first, then pursue standardization (IETF, W3C, or a dedicated foundation) for the protocol elements that prove broadly useful.
