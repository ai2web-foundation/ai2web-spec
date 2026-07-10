# RFC-0005 - Commerce Module & Checkout Transports

**Status:** Draft · **Version:** 0.1 · **Depends on:** RFC-0000, RFC-0001, RFC-0002, RFC-0003 · **Date:** 2026-07-09

The key words MUST, MUST NOT, SHOULD, RECOMMENDED, and MAY are to be interpreted as in RFC 2119/8174.

## 1. Summary

Profiles the `commerce` capability (product discovery, cart, checkout, returns, inventory) and defines the concept of a **checkout transport**. `ai2w` does not define checkout; it advertises which checkout transport a site supports and lets the agent use it. Commerce is one module among equals (RFC-0000 §3.3).

## 2. Motivation

Commerce is the highest-value early use case and the most sensitive (money, PII). It MUST reuse existing, hardened checkout rails rather than a new one, and MUST NOT tie the protocol to any single commerce vendor.

## 3. Specification

### 3.1 `commerce` capability object
The `commerce` capability MAY declare `search`, `cart`, `checkout`, `returns`, and `inventory`. `checkout: true` asserts checkout support (the boolean shorthand `commerce: true` does not). When `checkout` is true, the site MUST advertise at least one **checkout transport** (§3.3) and MUST list `purchase`/`payment` in `consent` (RFC-0003 §4.2). Field shapes are in the specification.

### 3.2 Product data (SHOULD)
A product item SHOULD carry at least a stable `id`, `title`, `price`, `currency`, and `availability`, and MAY carry `variant_id`, `description`, `url`, `images`, `inventory`, `brand`, `categories`, `attributes`, `shipping`, and `returns`.

### 3.3 Checkout transports (transport-independent)
A **checkout transport** is an external commerce protocol a site exposes for completing a purchase. `ai2w` treats it as one of the negotiable transports (RFC-0000 §3.2–3.3): the site advertises which it supports; the agent completes the purchase over that transport. `ai2w` never defines the checkout flow itself.

Checkout transports are defined as **profiles**, so new ones can be added without changing this document:

- **Profile 1 - ACP** (Agentic Commerce Protocol).
- Additional profiles MAY be registered as they emerge (for example vendor or platform commerce protocols such as Google, Shopify, Amazon, Stripe, or OpenAI Commerce). The protocol is agnostic to which are present.

A site declares the checkout transport under `transports`; a `checkout` action (RFC-0002) references it. Purchase/payment MUST follow the approval flow (RFC-0003 §4.3).

### 3.4 Commerce actions
Typical actions (RFC-0002): `check_stock` (low), `create_cart` (low/medium), `calculate_shipping` (low), `start_return` (medium), `checkout` (high - approval + a checkout transport). Order events per RFC-0002.

## 4. Examples

Illustrative `commerce` capabilities, a checkout transport, and commerce actions are given in the AI2Web Specification and reference manifests.

## 5. Security & privacy

No purchase or payment without explicit approval (RFC-0003). Order/PII access requires scoped authorization. Discovery-level metadata MUST NOT include order or customer data.

## 6. Backwards compatibility

Additive. New checkout-transport profiles are registered without breaking existing manifests; unknown transports MUST be ignored (RFC-0000 §3.9).

## 7. Acceptance criteria

- `checkout: true` ⇒ at least one advertised checkout transport + `purchase`/`payment` in `consent`.
- Product items carry at least `id`, `title`, `price`, `currency`, `availability`.
- The `checkout` action is `risk: high` and approval-gated.

## 8. Open questions

- A checkout-transport profile registry and profile-conformance requirements.
- Multi-currency / tax presentation.
