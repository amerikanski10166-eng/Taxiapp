import { NextResponse } from "next/server";
import { getCurrentDriver } from "@/lib/auth";

export async function GET() {
  try {
    const driver = await getCurrentDriver();
    return NextResponse.json({ driver });
  } catch (error) {
    console.error("me", error);
    return NextResponse.json({ error: "DATABASE_URL не настроен" }, { status: 500 });
  }
}
