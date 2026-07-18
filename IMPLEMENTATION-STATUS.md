# AI2Web Implementation Status

Living tracker of RFC → implementation coverage and the network/infra gaps.
Started 2026-07-18 during the "complete the project" build. `✅ done · 🟡 partial · ❌ missing`.

## RFCs

| RFC | Title | Status | Where / gap |
|---|---|---|---|
| 0000 | Architecture & Principles | ✅ | Principles; reflected across code |
| 0001 | Discovery Protocol | ✅ | `/ai2w` + `/.well-known/ai2w` + projections (SDK servers, WP, ai2web.dev fn, directory) |
| 0002 | Action & Event Schema | ✅ | manifest actions + shared executor (event *schema*; analytics events = 0016) |
| 0003 | AuthN & AuthZ | ✅ | OAuth2+PKCE (WP plugin, cloud oauth-store), consent gating |
| 0004 | Agent-to-Agent | 🟡 | `agent_service` declared + connector; a first-class `/ai2w/agent` handler is thin |
| 0005 | Commerce & Checkout | ✅ | ACP adapter, checkout gating |
| 0006 | Transport Adapter Conformance | ✅ | mcp/graphql/acp/openapi adapters + shared executor + conformance harness |
| 0007 | Support & Post-Purchase | ✅ | `support` module + WP commerce actions |
| 0008 | Content & Search Profile | ✅ | content/search (directory fn, demo store) |
| 0009 | Privacy, Audit & Retention | 🟡 | public-only + privacy policy; `audit_ref` emit + retention enforcement thin |
| 0010 | Extension & Namespace Registry | 🟡 | `x-*` extend() mechanism ✅; the community registry ❌ |
| 0011 | Versioning & Deprecation | 🟡 | version validated + negotiation; `deprecated` marker handling thin |
| 0012 | Governance, Usage & Legal | 🟡 | modules declared (v0.2 builder) ✅; runtime enforcement thin |
| 0013 | Agent Identity & Verification | 🟡 | `agent_identity` module declared; agent-identity *verification* ❌ |
| 0014 | Capability Bindings, Intent & Knowledge | 🟡 | `knowledge()` builder ✅; intent/bindings surfaced only partially |
| 0015 | Manifest Interop & Export | ✅ | `toLlmsTxt` / `toAgentJson` across SDKs |
| 0016 | Signals & Analytics | ❌ | **not implemented** — no server-side event emit or sink |
| 0017 | Trust & Reputation | ❌ | **not implemented** — no attestation / corroboration / scoring |

## Network / infra gaps (this build's focus)

| Item | Status | Plan |
|---|---|---|
| Directory verification (fetch `/.well-known/ai2w` server-side, validate, match origin, then `verified`) | ✅ | **Batch 1** done — `/register` ignores submitted data, fetches + origin-matches |
| Register anti-spam (rate limit, no-overwrite, size cap, verify-before-store) | ✅ | **Batch 1** done — per-IP rate limit + verify-before-store (19 tests pass) |
| Directory health checks (cron re-fetch + `health`) | ✅ | **Batch 1** done — `scheduled()` every 6h re-verifies + demotes |
| Submission UX — validator "Add to Discovery Network" funnel (backend registers, not raw input) | ✅ | **Batch 2** done — validator shows "Add to directory" after a live scan, POSTs only `{url}` |
| Auto-discovery - SDK server optionally announces/pings the directory on serve (opt-in) | ✅ | **Batch 3** done - `announce` option + `announceToDirectory()`, fires once per origin |
| Site + docs: explain `connector.ai2web.dev/mcp` and `directory.ai2web.dev/register`; mention validator funnel | ❌ | **Batch 4** |
| Analytics (RFC-0016): event model + `onEvent` sink in SDK server; Analytics Engine adapter; WP; dashboard | ❌ | **Batch 5** |
| Network trust scoring (RFC-0017): two-sided attestation + corroboration + score | ❌ | **Batch 6** |
| Remaining RFC 🟡 hardening (0004/0009/0010/0011/0012/0013/0014) | ❌ | **Batch 7** |

## Batch log
- **Batch 0 (2026-07-18):** RFC gap analysis + this tracker. ✅
- **Batch 1 (2026-07-18):** Directory verification-first `/register` (fetches the live manifest, validates, requires origin match, ignores submitted data), per-IP rate limit, `scheduled()` health cron (6h), hardened SSRF guard, schema (`last_checked` + `register_log`). 19 integration tests pass. NOT yet deployed (user deploys; needs `wrangler d1 execute` for the schema migration + `wrangler deploy`). ✅
- **Batch 2 (2026-07-18):** Validator "Add to Discovery Network" funnel — after a live URL scan the result card offers to list the site; the browser POSTs only `{url}` to `directory.ai2web.dev/register` (backend re-fetches + verifies; hidden for the paste path). ✅
- **Batch 3 (2026-07-18):** Auto-discovery announce in `@ai2web/server` - opt-in `announce` option auto-pings `directory.ai2web.dev/register` once per origin on first discovery serve; exported `announceToDirectory(url)` helper (origin-only, https-only, best-effort). 7 tests pass. ✅
