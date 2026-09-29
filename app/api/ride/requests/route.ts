import { NextResponse } from "next/server";
import { getCurrentDriver } from "../../../../lib/auth";
import { ensureSchema, db } from "../../../../lib/db";

export async function GET() {
  const driver = await getCurrentDriver();
  if (!driver) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  await ensureSchema();
  const sql = db();
  const rows = await sql`SELECT id, passenger_name, passenger_phone, message, destination, offer_price, payment_method, status, driver_reply, agreed_price, created_at
    FROM ride_requests WHERE driver_id = ${driver.id} ORDER BY created_at DESC LIMIT 30`;
  return NextResponse.json({ requests: rows });
}
