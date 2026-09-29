import { NextResponse } from "next/server";
import { getCurrentDriver } from "../../../../../lib/auth";
import { ensureSchema, db } from "../../../../../lib/db";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const driver = await getCurrentDriver();
  if (!driver) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  await ensureSchema();
  const { id } = await params;
  const body = await request.json();
  const status = String(body.status ?? "");
  const reply = String(body.reply ?? "").trim();
  const agreedPrice = body.agreedPrice == null ? null : Number(body.agreedPrice);
  if (!["accepted", "countered", "rejected"].includes(status)) return NextResponse.json({ error: "Недопустимый статус" }, { status: 400 });
  if (status === "countered" && (!Number.isInteger(agreedPrice) || agreedPrice <= 0)) return NextResponse.json({ error: "Укажите новую цену" }, { status: 400 });

  const sql = db();
  const rows = await sql`UPDATE ride_requests SET status = ${status}, driver_reply = ${reply || null}, agreed_price = ${status === "countered" ? agreedPrice : status === "accepted" ? agreedPrice : null}, updated_at = NOW()
    WHERE id = ${id} AND driver_id = ${driver.id}
    RETURNING id, status, offer_price, agreed_price, driver_reply`;
  if (!rows.length) return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
  if (reply) await sql`INSERT INTO ride_messages (ride_id, sender, message) VALUES (${id}, 'driver', ${reply})`;
  return NextResponse.json({ request: rows[0] });
}
