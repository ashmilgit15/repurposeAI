# Security Audit Report

## Executive Summary

This audit found one critical application flaw and two additional high-severity issues that materially increased the risk of unauthorized privilege use, cross-site request abuse, and framework-level denial of service. Those three issues have been remediated in code.

One low-severity dependency risk remains, plus one deployment prerequisite:

1. Durable rate limiting is now implemented in code, but the updated Supabase SQL must be applied before those routes are exercised in production.
2. The remaining `qs` advisory is low severity.

There is also an operational note: the local ignored file `.env.local` contains live credentials on this workstation. It is not currently tracked by git, but those credentials should be rotated immediately if the machine, shell history, or logs are not trusted.

## Findings

### SEC-001: Client-side admin backdoor allowed self-service privilege escalation

- Severity: Critical
- Status: Remediated
- Original evidence (captured before remediation):
  - `src/app/admin/page.tsx:13`
  - `src/app/admin/page.tsx:26-34`
  - `src/app/admin/page.tsx:51-55`
  - `src/app/admin/page.tsx:74-78`
  - `src/app/admin/page.tsx:97-100`
  - `src/app/api/admin/upgrade/route.ts:4-24`
  - `src/app/api/admin/reset-usage/route.ts:4-24`
  - `src/app/api/admin/downgrade/route.ts:4-24`
- Risk:
  - The admin secret was hardcoded into both the browser bundle and the API routes.
  - Any authenticated user could recover the secret from client code and call the admin endpoints to upgrade themselves to `pro`, reset monthly usage, or downgrade at will.
  - This was a direct authorization bypass, not just weak UX gating.
- Remediation implemented:
  - Server-side admin allowlisting based on `ADMIN_USER_IDS` / `ADMIN_USER_EMAILS` in [src/lib/security/admin.ts](./src/lib/security/admin.ts).
  - `/admin` is now resolved server-side and hidden from non-admin users in [src/app/admin/page.tsx](./src/app/admin/page.tsx).
  - Admin APIs now require an authenticated allowlisted admin in:
    - [src/app/api/admin/status/route.ts](./src/app/api/admin/status/route.ts)
    - [src/app/api/admin/upgrade/route.ts](./src/app/api/admin/upgrade/route.ts)
    - [src/app/api/admin/reset-usage/route.ts](./src/app/api/admin/reset-usage/route.ts)
    - [src/app/api/admin/downgrade/route.ts](./src/app/api/admin/downgrade/route.ts)
  - Auth middleware now protects `/admin` in:
    - [src/lib/supabase/middleware.ts](./src/lib/supabase/middleware.ts)
    - [src/middleware.ts](./src/middleware.ts)
- Security implication of the change:
  - Privileged behavior is now decided on the server with a secret that is never shipped to the browser.
  - An attacker must now compromise an allowlisted admin account rather than simply reading a static secret from client code.

### SEC-002: Cookie-authenticated POST endpoints lacked explicit CSRF / origin validation

- Severity: High
- Status: Remediated
- Evidence before remediation:
  - `src/app/api/admin/upgrade/route.ts:6-12`
  - `src/app/api/admin/reset-usage/route.ts:6-12`
  - `src/app/api/admin/downgrade/route.ts:6-12`
  - `src/app/api/jobs/create/route.ts:79-103`
  - `src/app/api/scrape/route.ts:4-25`
  - `src/app/api/subscription/create-checkout/route.ts:9-18`
  - `src/app/api/subscription/portal/route.ts:9-18`
  - `src/app/api/subscription/cancel/route.ts:9-18`
- Risk:
  - These routes relied on the Supabase session cookie plus `supabase.auth.getUser()`, but performed no `Origin` or `Referer` validation and had no CSRF token mechanism.
  - If browser cookie policy or future route usage allowed cross-site credentialed requests, an attacker could trigger billing actions, usage resets, scraping, or job creation from another origin.
- Remediation implemented:
  - Added same-origin enforcement in [src/lib/security/request.ts](./src/lib/security/request.ts).
  - Applied the check to the state-changing cookie-auth endpoints listed above.
- Security implication of the change:
  - Requests must now originate from the app origin (or the configured canonical app URL) before privileged POST handlers execute.
  - This meaningfully reduces CSRF exposure without loosening authentication or CORS.

### SEC-003: Framework version exposed the app to known Next.js DoS advisories

- Severity: High
- Status: Remediated
- Evidence:
  - `package.json:30`
  - `package.json:45`
  - `npm audit --omit=dev` initially reported `next@16.1.1` vulnerable to high-severity request deserialization / DoS issues and moderate image optimizer / memory-consumption advisories.
- Risk:
  - A remote unauthenticated attacker could target the application with requests that trigger excessive server work or resource exhaustion in vulnerable framework code.
- Remediation implemented:
  - Upgraded `next` and `eslint-config-next` to `16.1.6` in [package.json](./package.json).
  - Re-ran `npm audit --omit=dev`; the previous high-severity `next` findings are gone.
- Security implication of the change:
  - The app is no longer pinned to a framework version with known high-severity network-reachable DoS advisories.

### SEC-004: Input validation on scrape and generation endpoints was too permissive

- Severity: High
- Status: Remediated
- Evidence before remediation:
  - `src/app/api/jobs/create/route.ts:90-105`
  - `src/app/api/jobs/create/route.ts:151-176`
  - `src/app/api/scrape/route.ts:14-25`
- Risk:
  - `/api/jobs/create` trusted the JSON body shape and accepted arbitrary brand voices, malformed format lists, and unbounded large content payloads.
  - `/api/scrape` accepted any syntactically valid URL, including internal-style hosts or credential-bearing URLs, and forwarded it to a paid third-party scraper.
  - These flaws enabled authenticated cost abuse, malformed-request denial paths, and outbound request abuse through the application’s Firecrawl account.
- Remediation implemented:
  - Strict runtime validation for `input_text`, `brand_voice`, and `selected_formats` in [src/app/api/jobs/create/route.ts](./src/app/api/jobs/create/route.ts).
  - Public URL parsing and local/private-host blocking in [src/lib/security/url.ts](./src/lib/security/url.ts).
  - Added a timeout to the Firecrawl request in [src/app/api/scrape/route.ts](./src/app/api/scrape/route.ts).
- Security implication of the change:
  - Attackers can no longer send structurally invalid generation payloads or obviously internal/local URLs through the scraping endpoint.
  - The service now fails closed earlier, which reduces abuse cost and narrows the attack surface.

### SEC-005: Durable rate limiting was added for abuse-prone authenticated routes

- Severity: Medium
- Status: Remediated
- Evidence:
  - [src/lib/security/rate-limit.ts](./src/lib/security/rate-limit.ts)
  - [src/app/api/jobs/create/route.ts](./src/app/api/jobs/create/route.ts)
  - [src/app/api/scrape/route.ts](./src/app/api/scrape/route.ts)
  - [src/app/api/subscription/create-checkout/route.ts](./src/app/api/subscription/create-checkout/route.ts)
  - [src/app/api/subscription/portal/route.ts](./src/app/api/subscription/portal/route.ts)
  - [src/app/api/subscription/cancel/route.ts](./src/app/api/subscription/cancel/route.ts)
  - [supabase-schema.sql](./supabase-schema.sql)
- Remediation implemented:
  - Added a durable per-user Supabase-backed limiter via the `consume_rate_limit` Postgres function and `rate_limits` table.
  - Applied rate limits to admin, generation, scrape, and billing-affecting endpoints.
- Deployment prerequisite:
  - Run the updated [supabase-schema.sql](./supabase-schema.sql) in Supabase before deploying these route changes. Until that migration exists, the guarded endpoints will return `503` when the limiter RPC is missing.

### SEC-006: Security headers are now centrally defined in app config

- Severity: Medium
- Status: Remediated
- Evidence:
  - [next.config.ts](./next.config.ts)
- Remediation implemented:
  - Added centralized headers for CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`.
- Security implication of the change:
  - The app now has an explicit baseline for anti-clickjacking, MIME confusion defense, safer referrer handling, and browser capability reduction.

### SEC-007: Deployment install flow was hardened and one low-severity dependency advisory remains

- Severity: Low
- Status: Partially remediated
- Evidence:
  - `vercel.json:4`
  - `npm audit --omit=dev` still reports a low-severity transitive `qs` advisory
- Risk:
  - The remaining `qs` issue is low severity, but should still be monitored and patched when the dependency chain updates.
- Remediation implemented:
  - Switched Vercel installs to `npm ci` in [vercel.json](./vercel.json).
- Recommended next step:
  - Clear the remaining `qs` advisory during the next dependency maintenance pass.

## Verification

- `npm audit --omit=dev`
  - Result after remediation: `0` high, `0` moderate, `1` low
- `npm run lint`
  - Passed with one pre-existing warning in `src/app/job/[id]/job-results-client.tsx`
- `npm run build`
  - Passed on Next.js `16.1.6`
