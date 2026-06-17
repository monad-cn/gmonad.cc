# Vercel Deployment

This project now runs the application backend inside Next.js at `/api/v1/*`.
The old Go service can be retired after data has been migrated to the Postgres
database configured by `DATABASE_URL`.

## Required Environment Variables

Set these in the OpenBuild Vercel project:

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

With a logged-in Vercel CLI:

```bash
npx vercel link
npx vercel --prod
```

Or with a token:

```bash
npx vercel link --token "$VERCEL_TOKEN"
npx vercel --prod --token "$VERCEL_TOKEN"
```

The project includes `vercel.json` cron jobs for:

- `/api/v1/internal/cron/daily-stats`
- `/api/v1/internal/cron/testnet`
- `/api/v1/internal/cron/validator`

Set `CRON_SECRET`; Vercel Cron will call the endpoints with that secret.
