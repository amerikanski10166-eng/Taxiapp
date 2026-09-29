import { neon } from "@neondatabase/serverless";

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}

let schemaPromise: Promise<unknown> | null = null;

export function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const sql = getSql();
      await sql`CREATE TABLE IF NOT EXISTS drivers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        car TEXT,
        plate TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`ALTER TABLE drivers ADD COLUMN IF NOT EXISTS public_code TEXT`;
      await sql`ALTER TABLE drivers ADD COLUMN IF NOT EXISTS color TEXT`;
      await sql`UPDATE drivers SET public_code = LOWER(SUBSTRING(REPLACE(id::text, '-', ''), 1, 10)) WHERE public_code IS NULL`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS drivers_public_code_idx ON drivers(public_code)`;
      await sql`CREATE TABLE IF NOT EXISTS ride_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
        passenger_name TEXT,
        passenger_phone TEXT,
        message TEXT,
        destination TEXT NOT NULL,
        offer_price INTEGER NOT NULL,
        payment_method TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        driver_reply TEXT,
        agreed_price INTEGER,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS ride_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ride_id UUID NOT NULL REFERENCES ride_requests(id) ON DELETE CASCADE,
        sender TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS driver_sessions (
        token TEXT PRIMARY KEY,
        driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
        expires_at TIMESTAMPTZ NOT NULL
      )`;
    })();
  }
  return schemaPromise;
}

export function db() {
  return getSql();
}
