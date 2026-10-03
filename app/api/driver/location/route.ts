// @ts-nocheck
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "../../../../lib/supabase";

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get("taxikz_session")?.value;
    if (!token) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const body = await request.json();
    const rideId = String(body.rideId || "");
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);

    if (!rideId || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json({ error: "Некорректные данные GPS" }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("basgo_update_driver_location", {
      p_token: token,
      p_ride_id: rideId,
      p_latitude: latitude,
      p_longitude: longitude,
      p_accuracy_meters: body.accuracyMeters == null ? null : Number(body.accuracyMeters),
      p_heading_degrees: body.headingDegrees == null ? null : Number(body.headingDegrees),
      p_speed_mps: body.speedMps == null ? null : Number(body.speedMps),
    });

    if (error) throw error;
    return NextResponse.json({ tracking: data });
  } catch (error) {
    console.error("driver location", error);
    return NextResponse.json({ error: "Не удалось передать GPS. Проверьте активный заказ и авторизацию." }, { status: 500 });
  }
}
