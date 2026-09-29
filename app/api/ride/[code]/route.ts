import { NextResponse } from "next/server";
import { ensureSchema, db } from "../../../../lib/db";

const payments = new Set(["kaspi", "card", "cash"]);

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  await ensureSchema();
  const { code } = await params;
  const sql = db();
  const rows = await sql`SELECT id, name, car, plate, public_code FROM drivers WHERE public_code = ${code} LIMIT 1`;
  if (!rows.length) return NextResponse.json({ error: "Водитель не найден" }, { status: 404 });
  return NextResponse.json({ driver: rows[0] });
}

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    await ensureSchema();
    const { code } = await params;
    const body = await request.json();
    const destination = String(body.destination ?? "").trim();
    const offerPrice = Number(body.offerPrice);
    const paymentMethod = String(body.paymentMethod ?? "");
    const passengerName = String(body.passengerName ?? "").trim();
    const passengerPhone = String(body.passengerPhone ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!destination || !Number.isInteger(offerPrice) || offerPrice <= 0 || !payments.has(paymentMethod)) {
      return NextResponse.json({ error: "Укажите маршрут, цену и способ оплаты" }, { status: 400 });
    }

    const sql = db();
    const drivers = await sql`SELECT id, name FROM drivers WHERE public_code = ${code} LIMIT 1`;
    if (!drivers.length) return NextResponse.json({ error: "Водитель не найден" }, { status: 404 });

    const rows = await sql`INSERT INTO ride_requests
      (driver_id, passenger_name, passenger_phone, message, destination, offer_price, payment_method)
      VALUES (${drivers[0].id}, ${passengerName || null}, ${passengerPhone || null}, ${message || null}, ${destination}, ${offerPrice}, ${paymentMethod})
      RETURNING id, status, offer_price, payment_method, created_at`;

    if (message) {
      await sql`INSERT INTO ride_messages (ride_id, sender, message) VALUES (${rows[0].id}, 'passenger', ${message})`;
    }
    return NextResponse.json({ request: rows[0], driver: drivers[0] }, { status: 201 });
  } catch (error) {
    console.error("ride request", error);
    return NextResponse.json({ error: "Не удалось отправить заказ" }, { status: 500 });
  }
}
