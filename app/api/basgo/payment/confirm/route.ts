// @ts-nocheck
import { NextResponse } from "next/server";
import { supabase } from "../../../../../lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const trackingToken = String(body.trackingToken || "").trim();
    const rideId = String(body.rideId || "").trim();
    if (!trackingToken || !rideId) return NextResponse.json({ error: "Не указан заказ или код отслеживания" }, { status: 400 });
    const { data, error } = await supabase.rpc("basgo_confirm_payment", { p_tracking_token: trackingToken, p_ride_id: rideId });
    if (error) throw error;
    return NextResponse.json({ order: data });
  } catch (error) {
    console.error("basgo payment confirm", error);
    return NextResponse.json({ error: "Оплату пока нельзя подтвердить. Сначала дождитесь завершения заказа." }, { status: 400 });
  }
}
