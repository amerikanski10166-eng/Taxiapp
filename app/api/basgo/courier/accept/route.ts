// @ts-nocheck
import { NextResponse } from "next/server";
import { getCurrentDriver } from "../../../../../lib/auth";
import { supabase } from "../../../../../lib/supabase";

export async function POST(request: Request) {
  try {
    const driver = await getCurrentDriver();
    if (!driver) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const body = await request.json();
    const rideId = String(body.rideId ?? "");
    if (!rideId) return NextResponse.json({ error: "Не указан заказ" }, { status: 400 });
    const { data, error } = await supabase.rpc("taxi_update_ride", {
      p_request_id: rideId,
      p_driver_id: driver.id,
      p_status: "accepted",
      p_reply: "BASGO: заказ принят исполнителем",
      p_agreed_price: Number(body.agreedPrice) || 0,
    });
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Заказ уже принят другим исполнителем" }, { status: 409 });
    return NextResponse.json({ order: data });
  } catch (error) {
    console.error("basgo courier accept", error);
    return NextResponse.json({ error: "Не удалось принять заказ" }, { status: 500 });
  }
}