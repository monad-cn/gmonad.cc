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

Production candidate deployment and runtime verification are pending at the
time of this implementation commit. No exploit payloads or production data
mutations were used. No conclusion about prior compromise is made.

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
