import { mkdir, writeFile } from "node:fs/promises";
import { BASGO_CITY_PACKAGES } from "../../lib/basgo-gid/city-packages.ts";

const endpoints = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchCity(city) {
  const [west, south, east, north] = city.bbox;
  const bbox = `${south},${west},${north},${east}`;
  const query = `[out:json][timeout:120];(way["highway"](${bbox});way["building"](${bbox}););out tags geom;`;

  let lastError = new Error("No Overpass endpoint succeeded");
  for (const endpoint of endpoints) {
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ data: query }),
          signal: AbortSignal.timeout(150000),
        });

        if (response.status === 429) {
          await sleep(60000 * attempt);
          continue;
        }
        if (!response.ok) throw new Error(`${endpoint} returned ${response.status}`);

        const data = await response.json();
        const roads = [];
        const buildings = [];

        for (const element of data.elements ?? []) {
          const points = (element.geometry ?? []).map((p) => [p.lon, p.lat]);
          const tags = element.tags ?? {};

          if (tags.highway && points.length >= 2) {
            roads.push({
              type: "Feature",
              properties: {
                id: element.id,
                name: tags.name ?? tags["name:ru"] ?? tags["name:kk"] ?? null,
                highway: tags.highway,
                ref: tags.ref ?? null,
                lanes: tags.lanes ?? null,
                maxspeed: tags.maxspeed ?? null,
                oneway: tags.oneway ?? null,
              },
              geometry: { type: "LineString", coordinates: points },
            });
          }

          if (tags.building && points.length >= 4) {
            const closed = points[0][0] === points.at(-1)?.[0] && points[0][1] === points.at(-1)?.[1];
            if (!closed) points.push(points[0]);
            buildings.push({
              type: "Feature",
              properties: {
                id: element.id,
                name: tags.name ?? tags["name:ru"] ?? tags["name:kk"] ?? null,
                building: tags.building,
                levels: tags["building:levels"] ?? null,
              },
              geometry: { type: "Polygon", coordinates: [points] },
            });
          }
        }

        return {
          city: city.id,
          name: city.name,
          source: "OpenStreetMap via scheduled BASGO ingestion",
          attribution: "© OpenStreetMap contributors",
          dataVersion: new Date().toISOString().slice(0, 10),
          fetchedAt: new Date().toISOString(),
          roads: { type: "FeatureCollection", features: roads },
          buildings: { type: "FeatureCollection", features: buildings },
          counts: { roads: roads.length, buildings: buildings.length },
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        await sleep(5000 * attempt);
      }
    }
  }
  throw lastError;
}

await mkdir("public/basgo-gid/city-data", { recursive: true });

for (const city of BASGO_CITY_PACKAGES) {
  console.log(`Ingesting ${city.name} (${city.id})...`);
  try {
    const pack = await fetchCity(city);
    await writeFile(`public/basgo-gid/city-data/${city.id}.json`, JSON.stringify(pack));
    console.log(`OK ${city.id}: ${pack.counts.roads} roads, ${pack.counts.buildings} buildings`);
  } catch (error) {
    console.error(`FAILED ${city.id}:`, error);
    process.exitCode = 1;
  }
  await sleep(15000);
}
