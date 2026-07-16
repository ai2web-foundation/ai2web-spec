<div align="center">
  <a href="https://ai2web.dev">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/ai2web-foundation/.github/main/profile/ai2web-logo-white.svg">
      <img alt="AI2Web" src="https://raw.githubusercontent.com/ai2web-foundation/.github/main/profile/ai2web-logo-black.svg" width="200">
    </picture>
  </a>
</div>

# AI2Web Specification (`ai2w`)

> **Describe your website once. AI2Web makes it understandable to every AI.**

This repository is the open, vendor-neutral **AI2Web protocol** - the canonical capability model that lets any website describe *what it is*, *what it knows*, *what it can do*, *how to authenticate*, *how to communicate*, and *what events an agent can subscribe to*, then **negotiate** a capability set with an AI agent.

AI2Web is a **protocol + specification**. It deliberately **does not define a transport** - it rides existing ones (MCP, REST, feeds) and negotiates which to use. That boundary is what makes it durable: when a new transport wins, AI2Web adds an adapter instead of being replaced.

## What's here

| Path | Contents |
|---|---|
| [`spec/ai2w-v0.1.md`](spec/ai2w-v0.1.md) | The protocol specification (capability model, manifest, negotiation, modules, actions, events, security, versioning). |
| [`schema/ai2w-manifest-0.1.schema.json`](schema/ai2w-manifest-0.1.schema.json) | JSON Schema - the machine-readable source of truth for validation. |
| [`examples/`](examples/) | Reference manifests: ecommerce, SaaS, booking/services, publisher. |
| [`rfcs/`](rfcs/) | RFC-0000–0007 (architecture/principles, discovery, action/event schema, auth/authz, A2A, commerce/checkout-transports, adapter conformance, support & post-purchase) + template. Implementation-neutral. See [`rfcs/README.md`](rfcs/README.md). |

## The one primitive everything hangs off

```
Capability Model  →  Framework  →  Discovery Network  →  Analytics
  (this repo)         (@ai2web/*)     (ai2web.dev)         (Polarize)
```

The capability model is *the product*. This repo defines it; everything else is downstream.

## Discovery in one glance

```
GET https://example.com/ai2w                 → the AI2Web manifest (canonical home)
GET https://example.com/.well-known/ai2w     → required discovery anchor → points to /ai2w
GET https://example.com/ai2w/negotiate       → capability-negotiation handshake
GET https://example.com/ai2w/{module}        → live module routes (content, products, actions, events, …)
```

## Status

**Draft v0.1** - early, breaking changes expected until v1.0. Governed by the **AI2Web Foundation**.

## Licence

- Protocol, specification, schema, RFCs, docs: **CC-BY 4.0**.
- Reference code (in sibling repos): **MIT**.
