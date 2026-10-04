// @ts-nocheck
import { NextResponse } from "next/server";
import { getCurrentDriver } from "../../../../lib/auth";
import { supabase } from "../../../../lib/supabase";
export async function GET(){try{const driver=await getCurrentDriver();if(!driver)return NextResponse.json({error:"Не авторизован"},{status:401});const {data,error}=await supabase.rpc("taxi_driver_requests",{p_driver_id:driver.id});if(error)throw error;return NextResponse.json({requests:Array.isArray(data)?data:[]});}catch(error){console.error("requests",error);return NextResponse.json({error:"Не удалось получить заказы"},{status:500});}}