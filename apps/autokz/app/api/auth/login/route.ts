// @ts-nocheck
import { NextResponse } from "next/server";
import { createSession } from "../../../../lib/auth";
import { supabase } from "../../../../lib/supabase";
export async function POST(request: Request) {
  try {
    const body=await request.json(); const phone=String(body.phone??"").replace(/\s+/g,""), password=String(body.password??"");
    const {data,error}=await supabase.rpc("taxi_login",{p_phone:phone,p_password:password});
    if(error) throw error; if(!data) return NextResponse.json({error:"Неверный номер телефона или пароль"},{status:401});
    await createSession(String(data.id)); return NextResponse.json({driver:data});
  } catch(error){console.error("login",error);return NextResponse.json({error:"Не удалось выполнить вход"},{status:500});}
}