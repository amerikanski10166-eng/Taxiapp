// @ts-nocheck
import { NextResponse } from "next/server";
import { getCurrentDriver } from "../../../../lib/auth";
export async function GET(){try{return NextResponse.json({driver:await getCurrentDriver()});}catch(error){console.error("me",error);return NextResponse.json({error:"Ошибка базы данных"},{status:500});}}