import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase.rpc("get_basgo_gid_metrics", { p_days: 30 });
  if (error) return NextResponse.json({ ok: false, error: "metrics_unavailable" }, { status: 500 });
  return NextResponse.json({ ok: true, days: 30, rows: data ?? [] });
}
