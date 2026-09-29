import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ensureSchema, sql } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").replace(/\\s+/g, "");
    const password = String(body.password ?? "");
    const car = String(body.car ?? "").trim();
    const plate = String(body.plate ?? "").trim();

    if (!name || !phone || password.length < 6) {
      return NextResponse.json({ error: "Введите имя, телефон и пароль от 6 символов" }, { status: 400 });
    }

    await ensureSchema();
    const exists = await sql`SELECT id FROM drivers WHERE phone = ${phone} LIMIT 1`;
    if (exists.length) {
      return NextResponse.json({ error: "Водитель с таким номером уже зарегистрирован" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const rows = await sql`INSERT INTO drivers (name, phone, password_hash, car, plate)
      VALUES (${name}, ${phone}, ${passwordHash}, ${car || null}, ${plate || null})
      RETURNING id, name, phone, car, plate, status`;

    await createSession(String(rows[0].id));
    return NextResponse.json({ driver: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("register", error);
    return NextResponse.json({ error: "Не удалось зарегистрировать водителя" }, { status: 500 });
  }
}
