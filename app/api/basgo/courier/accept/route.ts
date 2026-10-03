// @ts-nocheck
import { NextResponse } from "next/server";
import { getCurrentDriver } from "../../../../../lib/auth";
import { cookies } from "next/headers";
import { supabase } from "../../../../../lib/supabase";

export async function POST(request: Request) {
  try {
    const driver = await getCurrentDriver();
    if (!driver) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const body = await request.json();
    const rideId = String(body.rideId ?? "").trim();
    const agreedPrice = Number(body.agreedPrice);
    if (!/^[0-9a-f-]{36}$/i.test(rideId)) return NextResponse.json({ error: "Некорректный идентификатор заказа" }, { status: 400 });
    if (!Number.isInteger(agreedPrice) || agreedPrice <= 0) return NextResponse.json({ error: "Некорректная цена заказа" }, { status: 400 });
    const token = (await cookies()).get("taxikz_session")?.value;
    if (!token) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const { data, error } = await supabase.rpc("basgo_driver_accept_order", {
      p_token: token,
      p_ride_id: rideId,
      p_agreed_price: agreedPrice,
    });
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Заказ уже принят другим исполнителем" }, { status: 409 });
    return NextResponse.json({ order: data });
  } catch (error) {
    console.error("basgo courier accept", error);
    return NextResponse.json({ error: "Не удалось принять заказ" }, { status: 500 });
  }
}