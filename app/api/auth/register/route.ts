import { NextResponse } from "next/server";
import { createSession } from "../../../../lib/auth";
import { supabase } from "../../../../lib/supabase";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name=String(body.name??"").trim(), phone=String(body.phone??"").replace(/\s+/g,""), password=String(body.password??"");
    const car=String(body.car??"").trim(), plate=String(body.plate??"").trim(), color=String(body.color??"").trim();
    if(!name||!phone||password.length<6) return NextResponse.json({error:"Введите имя, телефон и пароль от 6 символов"},{status:400});
    const {data,error}=await supabase.rpc("taxi_register",{p_name:name,p_phone:phone,p_password:password,p_car:car,p_plate:plate,p_color:color});
    if(error){if(error.message.includes("duplicate key")||error.code==="23505") return NextResponse.json({error:"Водитель с таким номером уже зарегистрирован"},{status:409});throw error;}
    await createSession(String(data.id)); return NextResponse.json({driver:data},{status:201});
  } catch(error){console.error("register",error);return NextResponse.json({error:"Не удалось зарегистрировать водителя"},{status:500});}
}