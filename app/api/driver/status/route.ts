// @ts-nocheck
import { NextResponse } from "next/server";
import { getCurrentDriver } from "../../../../lib/auth";
import { supabase } from "../../../../lib/supabase";

export async function PATCH(request: Request) {
  try {
    const driver = await getCurrentDriver();
    if (!driver) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const body = await request.json();
    const online = Boolean(body.online);
    const { data, error } = await supabase.rpc("taxi_set_driver_online", {
      p_driver_id: driver.id,
      p_online: online,
    });
    if (error) throw error;
    return NextResponse.json({ driver: data });
  } catch (error) {
    console.error("driver status", error);
    return NextResponse.json({ error: "Не удалось изменить статус" }, { status: 500 });
  }
}
