import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function useDB() {
  if (db) return db;

  const config = useRuntimeConfig();

  if (!config.databaseUrl) {
    throw new Error('DATABASE_URL is not defined');
  }

  const client = postgres(config.databaseUrl);
  db = drizzle(client, { schema });

  return db;
}

export { schema };
