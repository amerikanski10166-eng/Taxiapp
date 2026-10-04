import { mkdir, writeFile, rm } from "node:fs/promises";
import { gzipSync } from "node:zlib";

const cities = [
  ["astana","Астана",71.24,51.01,71.62,51.25],["almaty","Алматы",76.68,43.12,77.10,43.36],
  ["shymkent","Шымкент",69.40,42.22,69.78,42.43],["karaganda","Караганда",72.88,49.68,73.32,49.94],
  ["aktobe","Актобе",56.96,50.15,57.38,50.41],["taraz","Тараз",71.20,42.79,71.54,43.01],
  ["pavlodar","Павлодар",76.78,52.19,77.12,52.39],["oskemen","Өскемен",82.43,49.84,82.79,50.06],
  ["semey","Семей",80.07,50.30,80.43,50.52],["kostanay","Костанай",63.44,53.10,63.80,53.32],
  ["kyzylorda","Кызылорда",65.34,44.74,65.70,44.96],["atyrau","Атырау",51.72,47.01,52.12,47.23],
  ["aktau","Актау",50.98,43.53,51.34,43.77],["oral","Уральск",51.18,51.12,51.56,51.34],
  ["petropavl","Петропавл",68.98,54.76,69.32,54.98],["kokshetau","Кокшетау",69.22,53.17,69.56,53.39],
  ["turkistan","Туркестан",68.10,43.20,68.40,43.40],["taldykorgan","Талдыкорган",78.20,44.91,78.54,45.13],
  ["konaev","Қонаев",76.91,43.77,77.21,43.98],["zhezkazgan","Жезказган",67.55,47.69,67.87,47.91],
].map(([id,name,west,south,east,north]) => ({ id,name,bbox:[west,south,east,north] }));

const endpoints = ["https://overpass-api.de/api/interpreter","https://overpass.kumi.systems/api/interpreter"];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchCity(city) {
  const [west,south,east,north] = city.bbox;
  const bbox = `${south},${west},${north},${east}`;
  const query = `[out:json][timeout:120];(way["highway"](${bbox});way["building"](${bbox}););out tags geom;`;
  let lastError = new Error("No Overpass endpoint succeeded");

  for (const endpoint of endpoints) {
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      try {
        const response = await fetch(endpoint, {
          method:"POST", headers:{"content-type":"application/x-www-form-urlencoded"},
          body:new URLSearchParams({data:query}), signal:AbortSignal.timeout(150000),
        });
        if (response.status === 429) { await sleep(60000 * attempt); continue; }
        if (!response.ok) throw new Error(`${endpoint} returned ${response.status}`);
        const data = await response.json();
        const roads=[]; const buildings=[];

        for (const element of data.elements ?? []) {
          const points=(element.geometry ?? []).map((p)=>[p.lon,p.lat]);
          const tags=element.tags ?? {};
          if (tags.highway && points.length>=2) roads.push({
            type:"Feature", properties:{id:element.id,name:tags.name ?? tags["name:ru"] ?? tags["name:kk"] ?? null,
            highway:tags.highway,ref:tags.ref ?? null,lanes:tags.lanes ?? null,maxspeed:tags.maxspeed ?? null,oneway:tags.oneway ?? null},
            geometry:{type:"LineString",coordinates:points},
          });
          if (tags.building && points.length>=4) {
            const last=points.at(-1); const closed=points[0][0]===last?.[0] && points[0][1]===last?.[1];
            if (!closed) points.push(points[0]);
            buildings.push({type:"Feature",properties:{id:element.id,name:tags.name ?? tags["name:ru"] ?? tags["name:kk"] ?? null,
              building:tags.building,levels:tags["building:levels"] ?? null},
              geometry:{type:"Polygon",coordinates:[points]}});
          }
        }
        return {city:city.id,name:city.name,source:"OpenStreetMap via scheduled BASGO ingestion",
          attribution:"© OpenStreetMap contributors",dataVersion:new Date().toISOString().slice(0,10),
          fetchedAt:new Date().toISOString(),roads:{type:"FeatureCollection",features:roads},
          buildings:{type:"FeatureCollection",features:buildings},counts:{roads:roads.length,buildings:buildings.length}};
      } catch(error) {
        lastError=error instanceof Error ? error : new Error(String(error));
        await sleep(5000 * attempt);
      }
    }
  }
  throw lastError;
}

await mkdir("public/basgo-gid/city-data",{recursive:true});
for (const city of cities) {
  console.log(`Ingesting ${city.name} (${city.id})...`);
  try {
    const pack=await fetchCity(city);
    const output = `public/basgo-gid/city-data/${city.id}.json.gz`;
    await rm(`public/basgo-gid/city-data/${city.id}.json`, { force: true });
    await writeFile(output, gzipSync(JSON.stringify(pack), { level: 9 }));
    console.log(`OK ${city.id}: ${pack.counts.roads} roads, ${pack.counts.buildings} buildings`);
  } catch(error) { console.error(`FAILED ${city.id}:`,error); process.exitCode=1; }
  await sleep(15000);
}
