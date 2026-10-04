import { promises as fs } from "node:fs";
import { gunzipSync } from "node:zlib";
import path from "node:path";
import { NextResponse } from "next/server";
import { getBasgoCityPackage } from "../../../../lib/basgo-gid/city-packages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GeoJsonFeatureCollection = { type: "FeatureCollection"; features: unknown[] };
type PreloadedCityPack = {
  city: string; name: string; source: string; attribution: string; dataVersion: string; fetchedAt: string;
  roads: GeoJsonFeatureCollection; buildings: GeoJsonFeatureCollection;
  counts: { roads: number; buildings: number };
};

export async function GET(request: Request) {
  const city = new URL(request.url).searchParams.get("city")?.trim().toLowerCase() ?? "";
  const pack = getBasgoCityPackage(city);
  if (!pack) return NextResponse.json({ error: "Unknown city package" }, { status: 404 });

  const filePath = path.join(process.cwd(), "public", "basgo-gid", "city-data", `${pack.id}.json.gz`);

  try {
    const compressed = await fs.readFile(filePath);
    const data = JSON.parse(gunzipSync(compressed).toString("utf8")) as PreloadedCityPack;
    return NextResponse.json(
      { ...data, city: pack.id, name: pack.name, storage: "preloaded-basgo-storage" },
      { headers: { "Cache-Control": "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Preloaded map package is not available yet", city: pack.id, storage: "preloaded-basgo-storage" },
      { status: 503 },
    );
  }
}
