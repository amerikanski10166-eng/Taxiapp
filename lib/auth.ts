import { cookies } from "next/headers";
import crypto from "node:crypto";
import { ensureSchema, db } from "./db";

const COOKIE = "taxikz_session";

export async function createSession(driverId: string) {
  await ensureSchema();
  const token = crypto.randomBytes(32).toString("hex");
  const sql = db();
  await sql`INSERT INTO driver_sessions (token, driver_id, expires_at)
    VALUES (${token}, ${driverId}, NOW() + INTERVAL '30 days')`;
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getCurrentDriver() {
  await ensureSchema();
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const sql = db();
  const rows = await sql`SELECT d.id, d.name, d.phone, d.car, d.plate, d.public_code, d.status
    FROM driver_sessions s
    JOIN drivers d ON d.id = s.driver_id
    WHERE s.token = ${token} AND s.expires_at > NOW()
    LIMIT 1`;
  return rows[0] ?? null;
}

export async function clearSession() {
  await ensureSchema();
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    const sql = db();
    await sql`DELETE FROM driver_sessions WHERE token = ${token}`;
  }
  jar.delete(COOKIE);
}
