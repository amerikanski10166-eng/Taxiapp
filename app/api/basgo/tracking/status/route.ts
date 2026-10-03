// @ts-nocheck
import { NextResponse } from "next/server";
import { supabase } from "../../../../../lib/supabase";

export async function GET(request: Request) {
  try {
    const token = new URL(request.url).searchParams.get("token")?.trim();
    if (!token) return NextResponse.json({ error: "Не указан код отслеживания" }, { status: 400 });
    const { data, error } = await supabase.rpc("basgo_get_order_status", { p_tracking_token: token });
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
    return NextResponse.json({ order: data });
  } catch (error) {
    console.error("basgo tracking status", error);
    return NextResponse.json({ error: "Не удалось получить статус заказа" }, { status: 500 });
  }
}
