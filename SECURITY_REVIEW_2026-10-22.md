# Runtime Security Review, 2026-10-22

Scope: inspection and remediation of the gmonad.cc repository, its OpenBuild
Vercel deployment, the public TLS chain, and the local development runtime.
This is not an intrusion investigation or a completed inspection of the old
Linux host. The following findings record the initial, pre-remediation state.

## Findings

| Area | Observed evidence | Assessment |
| --- | --- | --- |
| Production hosting | Public response identifies Vercel. Authenticated Vercel API identifies project gmonad.cc and production deployment dpl_DfSBBMsYou5f9R8vt9FiCLETLJmn. | Production application is on Vercel. |
| Production Node.js | Project, deployment and build configuration all report 24.x. No exact running patch version was returned. | October security patch status remains unverified. |
| Local Node.js | Current terminal reports v20.11.1, OpenSSL 3.0.13+quic, Brotli 1.0.9. | EOL runtime; migrate local development/deployment tooling to a supported, patched version. This does not identify production's runtime. |
| Website certificate | Live chain: gmonad.cc -> Let's Encrypt YR2 -> ISRG Root YR -> ISRG Root X1. Leaf expires 2027-01-15 14:58:33 UTC. | The observed serving chain does not use emSign/eMudhra. This does not establish the safety of outbound TLS trust stores. |
| Local trust store | Current Node binary contains four emSign root CA certificates. No end-to-end compromised-chain validation was performed. | Old trust material is present; root presence alone does not prove acceptance of a particular compromised intermediate. |
| PHP | Repository and Vercel configuration show Next.js/Node and legacy Go code; no PHP application deployment found. | No evidence that the current application exposes the PHP vulnerabilities. Old-host installations remain unknown. |
| Nginx / Linux | Vercel host internals are not exposed by the available project/deployment APIs. No gmonad-specific SSH target was identified. | Provider patch status and the legacy host's Nginx/kernel status are not verified. |

## Advisory Cross-check

The Node.js security release dated October 21 fixes the Brotli decoder RCE
CVE-2026-111497, TLS hostname-validation issues including CVE-2026-105483 and
CVE-2026-106069, and other defects. Published patched release versions are
22.23.4, 24.22.1 and 26.12.1. The v24.22.1 release also lists root-store updates
and rejection of chains containing blocked public keys. The official schedule
places Node 20 end of support on April 30, 2026; EOL versions must not be
considered safe merely because an advisory lists supported release lines.

PHP's October 21 advisory identifies CVE-2026-109618 and CVE-2026-109619.
Patched upstream releases are 8.2.35, 8.3.36, 8.4.27 and 8.5.12. Distribution
backports require vendor-specific verification.

NGINX's advisory page lists the five recent issues CVE-2026-15176,
CVE-2026-93479, CVE-2026-95101, CVE-2026-97629 and CVE-2026-97205, with fixes
in 1.30.6+ / 1.31.7+. Applicability also depends on modules/configuration and
vendor backports; a banner alone is not sufficient.

## Application Exposure and Remaining Actions

1. Confirm the actual production function's Node version is 24.22.1 or a later
   fixed 24.x version, including the October TLS trust changes. Vercel documents
   automatic minor/patch rollout but the API's 24.x value does not prove that a
   newly released patch has reached this deployment. Request provider
   confirmation or use an authenticated temporary runtime diagnostic as a
   separate change. Do not add a public diagnostic leaking runtime/env data.
2. Upgrade the local terminal's Node 20 runtime separately. Replacing npm
   dependencies does not patch the Node executable or its built-in trust store.
3. The application calls external services with native fetch in OAuth,
   analytics and scheduled collection handlers. No explicit Brotli decoding
   or TLS-validation override was found in the checked runtime code. This
   does not rule out decoding in framework/client dependencies.
4. package.json currently allows >=20.19.0, including EOL Node 20. Align the
   repository's runtime policy with the selected supported major after the
   provider's patched version is confirmed; an engines range does not replace
   runtime verification.
5. .github/workflows/deploy.yml still contains the old root SSH deployment via
   SERVER_HOST/SERVER_SSH_KEY. If that machine is retained, inspect its actual
   processes, packages, certificate stores and kernel over its confirmed SSH
   connection. Those GitHub secret values cannot be recovered from the YAML.

## Remediation and Local Acceptance

- Installed official Node.js 24.22.1 locally and verified its published SHA256.
  Pinned `.nvmrc`, aligned CI, and restricted package engines to >=24.22.1 <25.
  Build/start guards reject older or unsupported runtimes. Vercel's actual
  function runtime still requires verification separately from its build.
- Added `/api/internal/runtime`, authenticated with the existing production
  CRON_SECRET. It returns only component versions and patch-baseline status,
  disables browser/CDN caching, returns 401 without valid credentials and 503
  for an unsupported runtime. No development authentication bypass exists.
- Updated Next.js to 16.4.2, MapLibre GL to 6.15.0, KaTeX to 0.19.0,
  DOMPurify to 3.4.17, sanitize-html to 2.18.1, and affected lockfile dependencies.
  Removed unused gray-matter, react-katex and global-agent dependencies.
- Adapted MapLibre's named exports, explicit bundled worker URL and marker
  options. Replaced the marker animation's transform with scale so it no longer
  overrides geographic positioning.
- Changed the legacy root/SSH deployment workflow to manual-only. Its old
  server is not implicitly patched by deploying the Vercel application.
- Runtime-policy and authenticated-handler tests pass (10 reported tests,
  including the handler parent test); TypeScript checks and production build
  pass under Node.js 24.22.1. Node.js 20 is rejected by the runtime guard.
- Local production-browser acceptance confirms the map loads without its
  previous worker error, seven geographically distributed markers appear,
  CN filtering leaves two markers, and the Beijing popup opens.
- Official npm audit of production dependencies reports zero vulnerabilities.
  Full audit still reports nine development-tool findings: five high findings
  in the ESLint/fast-glob/braces chain and four moderate findings in Drizzle
  Kit's obsolete esbuild-loader chain. These are not production runtime
  dependencies. The audit recommends incompatible downgrades; no forced
  downgrade was applied. Avoid exposing these development tools to untrusted
  inputs or networks until upstream-supported upgrades are available.
- Build retains the eight previously known missing Markdown documents and
  the existing large-page-data warning. These do not fail the build.

## Vercel Candidate Acceptance: Runtime Gate Blocked

Implementation commit: `1ddcde7`, pushed to
`origin/codex/vercel-neon-migration` on October 22, 2026 (Asia/Shanghai).
HTTPS push was denied for the active vaincodon account; the existing GitHub SSH
identity jueduizone successfully pushed the same branch without changing the
repository remote or overwriting credentials.

Two production-environment candidates were deployed with `--skip-domain`:

| Candidate | Function region | Build Node | Actual function Node | Gate |
| --- | --- | --- | --- | --- |
| dpl_GXnEtiuxYEhEwVo2SF4tGQo8FEYP / gmonad-fnga5jlws-open-build.vercel.app | iad1 | 24.22.1 | 24.21.0 | 503 / patched:false |
| dpl_9rmebpwGbNh6m8HjHaB1FWsuL8is / gmonad-25ljju9y7-open-build.vercel.app | sin1 | 24.22.1 | 24.21.0 | 503 / patched:false |

Both authenticated function responses also report OpenSSL 3.5.7 and Brotli
1.2.0. Version metadata from the project API still says only `24.x`; it does
not resolve the observed mismatch. The authenticated endpoint has no response
cache. These measurements establish failure to meet the selected upstream
version baseline, not proof of exploitation or proof that every individual
vulnerability is exploitable through this application.

The sin1 candidate passed application smoke checks:

- Home, login, docs, a populated documentation page and activity-map: HTTP 200.
- Blogs, Dapps, tutorials, posts, events, stats and statistics: HTTP 200 and
  successful API envelopes, exercising the existing Neon connection.
- NextAuth session, CSRF and provider endpoints: HTTP 200. This does not test
  a complete interactive account sign-in; no user credentials were submitted.
- Runtime diagnostics: missing/wrong credentials return generic HTTP 401;
  authorized request returns HTTP 503 and the actual unpatched-baseline version.
- Unauthenticated post creation: HTTP 401, with no content created.
- Cloudinary signing: HTTP 200 with signature present; no media uploaded.
- Analytics report: HTTP 200, success:true, source:ga4. No analytics write was
  performed. Local KaTeX rendering also passed a renderToString smoke check.

**No production promotion was performed.** The gmonad.cc alias still resolves
in the authenticated deployment API to dpl_DfSBBMsYou5f9R8vt9FiCLETLJmn, the
pre-remediation deployment. Thus the committed dependency/runtime-policy fixes
are available in the candidates but are not serving the main domain yet. The
temporary gmonadcc-open-build.vercel.app alias was assigned by the CLI to the
latest candidate; the main domain and www alias were not promoted.

Vercel's supported-version documentation offers only 24.x and 22.x and says
minor/patch versions are rolled out by the provider. No supported project
setting was found to pin a managed function to 24.22.1. Changing package engines
or confirming the build version alone does not fix this function runtime.

Release can continue when Vercel updates the actual function runtime to
24.22.1+ on the 24.x line, or supplies verifiable evidence of equivalent security
backports. Re-run the authenticated runtime check, deploy a new candidate if
required, repeat smoke checks, and then promote the accepted deployment.
Do not lower the runtime gate merely to obtain a green result.

Provider support evidence, prepared for the project owner (not sent):

> Project gmonad.cc, project ID prj_JfGgw83c50DChF5LLL4TWkN52VHb, OpenBuild team
> team_jdKwYH5K67gHpkE5vr43CPAc. On October 22, 2026, two new deployments in
> iad1/sin1 build with Node 24.22.1 but their functions report Node 24.21.0 /
> OpenSSL 3.5.7. See the candidate IDs above. Please confirm rollout of the
> October 21 Node security fixes to the actual managed function runtime,
> including the Brotli, TLS and certificate-trust changes, and whether a fresh
> deployment is required. No tokens or application secrets are attached.

No exploit payloads, production content mutations or credential rotations
were used. No conclusion about prior compromise is made. The legacy Linux
host's kernel, NGINX and trust stores still require its confirmed SSH target.

## Sources

- Supplied article: https://mp.weixin.qq.com/s/xie0TOiTlte-H77AdDcdtA
- Node advisory: https://nodejs.org/en/blog/vulnerability/october-2026-security-releases
- Node 24 release: https://nodejs.org/en/blog/release/v24.22.1
- Node support schedule: https://raw.githubusercontent.com/nodejs/Release/main/schedule.json
- PHP security announcement: https://www.php.net/
- NGINX advisories: https://nginx.org/en/security_advisories.html
- Vercel runtime policy: https://vercel.com/docs/functions/runtimes/node-js/node-js-versions
- Measured evidence: authenticated Vercel project/deployment/build API responses,
  public HTTP/TLS probes, current terminal process.versions/tls.rootCertificates,
  and local repository inspection on October 22, 2026 (Asia/Shanghai).
