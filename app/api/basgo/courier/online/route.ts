import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "../../../../../lib/supabase";
export async function POST(req:Request){
 const token=(await cookies()).get("taxikz_session")?.value;if(!token)return NextResponse.json({error:"Не авторизован"},{status:401});
 const {online}=await req.json().catch(()=>({online:false}));
 const {data,error}=await supabase.rpc("taxi_driver_set_online",{p_token:token,p_online:Boolean(online)});
 if(error){
   const fallback=await supabase.rpc("basgo_driver_set_online",{p_token:token,p_online:Boolean(online)});
   if(fallback.error)return NextResponse.json({error:"Не удалось изменить статус линии"},{status:500});
   return NextResponse.json({driver:fallback.data});
 }
 return NextResponse.json({driver:data});
}