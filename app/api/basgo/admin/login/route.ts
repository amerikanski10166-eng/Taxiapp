import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url=process.env.SUPABASE_URL||"https://zqvfgljmitaxgpmcgbbt.supabase.co";
const secret=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminKey=process.env.BASGO_ADMIN_KEY;

export async function POST(req:Request){
  if(!secret||!adminKey)return NextResponse.json({error:"Админка требует BASGO_ADMIN_KEY и серверный Supabase secret key в Vercel."},{status:503});
  const {key}=await req.json().catch(()=>({key:""}));
  if(!key||key!==adminKey)return NextResponse.json({error:"Неверный ключ администратора"},{status:401});
  const res=NextResponse.json({ok:true});
  res.cookies.set("basgo_admin_session",adminKey,{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:60*60*12});
  return res;
}