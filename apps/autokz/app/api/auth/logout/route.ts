// @ts-nocheck
import { NextResponse } from "next/server";
import { clearSession } from "../../../../lib/auth";
export async function POST(){try{await clearSession();return NextResponse.json({ok:true});}catch{return NextResponse.json({error:"Ошибка выхода"},{status:500});}}