# AI2Web Implementation Status

Living tracker of RFC ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ implementation coverage and the network/infra gaps.
Started 2026-07-18 during the "complete the project" build. `ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ done ÃÂÃÂÃÂÃÂ· ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ¡ partial ÃÂÃÂÃÂÃÂ· ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ missing`.

## RFCs

| RFC | Title | Status | Where / gap |
|---|---|---|---|
| 0000 | Architecture & Principles | ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ | Principles; reflected across code |
| 0001 | Discovery Protocol | ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ | `/ai2w` + `/.well-known/ai2w` + projections (SDK servers, WP, ai2web.dev fn, directory) |
| 0002 | Action & Event Schema | ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ | manifest actions + shared executor (event *schema*; analytics events = 0016) |
| 0003 | AuthN & AuthZ | ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ | OAuth2+PKCE (WP plugin, cloud oauth-store), consent gating |
| 0004 | Agent-to-Agent | ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ¡ | `agent_service` declared + connector; a first-class `/ai2w/agent` handler is thin |
| 0005 | Commerce & Checkout | ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ | ACP adapter, checkout gating |
| 0006 | Transport Adapter Conformance | ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ | mcp/graphql/acp/openapi adapters + shared executor + conformance harness |
| 0007 | Support & Post-Purchase | ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ | `support` module + WP commerce actions |
| 0008 | Content & Search Profile | ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ | content/search (directory fn, demo store) |
| 0009 | Privacy, Audit & Retention | ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ¡ | public-only + privacy policy; `audit_ref` emit + retention enforcement thin |
| 0010 | Extension & Namespace Registry | ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ¡ | `x-*` extend() mechanism ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ; the community registry ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ |
| 0011 | Versioning & Deprecation | ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ¡ | version validated + negotiation; `deprecated` marker handling thin |
| 0012 | Governance, Usage & Legal | ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ¡ | modules declared (v0.2 builder) ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ; runtime enforcement thin |
| 0013 | Agent Identity & Verification | ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ¡ | `agent_identity` module declared; agent-identity *verification* ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ |
| 0014 | Capability Bindings, Intent & Knowledge | ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ¡ | `knowledge()` builder ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ; intent/bindings surfaced only partially |
| 0015 | Manifest Interop & Export | ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ | `toLlmsTxt` / `toAgentJson` across SDKs |
| 0016 | Signals & Analytics | ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ | **not implemented** ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ no server-side event emit or sink |
| 0017 | Trust & Reputation | ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ | **not implemented** ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ no attestation / corroboration / scoring |

## Network / infra gaps (this build's focus)

| Item | Status | Plan |
|---|---|---|
| Directory verification (fetch `/.well-known/ai2w` server-side, validate, match origin, then `verified`) | ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ | **Batch 1** done ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ `/register` ignores submitted data, fetches + origin-matches |
| Register anti-spam (rate limit, no-overwrite, size cap, verify-before-store) | ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ | **Batch 1** done ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ per-IP rate limit + verify-before-store (19 tests pass) |
| Directory health checks (cron re-fetch + `health`) | ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ | **Batch 1** done ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ `scheduled()` every 6h re-verifies + demotes |
| Submission UX ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ validator "Add to Discovery Network" funnel (backend registers, not raw input) | ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ | **Batch 2** done ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ validator shows "Add to directory" after a live scan, POSTs only `{url}` |
| Auto-discovery - SDK server optionally announces/pings the directory on serve (opt-in) | ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ | **Batch 3** done - `announce` option + `announceToDirectory()`, fires once per origin |
| Site + docs: explain `connector.ai2web.dev/mcp` and `directory.ai2web.dev/register`; mention validator funnel | ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ | **Batch 4** done - two new docs sections (Discovery Network + Use the whole network) |
| Analytics (RFC-0016): event model + `onEvent` sink in SDK server; Analytics Engine adapter; WP; dashboard | ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ¡ | **Batch 5** SDK server + AE adapter done; WP + dashboard remaining |
| Network trust scoring (RFC-0017): two-sided attestation + corroboration + score | ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ | **Batch 6** |
| Remaining RFC ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ¡ hardening (0004/0009/0010/0011/0012/0013/0014) | ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ | **Batch 7** |

## Status: buildable scope COMPLETE (2026-07-18)
All 7 batches built + tested + committed locally. Not deployed (user gate). Remaining items are deliberately design-stage per their own RFCs (0010 registry, 0013 agent-identity verification, 0017 public trust scoring) - blocked on design review + legal, not on implementation effort.

## Batch log
- **Batch 0 (2026-07-18):** RFC gap analysis + this tracker. ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ
- **Batch 1 (2026-07-18):** Directory verification-first `/register` (fetches the live manifest, validates, requires origin match, ignores submitted data), per-IP rate limit, `scheduled()` health cron (6h), hardened SSRF guard, schema (`last_checked` + `register_log`). 19 integration tests pass. NOT yet deployed (user deploys; needs `wrangler d1 execute` for the schema migration + `wrangler deploy`). ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ
- **Batch 2 (2026-07-18):** Validator "Add to Discovery Network" funnel ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ after a live URL scan the result card offers to list the site; the browser POSTs only `{url}` to `directory.ai2web.dev/register` (backend re-fetches + verifies; hidden for the paste path). ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ
- **Batch 3 (2026-07-18):** Auto-discovery announce in `@ai2web/server` - opt-in `announce` option auto-pings `directory.ai2web.dev/register` once per origin on first discovery serve; exported `announceToDirectory(url)` helper (origin-only, https-only, best-effort). 7 tests pass. ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ
- **Batch 4 (2026-07-18):** Docs surface the network - "Discovery Network" section (get listed via validator button / SDK `announce` / `curl POST /register`, all verified server-side) + "Use the whole network" section (add `connector.ai2web.dev/mcp`; find_sites/describe_site/call_site_action). Spacing guard caught + fixed 2 glue bugs. ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ
- **Batch 5a (2026-07-18):** Analytics (RFC-0016) in `@ai2web/server` - `Ai2wEvent` model + `onEvent` sink (non-blocking), auto-emits discovery/query/action events with latency/agent/audit_ref, PII-safe `sanitizeFilters` (drops emails/long-digit runs), empty-query -> `miss` demand signal, and `analyticsEngineSink()` Cloudflare adapter. 9 tests pass. Remaining: WP plugin analytics + a dashboard. ÃÂ°ÃÂÃÂÃÂ¡
- **Batch 5b (2026-07-18):** WP plugin analytics parity - `Ai2Web_Analytics` (server-side, PII-safe, local-first events table + `ai2web_event` action sink, empty-query -> miss, 90-day retention). Wired into the router; installs on activation. 8 logic tests pass. Batch 5 complete. Ã¢ÂÂ
- **Batch 6 (2026-07-18):** RFC-0017 trust - built the SAFE, reviewable two-sided attestation primitive (`trust.ts`: validate/corroborate/trustScore) + flag-gated directory endpoints (`POST /attest`, `GET /sites/:id/trust`) DISABLED by default (`TRUST_ENABLED`). Enforces audit_ref anchor, two-sided corroboration (no unilateral trust), PII-free, POSITIVE-ONLY. Per RFC-0017 the public reputation/scoring + negative signals are DELIBERATELY NOT shipped - blocked on ÃÂ§8 (sybil resistance, aggregation governance) + legal review of negative signals. 17 tests pass. Not deployed, not surfaced publicly. ð¡
- **Batch 7 (2026-07-18):** RFC hardening - `deprecated` marker (RFC-0011) in types + builder `.deprecate()` + server emits RFC 8594 Deprecation/Sunset/Link headers (manifest + per-action); `audit_ref` minted for state-changing actions (RFC-0003/0009), returned in the response + carried into the analytics event (anchors trust attestations); intent/bindings/knowledge (0014) confirmed present. 5 tests pass. Genuinely-remaining are DESIGN-STAGE per their own RFCs: agent-identity verification (0013), community extension registry (0010), public trust scoring/negatives (0017 Â§8 + legal). ✅
