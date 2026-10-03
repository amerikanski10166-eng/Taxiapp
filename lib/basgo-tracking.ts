import { supabase } from "./supabase";

function getSupabase() {
  if (!supabase) throw new Error("Supabase не настроен: проверьте переменные окружения.");
  return supabase;
}

export type TrackingPoint = {
  id?: string;
  ride_id: string;
  latitude: number;
  longitude: number;
  accuracy_meters?: number | null;
  heading_degrees?: number | null;
  speed_mps?: number | null;
  status?: string;
  updated_at?: string;
};

export async function sendDriverLocation(
  sessionToken: string,
  rideId: string,
  point: Omit<TrackingPoint, "ride_id">
) {
  return getSupabase().rpc("basgo_update_driver_location", {
    p_token: sessionToken,
    p_ride_id: rideId,
    p_latitude: point.latitude,
    p_longitude: point.longitude,
    p_accuracy_meters: point.accuracy_meters ?? null,
    p_heading_degrees: point.heading_degrees ?? null,
    p_speed_mps: point.speed_mps ?? null,
  });
}

export async function sendDriverLocationFromBrowser(
  rideId: string,
  point: Omit<TrackingPoint, "ride_id">
) {
  const response = await fetch("/api/driver/location", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rideId,
      latitude: point.latitude,
      longitude: point.longitude,
      accuracyMeters: point.accuracy_meters ?? null,
      headingDegrees: point.heading_degrees ?? null,
      speedMps: point.speed_mps ?? null,
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error || "Не удалось отправить GPS");
  return body;
}

export function subscribeToOrderTracking(
  trackingToken: string,
  onLocation: (point: TrackingPoint) => void
) {
  const channel = getSupabase()
    .channel(`order:${trackingToken}`)
    .on("broadcast", { event: "location" }, ({ payload }) => {
      if (
        payload &&
        typeof payload.latitude === "number" &&
        typeof payload.longitude === "number"
      ) {
        onLocation(payload as TrackingPoint);
      }
    })
    .subscribe();

  return () => {
    void getSupabase().removeChannel(channel);
  };
}
