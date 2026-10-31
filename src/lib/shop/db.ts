import "server-only";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Local development uses a SQLite file. In production point DATABASE_URL at a hosted
// libSQL database (e.g. Turso: libsql://<db>.turso.io) and set DATABASE_AUTH_TOKEN.
const globalForDb = globalThis as unknown as { ebLibsql?: Client };

const client =
  globalForDb.ebLibsql ??
  createClient({
    url: process.env.DATABASE_URL ?? "file:local.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

if (process.env.NODE_ENV !== "production") globalForDb.ebLibsql = client;

export const db = drizzle(client, { schema });
export { schema };
