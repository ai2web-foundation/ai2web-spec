# AI2Web Implementation Status

Living tracker of RFC Ã¢ÂÂ implementation coverage and the network/infra gaps.
Started 2026-07-18 during the "complete the project" build. `Ã¢ÂÂ done ÃÂ· Ã°ÂÂÂ¡ partial ÃÂ· Ã¢ÂÂ missing`.

## RFCs

| RFC | Title | Status | Where / gap |
|---|---|---|---|
| 0000 | Architecture & Principles | Ã¢ÂÂ | Principles; reflected across code |
| 0001 | Discovery Protocol | Ã¢ÂÂ | `/ai2w` + `/.well-known/ai2w` + projections (SDK servers, WP, ai2web.dev fn, directory) |
| 0002 | Action & Event Schema | Ã¢ÂÂ | manifest actions + shared executor (event *schema*; analytics events = 0016) |
| 0003 | AuthN & AuthZ | Ã¢ÂÂ | OAuth2+PKCE (WP plugin, cloud oauth-store), consent gating |
| 0004 | Agent-to-Agent | Ã°ÂÂÂ¡ | `agent_service` declared + connector; a first-class `/ai2w/agent` handler is thin |
| 0005 | Commerce & Checkout | Ã¢ÂÂ | ACP adapter, checkout gating |
| 0006 | Transport Adapter Conformance | Ã¢ÂÂ | mcp/graphql/acp/openapi adapters + shared executor + conformance harness |
| 0007 | Support & Post-Purchase | Ã¢ÂÂ | `support` module + WP commerce actions |
| 0008 | Content & Search Profile | Ã¢ÂÂ | content/search (directory fn, demo store) |
| 0009 | Privacy, Audit & Retention | Ã°ÂÂÂ¡ | public-only + privacy policy; `audit_ref` emit + retention enforcement thin |
| 0010 | Extension & Namespace Registry | Ã°ÂÂÂ¡ | `x-*` extend() mechanism Ã¢ÂÂ; the community registry Ã¢ÂÂ |
| 0011 | Versioning & Deprecation | Ã°ÂÂÂ¡ | version validated + negotiation; `deprecated` marker handling thin |
| 0012 | Governance, Usage & Legal | Ã°ÂÂÂ¡ | modules declared (v0.2 builder) Ã¢ÂÂ; runtime enforcement thin |
| 0013 | Agent Identity & Verification | Ã°ÂÂÂ¡ | `agent_identity` module declared; agent-identity *verification* Ã¢ÂÂ |
| 0014 | Capability Bindings, Intent & Knowledge | Ã°ÂÂÂ¡ | `knowledge()` builder Ã¢ÂÂ; intent/bindings surfaced only partially |
| 0015 | Manifest Interop & Export | Ã¢ÂÂ | `toLlmsTxt` / `toAgentJson` across SDKs |
| 0016 | Signals & Analytics | Ã¢ÂÂ | **not implemented** Ã¢ÂÂ no server-side event emit or sink |
| 0017 | Trust & Reputation | Ã¢ÂÂ | **not implemented** Ã¢ÂÂ no attestation / corroboration / scoring |

## Network / infra gaps (this build's focus)

| Item | Status | Plan |
|---|---|---|
| Directory verification (fetch `/.well-known/ai2w` server-side, validate, match origin, then `verified`) | Ã¢ÂÂ | **Batch 1** done Ã¢ÂÂ `/register` ignores submitted data, fetches + origin-matches |
| Register anti-spam (rate limit, no-overwrite, size cap, verify-before-store) | Ã¢ÂÂ | **Batch 1** done Ã¢ÂÂ per-IP rate limit + verify-before-store (19 tests pass) |
| Directory health checks (cron re-fetch + `health`) | Ã¢ÂÂ | **Batch 1** done Ã¢ÂÂ `scheduled()` every 6h re-verifies + demotes |
| Submission UX Ã¢ÂÂ validator "Add to Discovery Network" funnel (backend registers, not raw input) | Ã¢ÂÂ | **Batch 2** done Ã¢ÂÂ validator shows "Add to directory" after a live scan, POSTs only `{url}` |
| Auto-discovery - SDK server optionally announces/pings the directory on serve (opt-in) | Ã¢ÂÂ | **Batch 3** done - `announce` option + `announceToDirectory()`, fires once per origin |
| Site + docs: explain `connector.ai2web.dev/mcp` and `directory.ai2web.dev/register`; mention validator funnel | Ã¢ÂÂ | **Batch 4** done - two new docs sections (Discovery Network + Use the whole network) |
| Analytics (RFC-0016): event model + `onEvent` sink in SDK server; Analytics Engine adapter; WP; dashboard | Ã°ÂÂÂ¡ | **Batch 5** SDK server + AE adapter done; WP + dashboard remaining |
| Network trust scoring (RFC-0017): two-sided attestation + corroboration + score | Ã¢ÂÂ | **Batch 6** |
| Remaining RFC Ã°ÂÂÂ¡ hardening (0004/0009/0010/0011/0012/0013/0014) | Ã¢ÂÂ | **Batch 7** |

## Batch log
- **Batch 0 (2026-07-18):** RFC gap analysis + this tracker. Ã¢ÂÂ
- **Batch 1 (2026-07-18):** Directory verification-first `/register` (fetches the live manifest, validates, requires origin match, ignores submitted data), per-IP rate limit, `scheduled()` health cron (6h), hardened SSRF guard, schema (`last_checked` + `register_log`). 19 integration tests pass. NOT yet deployed (user deploys; needs `wrangler d1 execute` for the schema migration + `wrangler deploy`). Ã¢ÂÂ
- **Batch 2 (2026-07-18):** Validator "Add to Discovery Network" funnel Ã¢ÂÂ after a live URL scan the result card offers to list the site; the browser POSTs only `{url}` to `directory.ai2web.dev/register` (backend re-fetches + verifies; hidden for the paste path). Ã¢ÂÂ
- **Batch 3 (2026-07-18):** Auto-discovery announce in `@ai2web/server` - opt-in `announce` option auto-pings `directory.ai2web.dev/register` once per origin on first discovery serve; exported `announceToDirectory(url)` helper (origin-only, https-only, best-effort). 7 tests pass. Ã¢ÂÂ
- **Batch 4 (2026-07-18):** Docs surface the network - "Discovery Network" section (get listed via validator button / SDK `announce` / `curl POST /register`, all verified server-side) + "Use the whole network" section (add `connector.ai2web.dev/mcp`; find_sites/describe_site/call_site_action). Spacing guard caught + fixed 2 glue bugs. Ã¢ÂÂ
- **Batch 5a (2026-07-18):** Analytics (RFC-0016) in `@ai2web/server` - `Ai2wEvent` model + `onEvent` sink (non-blocking), auto-emits discovery/query/action events with latency/agent/audit_ref, PII-safe `sanitizeFilters` (drops emails/long-digit runs), empty-query -> `miss` demand signal, and `analyticsEngineSink()` Cloudflare adapter. 9 tests pass. Remaining: WP plugin analytics + a dashboard. ð¡
- **Batch 5b (2026-07-18):** WP plugin analytics parity - `Ai2Web_Analytics` (server-side, PII-safe, local-first events table + `ai2web_event` action sink, empty-query -> miss, 90-day retention). Wired into the router; installs on activation. 8 logic tests pass. Batch 5 complete. ✅
