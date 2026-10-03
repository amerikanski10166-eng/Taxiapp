import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const url=process.env.SUPABASE_URL||"https://zqvfgljmitaxgpmcgbbt.supabase.co";
export async function GET(req:Request){
  const adminKey=process.env.BASGO_ADMIN_KEY;
  const secret=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
  const cookie=req.headers.get("cookie")||"";
  const session=cookie.match(/(?:^|;\\s*)basgo_admin_session=([^;]+)/)?.[1];
  if(!adminKey||!secret)return NextResponse.json({error:"Админка не настроена на сервере."},{status:503});
  if(session!==adminKey)return NextResponse.json({error:"Не авторизован"},{status:401});
  const db=createClient(url,secret,{auth:{autoRefreshToken:false,persistSession:false}});
  const [{data:couriers,error:ce},{data:orders,error:oe}]=await Promise.all([
    db.from("drivers").select("id,name,phone,status,is_online,latitude,longitude,last_location_at"),
    db.from("ride_requests").select("id,created_at,status,payment_status,payment_method,pickup,destination,offer_price,agreed_price,passenger_name,passenger_phone,driver_id").order("created_at",{ascending:false}).limit(500)
  ]);
  if(ce||oe)return NextResponse.json({error:(ce||oe)?.message||"Не удалось загрузить данные"},{status:500});
  const drivers=couriers||[],rows=orders||[],byDriver=new Map<string,any>();
  for(const d of drivers)byDriver.set(d.id,{...d,orders_count:0,earnings:0});
  for(const o of rows)if(o.driver_id&&byDriver.has(o.driver_id)){const d=byDriver.get(o.driver_id);d.orders_count++;if(o.status==="completed")d.earnings+=Number(o.agreed_price||o.offer_price||0)}
  const completed=rows.filter(o=>o.status==="completed"),revenue=completed.reduce((s,o)=>s+Number(o.agreed_price||o.offer_price||0),0);
  const {data:setting}=await db.from("basgo_admin_settings").select("value").eq("key","commission_percent").maybeSingle();
  const rate=Number(setting?.value||0);
  return NextResponse.json({stats:{orders_total:rows.length,orders_pending:rows.filter(o=>o.status==="pending").length,orders_active:rows.filter(o=>["accepted","in_progress","picked_up"].includes(o.status)).length,orders_completed:completed.length,revenue_completed:revenue,couriers_total:drivers.length,couriers_online:drivers.filter(d=>d.is_online).length},couriers:[...byDriver.values()],orders:rows.map(o=>({...o,driver_name:byDriver.get(o.driver_id)?.name||null})),settings:{commission_percent:rate}});
}