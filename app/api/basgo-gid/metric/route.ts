import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

const ALLOWED = new Set(["app_open","map_search","route_build","offline_use","voice_search","business_view"]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const metric = typeof body?.metric === "string" ? body.metric : "";
    const region = typeof body?.region === "string" ? body.region.slice(0, 80) : "unknown";
    if (!ALLOWED.has(metric)) return NextResponse.json({ ok: false }, { status: 400 });
    const { error } = await supabase.rpc("record_basgo_gid_metric", { p_metric: metric, p_region: region });
    if (error) return NextResponse.json({ ok: false }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
}
