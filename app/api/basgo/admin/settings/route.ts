import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const url=process.env.SUPABASE_URL||"https://zqvfgljmitaxgpmcgbbt.supabase.co";
export async function POST(req:Request){
 const adminKey=process.env.BASGO_ADMIN_KEY,secret=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
 const cookie=req.headers.get("cookie")||"",session=cookie.match(/(?:^|;\\s*)basgo_admin_session=([^;]+)/)?.[1];
 if(!adminKey||!secret)return NextResponse.json({error:"Админка не настроена"},{status:503});
 if(session!==adminKey)return NextResponse.json({error:"Не авторизован"},{status:401});
 const {commission}=await req.json().catch(()=>({commission:null}));const value=Number(commission);
 if(!Number.isFinite(value)||value<0||value>100)return NextResponse.json({error:"Комиссия должна быть от 0 до 100%"},{status:400});
 const db=createClient(url,secret,{auth:{autoRefreshToken:false,persistSession:false}});
 const {error}=await db.from("basgo_admin_settings").upsert({key:"commission_percent",value:String(value),updated_at:new Date().toISOString()});
 if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({ok:true});
}