# Vercel Deployment

This project now runs the application backend inside Next.js at `/api/v1/*`.
The old Go service can be retired after data has been migrated to the Postgres
database configured by `DATABASE_URL`.

## Required Environment Variables

Set these in the OpenBuild Vercel project `gmonad-cc` (project ID unchanged):

```env
NEXT_PUBLIC_API_URL=/api/v1
DATABASE_URL=
JWT_SECRET=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
CRON_SECRET=
CORS_ORIGIN=

OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
OAUTH_ACCESS_API=
OAUTH_GET_USER=
NEXT_PUBLIC_OAUTH=

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_FOLDERS=

NEXT_PUBLIC_GA_ID=
GOOGLE_SERVICE_ACCOUNT_KEY=
GA4_PROPERTY_ID=

MONAD_RPC_URL=
VALIDATOR_URL=
```

`DATABASE_URL` can point at Neon or Supabase Postgres. For the current Neon
setup, use the direct Neon host rather than the `-pooler` host because the
pooler connection reported an empty `search_path`. The direct connection keeps
`search_path=public` and works with the existing unqualified SQL queries. For
Supabase pooler connections, keep prepared statements disabled; the `postgres`
client is already configured with `prepare: false`.

## Database Setup

Run once against the production database:

```bash
npm ci
npm run db:push
npm run db:seed
```

`db:push` applies the Drizzle schema. `db:seed` creates the default permissions,
roles, and Dapp categories required by login and publishing flows.

## Deploy

Use `nvm install && nvm use` for the patched Node.js version in `.nvmrc`.
Build/start checks require Node.js >=24.22.1 <25, including the October 2026
Brotli, TLS and CA trust fixes. This deployment uses Vercel's official Container
Runtime (currently Beta), with the Node.js base image pinned by version and
SHA256 digest in `Dockerfile.vercel`. The normal managed Node runtime was still
24.21.0 despite builds using 24.22.1. Containers let the application run the
patched binary without waiting for the provider's managed-runtime rollout.

The image runs Next.js standalone as the non-root `node` user on port 3000 in
sin1, with its image cache under `/tmp`. Public assets and Markdown documents
are copied explicitly. Runtime credentials stay in Vercel environment variables
and are not copied into the Docker context or image. Maintaining the pinned
Node/base-image updates is now the application's responsibility. The Next.js
server handles image optimization and static assets; this does not use Vercel's
native Next.js function splitting or distributed incremental cache.

Use the deployment helper rather than invoking `vercel deploy` directly. It
exports only the allowlisted public browser settings from production Vercel
configuration into a temporary `.container-build/public-env.json`, deploys a
candidate with CLI 64.7.0 and `--skip-domain`, then removes the file. No database,
OAuth client secret, Cloudinary secret or diagnostic secret enters that file.
The current container builder did not forward project build arguments, including
explicit `--build-env` values, so the generated file is required. Direct Git
deployment must prepare that file through an equivalent pipeline first.

```bash
nvm use
keyrail use vercel --reference open-build -- node scripts/deploy-vercel-container.mjs
keyrail use vercel --reference open-build -- node scripts/verify-vercel-runtime.mjs https://CANDIDATE.vercel.app
```

The verifier resolves deployment ownership before reading/sending CRON_SECRET,
then requires HTTP 200, `patched:true` and the supported Node patch baseline.
Also smoke-test pages, authenticated boundaries, database reads, media and login
configuration before promotion. The diagnostic endpoint is private, disables
caching and returns 401 without valid credentials or 503 below the baseline.

After all checks pass, promote using the candidate URL:

```bash
keyrail use vercel --reference open-build -- sh -lc 'npm exec --yes --package=vercel@64.7.0 -- vercel promote https://CANDIDATE.vercel.app --yes --scope open-build --token "$VERCEL_TOKEN"'
keyrail use vercel --reference open-build -- node scripts/verify-vercel-runtime.mjs https://gmonad.cc
```

Project name `gmonad.cc` was changed to `gmonad-cc` because VCR rejected the old
project slug with `NAME_INVALID`. The project ID, existing custom domains and
database are unchanged. Do not roll back to the older managed-Node deployment
without checking its actual runtime and security dependencies.

CI validates the container with dummy public settings and a temporary local
diagnostic credential. The old SSH deployment workflow is manual-only; it does
not deploy or patch the old Linux host as a side effect of CI.

The project includes `vercel.json` cron jobs for:

- `/api/v1/internal/cron/daily-stats`
- `/api/v1/internal/cron/testnet`
- `/api/v1/internal/cron/validator`

Set `CRON_SECRET`; Vercel Cron will call the endpoints with that secret.
