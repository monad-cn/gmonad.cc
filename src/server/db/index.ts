import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

declare global {
  // eslint-disable-next-line no-var
  var __gmonadPostgres: postgres.Sql | undefined;
}

const databaseUrl =
  process.env.DATABASE_URL || 'postgres://invalid:invalid@localhost:5432/invalid';

const client =
  globalThis.__gmonadPostgres ??
  postgres(databaseUrl, {
    max: Number(process.env.DATABASE_MAX_CONNECTIONS || 3),
    prepare: false,
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__gmonadPostgres = client;
}

export const db = drizzle(client, { schema });
export { client as sqlClient };
