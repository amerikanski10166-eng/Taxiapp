// @ts-nocheck
import { NextResponse } from "next/server";
import { getCurrentDriver } from "../../../../../lib/auth";
import { supabase } from "../../../../../lib/supabase";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){try{
 const driver=await getCurrentDriver();if(!driver)return NextResponse.json({error:"Не авторизован"},{status:401});
 const {id}=await params,body=await request.json(),status=String(body.status??""),reply=String(body.reply??"").trim(),agreedPrice=body.agreedPrice==null?null:Number(body.agreedPrice);
 if(!["accepted","countered","rejected"].includes(status))return NextResponse.json({error:"Недопустимый статус"},{status:400});
 if(status==="countered"&&(!Number.isInteger(agreedPrice)||agreedPrice<=0))return NextResponse.json({error:"Укажите новую цену"},{status:400});
 const {data,error}=await supabase.rpc("taxi_update_ride",{p_request_id:id,p_driver_id:driver.id,p_status:status,p_reply:reply,p_agreed_price:status==="rejected"?null:agreedPrice});
 if(error)throw error;if(!data)return NextResponse.json({error:"Заказ не найден"},{status:404});return NextResponse.json({request:data});
}catch(error){console.error("update ride",error);return NextResponse.json({error:"Не удалось обновить заказ"},{status:500});}}
