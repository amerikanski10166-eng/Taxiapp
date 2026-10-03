// @ts-nocheck
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "../../../../../lib/supabase";

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get("taxikz_session")?.value;
    if (!token) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const body = await request.json();
    const rideId = String(body.rideId || "");
    if (!rideId) return NextResponse.json({ error: "Не указан заказ" }, { status: 400 });
    const { data, error } = await supabase.rpc("basgo_driver_complete_order", { p_token: token, p_ride_id: rideId });
    if (error) throw error;
    return NextResponse.json({ order: data });
  } catch (error) {
    console.error("basgo courier complete", error);
    return NextResponse.json({ error: "Не удалось завершить заказ. Проверьте активный заказ." }, { status: 500 });
  }
}
