#!/usr/bin/env node
// AI2Web conformance harness (reference, self-contained - zero dependencies).
//   node conformance/run.mjs
//
// cases.json is the portable, implementation-agnostic contract: any AI2Web
// implementation (TS via @ai2web/core, PHP via Ai2Web\Validator, third-party)
// MUST reproduce these results. The validator below is the reference algorithm
// (spec §9/§11) and MUST stay in sync with the reference implementations.

import { readFileSync } from "node:fs";

const has = (v) => v === true || (v && typeof v === "object" && v.enabled === true);

function validateManifest(m) {
  const errors = [], checks = [];
  const cap = (n) => m.capabilities && m.capabilities[n];
  if (m.protocol !== "ai2w") errors.push("protocol must be 'ai2w'");
  if (!/^\d+\.\d+(\.\d+)?$/.test(String(m.version ?? ""))) errors.push("version missing/invalid");
  for (const k of ["name", "url", "type"]) if (!(m.site && m.site[k])) errors.push(`site.${k} missing`);
  if (!m.capabilities || !Object.keys(m.capabilities).length) errors.push("capabilities empty");

  const actionsExist = has(cap("actions")) || (Array.isArray(m.actions) && m.actions.length > 0) ||
    ["commerce", "booking"].some((c) => has(cap(c)));

  let score = 0;
  const add = (ok, pts, label, hint) => { checks.push({ ok, label, hint: ok ? null : hint }); if (ok) score += pts; };
  add(errors.length === 0, 30, "Valid discovery manifest", "fix errors");
  add(has(cap("content")), 6, "Content", "expose content module");
  add(has(cap("commerce")) || has(cap("booking")) || has(cap("services")), 6, "Products / services / booking", "expose a commerce/services/booking module");
  add(has(cap("search")), 4, "Search", "add a search capability");
  add(actionsExist, 5, "Actions", "declare actions");
  add(has(cap("events")), 6, "Events / subscriptions", "publish subscribable events");
  add(!!(m.agent_service && m.agent_service.enabled), 4, "Agent service (A2A)", "expose /ai2w/agent");
  const commerce = cap("commerce");
  add(!has(commerce) || (commerce && commerce.checkout === true), 4, "Checkout", "commerce present but checkout missing");
  add(!!(m.transports && m.transports.mcp && m.transports.mcp.enabled === true), 8, "MCP transport", "expose an MCP endpoint");
  add(!!(m.transports && ((m.transports.rest && m.transports.rest.enabled) || m.transports.feeds)), 4, "REST / feeds", "expose REST or feeds");
  const oauthOk = !!(m.auth && Array.isArray(m.auth.methods) && m.auth.methods.includes("oauth2") && m.auth.oauth2 && m.auth.oauth2.pkce === true);
  const consentDeclared = !!(m.consent && m.consent.requires_user_approval_for && m.consent.requires_user_approval_for.length);
  add(!actionsExist || oauthOk, 8, "OAuth2 + PKCE", "protected actions need oauth2+pkce");
  add(!actionsExist || consentDeclared, 7, "Consent declared", "declare consent for sensitive actions");
  add(!!m.identity, 4, "Identity", "add identity (legal_name, policies)");
  add(!!m.contact, 4, "Contact", "add support/security contact");
  score = Math.min(100, score);

  const basic = errors.length === 0;
  const standard = basic && !!m.transports && (!actionsExist || consentDeclared) && !!m.contact;
  const enterprise = standard && !!m.identity && !!m.auth && !!m.rate_limits;
  const tier = enterprise ? "Enterprise" : standard ? "Standard" : basic ? "Basic" : "Invalid";
  return { valid: errors.length === 0, errors, checks, score, tier };
}

const cases = JSON.parse(readFileSync(new URL("./cases.json", import.meta.url), "utf8"));
let failed = 0;
for (const c of cases) {
  const r = validateManifest(c.manifest), e = c.expect, problems = [];
  if (e.valid !== undefined && r.valid !== e.valid) problems.push(`valid=${r.valid} (want ${e.valid})`);
  if (e.tier !== undefined && r.tier !== e.tier) problems.push(`tier=${r.tier} (want ${e.tier})`);
  if (e.minScore !== undefined && r.score < e.minScore) problems.push(`score=${r.score} < ${e.minScore}`);
  if (e.maxScore !== undefined && r.score > e.maxScore) problems.push(`score=${r.score} > ${e.maxScore}`);
  if (e.errorsContain && !r.errors.some((x) => x.includes(e.errorsContain))) problems.push(`errors missing '${e.errorsContain}' (got ${JSON.stringify(r.errors)})`);
  if (Array.isArray(e.warns)) for (const w of e.warns) { const chk = r.checks.find((c) => c.label === w); if (!chk || chk.ok) problems.push(`expected warning on '${w}'`); }
  console.log(`${problems.length ? "FAIL" : "PASS"}  ${c.name}${problems.length ? " :: " + problems.join("; ") : ""}`);
  if (problems.length) failed++;
}
console.log(`\n${failed === 0 ? `ALL ${cases.length} CONFORMANCE CASES PASS` : `${failed} of ${cases.length} FAILED`}`);
process.exit(failed === 0 ? 0 : 1);
