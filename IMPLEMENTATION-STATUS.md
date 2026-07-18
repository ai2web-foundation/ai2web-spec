# AI2Web Implementation Status

Living tracker of RFC â implementation coverage and the network/infra gaps.
Started 2026-07-18 during the "complete the project" build. `â done Â· ð¡ partial Â· â missing`.

## RFCs

| RFC | Title | Status | Where / gap |
|---|---|---|---|
| 0000 | Architecture & Principles | â | Principles; reflected across code |
| 0001 | Discovery Protocol | â | `/ai2w` + `/.well-known/ai2w` + projections (SDK servers, WP, ai2web.dev fn, directory) |
| 0002 | Action & Event Schema | â | manifest actions + shared executor (event *schema*; analytics events = 0016) |
| 0003 | AuthN & AuthZ | â | OAuth2+PKCE (WP plugin, cloud oauth-store), consent gating |
| 0004 | Agent-to-Agent | ð¡ | `agent_service` declared + connector; a first-class `/ai2w/agent` handler is thin |
| 0005 | Commerce & Checkout | â | ACP adapter, checkout gating |
| 0006 | Transport Adapter Conformance | â | mcp/graphql/acp/openapi adapters + shared executor + conformance harness |
| 0007 | Support & Post-Purchase | â | `support` module + WP commerce actions |
| 0008 | Content & Search Profile | â | content/search (directory fn, demo store) |
| 0009 | Privacy, Audit & Retention | ð¡ | public-only + privacy policy; `audit_ref` emit + retention enforcement thin |
| 0010 | Extension & Namespace Registry | ð¡ | `x-*` extend() mechanism â; the community registry â |
| 0011 | Versioning & Deprecation | ð¡ | version validated + negotiation; `deprecated` marker handling thin |
| 0012 | Governance, Usage & Legal | ð¡ | modules declared (v0.2 builder) â; runtime enforcement thin |
| 0013 | Agent Identity & Verification | ð¡ | `agent_identity` module declared; agent-identity *verification* â |
| 0014 | Capability Bindings, Intent & Knowledge | ð¡ | `knowledge()` builder â; intent/bindings surfaced only partially |
| 0015 | Manifest Interop & Export | â | `toLlmsTxt` / `toAgentJson` across SDKs |
| 0016 | Signals & Analytics | â | **not implemented** â no server-side event emit or sink |
| 0017 | Trust & Reputation | â | **not implemented** â no attestation / corroboration / scoring |

## Network / infra gaps (this build's focus)

| Item | Status | Plan |
|---|---|---|
| Directory verification (fetch `/.well-known/ai2w` server-side, validate, match origin, then `verified`) | â | **Batch 1** done â `/register` ignores submitted data, fetches + origin-matches |
| Register anti-spam (rate limit, no-overwrite, size cap, verify-before-store) | â | **Batch 1** done â per-IP rate limit + verify-before-store (19 tests pass) |
| Directory health checks (cron re-fetch + `health`) | â | **Batch 1** done â `scheduled()` every 6h re-verifies + demotes |
| Submission UX â validator "Add to Discovery Network" funnel (backend registers, not raw input) | â | **Batch 2** done â validator shows "Add to directory" after a live scan, POSTs only `{url}` |
| Auto-discovery - SDK server optionally announces/pings the directory on serve (opt-in) | â | **Batch 3** done - `announce` option + `announceToDirectory()`, fires once per origin |
| Site + docs: explain `connector.ai2web.dev/mcp` and `directory.ai2web.dev/register`; mention validator funnel | â | **Batch 4** done - two new docs sections (Discovery Network + Use the whole network) |
| Analytics (RFC-0016): event model + `onEvent` sink in SDK server; Analytics Engine adapter; WP; dashboard | ð¡ | **Batch 5** SDK server + AE adapter done; WP + dashboard remaining |
| Network trust scoring (RFC-0017): two-sided attestation + corroboration + score | â | **Batch 6** |
| Remaining RFC ð¡ hardening (0004/0009/0010/0011/0012/0013/0014) | â | **Batch 7** |

## Batch log
- **Batch 0 (2026-07-18):** RFC gap analysis + this tracker. â
- **Batch 1 (2026-07-18):** Directory verification-first `/register` (fetches the live manifest, validates, requires origin match, ignores submitted data), per-IP rate limit, `scheduled()` health cron (6h), hardened SSRF guard, schema (`last_checked` + `register_log`). 19 integration tests pass. NOT yet deployed (user deploys; needs `wrangler d1 execute` for the schema migration + `wrangler deploy`). â
- **Batch 2 (2026-07-18):** Validator "Add to Discovery Network" funnel â after a live URL scan the result card offers to list the site; the browser POSTs only `{url}` to `directory.ai2web.dev/register` (backend re-fetches + verifies; hidden for the paste path). â
- **Batch 3 (2026-07-18):** Auto-discovery announce in `@ai2web/server` - opt-in `announce` option auto-pings `directory.ai2web.dev/register` once per origin on first discovery serve; exported `announceToDirectory(url)` helper (origin-only, https-only, best-effort). 7 tests pass. â
- **Batch 4 (2026-07-18):** Docs surface the network - "Discovery Network" section (get listed via validator button / SDK `announce` / `curl POST /register`, all verified server-side) + "Use the whole network" section (add `connector.ai2web.dev/mcp`; find_sites/describe_site/call_site_action). Spacing guard caught + fixed 2 glue bugs. â
- **Batch 5a (2026-07-18):** Analytics (RFC-0016) in `@ai2web/server` - `Ai2wEvent` model + `onEvent` sink (non-blocking), auto-emits discovery/query/action events with latency/agent/audit_ref, PII-safe `sanitizeFilters` (drops emails/long-digit runs), empty-query -> `miss` demand signal, and `analyticsEngineSink()` Cloudflare adapter. 9 tests pass. Remaining: WP plugin analytics + a dashboard. 🟡
