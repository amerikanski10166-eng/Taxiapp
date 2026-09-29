import { cookies } from "next/headers";
import crypto from "node:crypto";
import { supabase } from "./supabase";

const COOKIE = "taxikz_session";

export async function createSession(driverId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const { error } = await supabase.rpc("taxi_session_create", { p_token: token, p_driver_id: driverId });
  if (error) throw error;
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getCurrentDriver() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const { data, error } = await supabase.rpc("taxi_session_get", { p_token: token });
  if (error) throw error;
  return data ?? null;
}

export async function clearSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    const { error } = await supabase.rpc("taxi_session_delete", { p_token: token });
    if (error) throw error;
  }
  jar.delete(COOKIE);
}
