# RFC-0008 - Content & Search Capability Profile

**Status:** Draft · **Version:** 0.1 · **Depends on:** RFC-0000, RFC-0001, RFC-0002 · **Date:** 2026-07-10

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, RECOMMENDED, and MAY are to be interpreted as in RFC 2119/8174.

## 1. Summary

Profiles the `content` and `search` capability modules: how a site describes its readable, structured content (articles, pages, docs, FAQs, catalog entries) and a query interface over it, so an agent can read and search a site without scraping or rendering HTML. Both are read-only, low-risk capabilities. Content and search are modules among equals (RFC-0000 §3.3); this document does not make the model content-centric.

## 2. Motivation

The most common thing an agent needs is also the most wasteful today: reading and searching a site. Making a model fetch and render a full page to extract one answer burns compute, bandwidth, and energy (RFC-0000 §3.10, specification §1). A declared content and search surface lets an agent request a few kilobytes of structured meaning instead. Content is where the freshness, format, and licensing concerns live, and search is where result quality and privacy boundaries live; both deserve a profile so implementations behave consistently.

## 3. Specification

### 3.1 `content` capability object
The `content` capability MAY be a boolean or an object. When an object, it MAY declare `endpoint`, `formats` (for example `json`, `feed`, `sitemap`), `types` (for example `article`, `page`, `faq`, `doc`, `product`), `collections` (named groupings), and `updated` (freshness). Content is READ-ONLY and low-risk (specification §9): serving it MUST NOT require approval, MUST NOT cause a state change (RFC-0000 §3.4), and MUST expose only public data (§3.4 below). Feed formats (JSON, RSS, sitemap) are read-only projections and follow the feeds adapter rules (RFC-0006 §4).

### 3.2 `content` item shape (SHOULD)
A content item SHOULD carry at least a stable `id`, `title`, `url`, and `type`, and SHOULD carry `updated` (last-modified). It MAY carry `summary`, `language`, `author`, `tags`, `collection`, and either an inline `body` or a `content_url`. Stable `id` and `url` MUST be durable across display or title changes (consistent with the stable-identifier rule of RFC-0002).

### 3.3 `search` capability object
The `search` capability MAY be a boolean or an object. When an object, it MAY declare `endpoint`, supported `modes` (for example `keyword`, `semantic`, `hybrid`), `filters`/`facets`, and pagination. A search query is a low-risk read: it MUST NOT require approval and MUST NOT trigger a state change. A search result item SHOULD carry a stable `id`, `url`, `title`, and `type`, and MAY carry `snippet`, `score`, and `collection`. Results MUST be pageable in a bounded, predictable way.

### 3.4 Privacy boundary (MUST)
Content and search describe and return **public** data only. An implementation MUST NOT expose non-public or authorization-gated records through the public `content` or `search` surface. Where a site offers user-scoped content or search (for example a customer's own documents), that surface is a distinct, authorized capability governed by RFC-0003 and RFC-0009, not the public profile in this document.

### 3.5 Freshness and caching (SHOULD)
Content items SHOULD carry an `updated` timestamp, and endpoints SHOULD emit standard HTTP cache and validation headers. Agents SHOULD honour them and prefer conditional or incremental fetches over re-reading unchanged content. This is the efficiency and sustainability property of the profile: structured, cacheable content replaces repeated full-page rendering.

### 3.6 Relationship to commerce
A product MAY be surfaced as a content or search item for discovery, but purchase, cart, and checkout remain the `commerce` capability (RFC-0005). Content and search never complete a transaction.

## 4. Examples

Illustrative `content` and `search` capability objects and item shapes are given in the specification (§4.2) and reference manifests. A minimal declaration:

```json
"capabilities": {
  "content": { "enabled": true, "endpoint": "/ai2w/content", "types": ["article", "faq"], "formats": ["json", "sitemap"] },
  "search":  { "enabled": true, "endpoint": "/ai2w/search", "modes": ["keyword", "semantic"] }
}
```

## 5. Security & privacy considerations

Both capabilities are low-risk reads with no auth and no approval (specification §9). The single hard rule is §3.4: no non-public or auth-gated data through the public surface. Endpoints SHOULD apply rate limiting and MAY apply cross-origin reads for public data (RFC-0006 §4 REST/feeds). Content licensing and attribution are the site's responsibility and are out of scope for the protocol.

## 6. Backwards compatibility

Additive. `content` and `search` already exist as canonical modules (specification §4.2); this document profiles their object form without changing the boolean shorthand. Unknown fields MUST be ignored (RFC-0000 §3.9).

## 7. Acceptance criteria

- `content`/`search` object declarations validate against the schema and expose only public data.
- Content items carry at least `id`, `title`, `url`, `type`; search results carry at least `id`, `url`, `title`.
- Reads cause no state change and require no approval.
- Endpoints emit cache/validation metadata; agents can fetch incrementally.

## 8. Open questions

- A standard content licensing / usage-rights field for AI consumption.
- Whether semantic-search result scoring should be normalised across implementations.
- Whether `content` should reference `llms.txt` or sitemap-derived indexes as first-class sources (RFC-0000 §3.11).
