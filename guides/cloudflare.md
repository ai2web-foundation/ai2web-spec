# Running AI2Web on Cloudflare

AI2Web is a good fit for Cloudflare. The manifest and its endpoints are just HTTP, the security model is designed for edge execution, and the whole reference stack (the validator, the agent connector, the demo store, the Shopify app, and ai2web.dev itself) already runs on Cloudflare Workers and Pages. This guide covers how to serve an AI2Web site on Cloudflare and how it composes with Cloudflare's own AI features.

## Why the edge fits

- **One manifest, served everywhere.** A Worker or Pages Function can generate the `/ai2w` manifest and all its projections from a single source, with no origin server to keep in sync.
- **The safety model assumes the edge.** The guarded executor never sends a credential to an origin other than the one that issued it, refuses non-public outbound targets (SSRF guard), and previews high-risk actions before running them. Those checks run the same at the edge as anywhere else.
- **Streamable HTTP MCP is native.** The MCP transport is plain HTTP with server-sent events, which Workers serve directly.

## Serving AI2Web from a Worker

The `@ai2web/server` package ships a Cloudflare adapter. One handler serves the manifest, the discovery anchor, capability negotiation, the action and module routes, and the multi-surface projections.

```ts
// worker.ts
import { cloudflareHandler } from "@ai2web/server/cloudflare";
import { ai2web } from "@ai2web/core";

const manifest = ai2web({ name: "Example Store", url: "https://store.example", type: "store" })
  .capability("content")
  .capability("commerce", { endpoint: "/ai2w/products" })
  .governance({ rate_limits: { requests: 60, window_seconds: 60 } })
  .build();

export default cloudflareHandler({
  manifest,
  modules: {
    products: () => [{ sku: "DEMO-001", price: "20.00" }],
  },
  actions: {
    // request-only, approval-gated actions go here
  },
});
```

That single handler answers, from the one manifest:

| Path | Surface |
|---|---|
| `/.well-known/ai2w` | Discovery anchor (pointer to `/ai2w`) |
| `/ai2w` | The canonical AI2Web manifest |
| `/ai2w/negotiate` | Capability negotiation |
| `/ai2w/actions/{name}` | Declared actions (schema-validated, approval-gated) |
| `/llms.txt` | Plain-text summary and links for models |
| `/.well-known/agent.json`, `/agent.json` | Generic agent-capability projection |

The last two are projections of the same manifest (RFC-0015), so an agent that speaks `llms.txt` or a generic `agent.json` can use the site without parsing `ai2w` first, while the canonical `/ai2w` manifest stays authoritative for execution.

## Serving from Pages Functions

For a static site on Cloudflare Pages, a single `functions/_middleware.js` can serve the same routes in front of the static assets, so the site stays static while the AI2Web surfaces are generated per request. This is how ai2web.dev serves its own `/ai2w`, `/.well-known/ai2w`, and `/ai2w/mcp`.

## Composing with Cloudflare's AI features

Cloudflare offers an opt-in AI Index for a domain that can expose surfaces such as `llms.txt`, a search API, and an MCP endpoint. AI2Web composes with this rather than competing with it:

- **AI2Web is the source of truth.** The `/ai2w` manifest is the canonical, self-owned description of a site's identity, capabilities, actions, risk model, and governance. Everything else is a projection of it.
- **Emit into the surfaces the platform reads.** The export adapters project the one manifest into `llms.txt` and `agent.json`, so the same declaration feeds both AI2Web-native agents and platform indexes that consume those formats.
- **Keep actions where the policy lives.** Reads can be indexed anywhere, but state-changing actions run through the AI2Web executor so approval, ownership checks, and audit references are enforced consistently, regardless of which surface an agent discovered the site through.

The result is one declaration, served at the edge, usable by AI2Web-native agents, by MCP clients, and by any platform index that reads `llms.txt` or `agent.json`.

## Checklist

- Serve `/.well-known/ai2w` and `/ai2w` (required for discovery).
- Add the `mcp` transport for assistant connectors (Streamable HTTP).
- Emit `/llms.txt` and `/.well-known/agent.json` for broader reach.
- Keep every state-changing action approval-gated and request-only where it moves money or data.
- Register the manifest URL with the [AI2Web directory](https://ai2web.dev).
