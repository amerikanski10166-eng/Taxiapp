import { NextResponse } from "next/server";
import { getBasgoCityPackage } from "../../../../lib/basgo-gid/city-packages";

export const runtime = "nodejs";
export const revalidate = 86400;

type OverpassElement = { type: "way"; id: number; tags?: Record<string, string>; geometry?: Array<{ lat: number; lon: number }> };
type GeoJsonFeature = { type: "Feature"; properties: Record<string, string | number | null>; geometry: { type: "LineString"; coordinates: [number, number][] } | { type: "Polygon"; coordinates: [number, number][][] } };

async function queryOverpass(query: string) {
  const endpoints = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];
  let lastError: unknown;
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ data: query }).toString(),
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(45000),
      });
      if (!response.ok) throw new Error(`Overpass returned ${response.status}`);
      return (await response.json()) as { elements?: OverpassElement[] };
    } catch (error) { lastError = error; }
  }
  throw lastError instanceof Error ? lastError : new Error("Overpass request failed");
}

export async function GET(request: Request) {
  const city = new URL(request.url).searchParams.get("city")?.trim().toLowerCase() ?? "";
  const pack = getBasgoCityPackage(city);
  if (!pack) return NextResponse.json({ error: "Unknown city package" }, { status: 404 });

  const [west, south, east, north] = pack.bbox;
  const bbox = `${south},${west},${north},${east}`;
  const query = `[out:json][timeout:40];(way["highway"](${bbox});way["building"](${bbox}););out tags geom;`;

  try {
    const data = await queryOverpass(query);
    const roads: GeoJsonFeature[] = [];
    const buildings: GeoJsonFeature[] = [];
    for (const element of data.elements ?? []) {
      const points = (element.geometry ?? []).map((p) => [p.lon, p.lat] as [number, number]);
      const tags = element.tags ?? {};
      if (tags.highway && points.length >= 2) {
        roads.push({ type: "Feature", properties: { id: element.id, name: tags.name ?? tags["name:ru"] ?? tags["name:kk"] ?? null, highway: tags.highway, ref: tags.ref ?? null, lanes: tags.lanes ?? null, maxspeed: tags.maxspeed ?? null, oneway: tags.oneway ?? null }, geometry: { type: "LineString", coordinates: points } });
      }
      if (tags.building && points.length >= 4) {
        const closed = points[0][0] === points[points.length - 1][0] && points[0][1] === points[points.length - 1][1];
        if (!closed) points.push(points[0]);
        buildings.push({ type: "Feature", properties: { id: element.id, name: tags.name ?? tags["name:ru"] ?? tags["name:kk"] ?? null, building: tags.building, levels: tags["building:levels"] ?? null }, geometry: { type: "Polygon", coordinates: [points] } });
      }
    }
    return NextResponse.json({ city: pack.id, source: "OpenStreetMap via Overpass API", attribution: "© OpenStreetMap contributors", fetchedAt: new Date().toISOString(), roads: { type: "FeatureCollection", features: roads }, buildings: { type: "FeatureCollection", features: buildings }, counts: { roads: roads.length, buildings: buildings.length } }, { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
  } catch (error) {
    return NextResponse.json({ error: "Real map data temporarily unavailable", detail: error instanceof Error ? error.message : "unknown error" }, { status: 503 });
  }
}
