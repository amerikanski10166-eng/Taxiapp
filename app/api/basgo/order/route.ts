// @ts-nocheck
import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

const payments = new Set(["kaspi","card","cash"]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = String(body.message ?? "").trim();
    const pickup = String(body.pickup ?? "").trim();
    const destination = String(body.destination ?? "").trim();
    const offerPrice = Number(body.offerPrice);
    const paymentMethod = String(body.paymentMethod ?? "").trim();
    if (!message || !pickup || !destination || !Number.isInteger(offerPrice) || offerPrice <= 0 || !payments.has(paymentMethod)) {
      return NextResponse.json({ error: "Заполните задачу, адреса, цену и способ оплаты" }, { status: 400 });
    }
    const { data, error } = await supabase.rpc("basgo_create_order", {
      p_message: message,
      p_pickup: pickup,
      p_destination: destination,
      p_offer_price: offerPrice,
      p_payment_method: paymentMethod,
      p_passenger_name: String(body.passengerName ?? "").trim() || null,
      p_passenger_phone: String(body.passengerPhone ?? "").trim() || null,
      p_pickup_latitude: body.pickupLatitude == null ? null : Number(body.pickupLatitude),
      p_pickup_longitude: body.pickupLongitude == null ? null : Number(body.pickupLongitude),
      p_destination_latitude: body.destinationLatitude == null ? null : Number(body.destinationLatitude),
      p_destination_longitude: body.destinationLongitude == null ? null : Number(body.destinationLongitude),
    });
    if (error) throw error;
    return NextResponse.json({ order: data }, { status: 201 });
  } catch (error) {
    console.error("basgo order", error);
    return NextResponse.json({ error: "Не удалось создать поручение" }, { status: 500 });
  }
}