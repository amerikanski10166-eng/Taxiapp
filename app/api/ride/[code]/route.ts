import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
const payments=new Set(["kaspi","card","cash"]);
export async function GET(request:Request,{params}:{params:Promise<{code:string}>}){
  const {code}=await params; const requestId=new URL(request.url).searchParams.get("request");
  if(requestId){const {data,error}=await supabase.rpc("taxi_ride_status",{p_request_id:requestId});if(error) return NextResponse.json({error:"Ошибка базы данных"},{status:500});if(!data)return NextResponse.json({error:"Заказ не найден"},{status:404});return NextResponse.json({request:data});}
  const {data,error}=await supabase.rpc("taxi_public_driver",{p_code:code});if(error)return NextResponse.json({error:"Ошибка базы данных"},{status:500});if(!data)return NextResponse.json({error:"Водитель не найден"},{status:404});return NextResponse.json({driver:data});
}
export async function POST(request:Request,{params}:{params:Promise<{code:string}>}){
 try{const {code}=await params;const body=await request.json();const destination=String(body.destination??"").trim(),offerPrice=Number(body.offerPrice),paymentMethod=String(body.paymentMethod??"");
 const passengerName=String(body.passengerName??"").trim(),passengerPhone=String(body.passengerPhone??"").trim(),message=String(body.message??"").trim();
 if(!destination||!Number.isInteger(offerPrice)||offerPrice<=0||!payments.has(paymentMethod))return NextResponse.json({error:"Укажите маршрут, цену и способ оплаты"},{status:400});
 const {data,error}=await supabase.rpc("taxi_create_ride",{p_code:code,p_passenger_name:passengerName,p_passenger_phone:passengerPhone,p_message:message,p_destination:destination,p_offer_price:offerPrice,p_payment_method:paymentMethod});
 if(error){if(error.message.includes("DRIVER_NOT_FOUND"))return NextResponse.json({error:"Водитель не найден"},{status:404});throw error;}
 return NextResponse.json({request:{id:data.id,status:data.status,offer_price:data.offer_price,payment_method:data.payment_method,created_at:data.created_at},driver:data.driver},{status:201});
 }catch(error){console.error("ride request",error);return NextResponse.json({error:"Не удалось отправить заказ"},{status:500});}
}