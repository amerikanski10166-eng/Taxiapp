import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ensureSchema, db } from "../../../../lib/db";
import { createSession } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = String(body.phone ?? "").replace(/\\s+/g, "");
    const password = String(body.password ?? "");
    await ensureSchema();

    const rows = await db()`)SELECT id, name, phone, password_hash, car, plate, status
      FROM drivers WHERE phone = ${phone} LIMIT 1`;
    if (!rows.length || !(await bcrypt.compare(password, String(rows[0].password_hash)))) {
      return NextResponse.json({ error: "Неверный номер телефона или пароль" }, { status: 401 });
    }

    const { password_hash, ...driver } = rows[0];
    await createSession(String(driver.id));
    return NextResponse.json({ driver });
  } catch (error) {
    console.error("login", error);
    return NextResponse.json({ error: "Не удалось выполнить вход" }, { status: 500 });
  }
}
