"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { ASTANA_BASGO_SEED } from "../../lib/basgo-gid/astana-seed";
import { ASTANA_BASGO_ROADS, ASTANA_BASGO_BUILDINGS } from "../../lib/basgo-gid/astana-map";
import { BASGO_NATIONAL_SCOPE } from "../../lib/basgo-gid/national-map";
import { getBasgoCityPackage } from "../../lib/basgo-gid/city-packages";

type Props = { region: string; onReady?: () => void };

const views: Record<string, { center: [number, number]; zoom: number }> = {
  "Весь Казахстан": { center: [68.8, 48.2], zoom: 4.5 },
  "Астана": { center: [71.43, 51.13], zoom: 11.5 },
  "Алматы": { center: [76.89, 43.24], zoom: 11.5 },
  "Шымкент": { center: [69.59, 42.32], zoom: 11.5 },
  "Карагандинская область": { center: [73.10, 49.80], zoom: 11.5 },
  "Актюбинская область": { center: [57.17, 50.28], zoom: 11.5 },
  "Жамбылская область": { center: [71.37, 42.90], zoom: 11.5 },
  "Павлодарская область": { center: [76.95, 52.29], zoom: 11.5 },
  "Восточно-Казахстанская область": { center: [82.61, 49.95], zoom: 11.5 },
  "Абайская область": { center: [80.25, 50.41], zoom: 11.5 },
  "Костанайская область": { center: [63.62, 53.21], zoom: 11.5 },
  "Кызылординская область": { center: [65.52, 44.85], zoom: 11.5 },
  "Атырауская область": { center: [51.92, 47.12], zoom: 11.5 },
  "Мангистауская область": { center: [51.16, 43.65], zoom: 11.5 },
  "Западно-Казахстанская область": { center: [51.37, 51.23], zoom: 11.5 },
  "Северо-Казахстанская область": { center: [69.15, 54.87], zoom: 11.5 },
  "Акмолинская область": { center: [69.39, 53.28], zoom: 11.5 },
  "Туркестанская область": { center: [68.25, 43.30], zoom: 11.5 },
  "Жетысуская область": { center: [78.37, 45.02], zoom: 11.5 },
  "Алматинская область": { center: [77.06, 43.87], zoom: 11.5 },
  "Ұлытау облысы": { center: [67.71, 47.80], zoom: 11.5 },
};

const cityByRegion: Record<string, string> = {
  "Астана": "astana", "Алматы": "almaty", "Шымкент": "shymkent",
  "Карагандинская область": "karaganda", "Актюбинская область": "aktobe",
  "Жамбылская область": "taraz", "Павлодарская область": "pavlodar",
  "Восточно-Казахстанская область": "oskemen", "Абайская область": "semey",
  "Костанайская область": "kostanay", "Кызылординская область": "kyzylorda",
  "Атырауская область": "atyrau", "Мангистауская область": "aktau",
  "Западно-Казахстанская область": "oral", "Северо-Казахстанская область": "petropavl",
  "Акмолинская область": "kokshetau", "Туркестанская область": "turkistan",
  "Жетысуская область": "taldykorgan", "Алматинская область": "konaev",
  "Ұлытау облысы": "zhezkazgan",
};

const roadsGeoJson = {
  type: "FeatureCollection",
  features: ASTANA_BASGO_ROADS.map((road) => ({
    type: "Feature",
    properties: { id: road.id, name: road.name, className: road.className },
    geometry: { type: "LineString", coordinates: road.coordinates },
  })),
} as const;

const buildingsGeoJson = {
  type: "FeatureCollection",
  features: ASTANA_BASGO_BUILDINGS.map((building) => ({
    type: "Feature",
    properties: { id: building.id, name: building.name, kind: building.kind },
    geometry: { type: "Polygon", coordinates: [building.polygon] },
  })),
} as const;

const seedGeoJson = {
  type: "FeatureCollection",
  features: ASTANA_BASGO_SEED.map((item) => ({
    type: "Feature",
    properties: { id: item.id, name: item.name, kind: item.kind },
    geometry: { type: "Point", coordinates: item.coordinates },
  })),
} as const;

const emptyGeoJson = { type: "FeatureCollection", features: [] };

export default function BasgoMap({ region, onReady }: Props) {
  const container = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const loadedRef = useRef(false);
  const onReadyRef = useRef(onReady);

  useEffect(() => { onReadyRef.current = onReady; }, [onReady]);

  const loadRealCityData = async (map: MapLibreMap, cityId?: string) => {
    if (!cityId) {
      (map.getSource("basgo-real-roads") as maplibregl.GeoJSONSource | undefined)?.setData(emptyGeoJson as any);
      (map.getSource("basgo-real-buildings") as maplibregl.GeoJSONSource | undefined)?.setData(emptyGeoJson as any);
      return;
    }
    const requestCity = cityId;
    try {
      const response = await fetch(`/api/basgo-gid/real-map?city=${encodeURIComponent(requestCity)}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      if (requestCity !== cityByRegion[region]) return;
      (map.getSource("basgo-real-roads") as maplibregl.GeoJSONSource | undefined)?.setData(data.roads);
      (map.getSource("basgo-real-buildings") as maplibregl.GeoJSONSource | undefined)?.setData(data.buildings);
    } catch {
      // The curated BASGO pilot remains visible if the live source is temporarily unavailable.
    }
  };

  useEffect(() => {
    if (!container.current || mapRef.current) return;
    const initial = views[region] ?? views["Весь Казахстан"];

    const map = new maplibregl.Map({
      container: container.current,
      center: initial.center,
      zoom: initial.zoom,
      minZoom: 3,
      maxZoom: 19,
      attributionControl: false,
      style: {
        version: 8,
        sources: {
          basgo: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            maxzoom: 19,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [{ id: "basgo-base", type: "raster", source: "basgo", paint: { "raster-opacity": 0.86 } }],
      },
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "bottom-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");

    map.on("load", () => {
      map.addSource("basgo-national-roads", { type: "geojson", data: roadsGeoJson as any });
      map.addLayer({
        id: "basgo-national-roads",
        type: "line",
        source: "basgo-national-roads",
        minzoom: 9,
        paint: {
          "line-color": ["match", ["get", "className"], "motorway", "#c026d3", "primary", "#f59e0b", "secondary", "#2563eb", "#64748b"],
          "line-width": ["interpolate", ["linear"], ["zoom"], 9, 1.5, 12, 3, 15, 5],
          "line-opacity": 0.92,
        },
      });

      map.addSource("basgo-national-buildings", { type: "geojson", data: buildingsGeoJson as any });
      map.addLayer({
        id: "basgo-astana-building-fill",
        type: "fill",
        source: "basgo-national-buildings",
        minzoom: 12,
        paint: { "fill-color": ["match", ["get", "kind"], "landmark", "#f97316", "public", "#0ea5e9", "commercial", "#8b5cf6", "#64748b"], "fill-opacity": 0.48 },
      });
      map.addLayer({
        id: "basgo-astana-building-outline",
        type: "line",
        source: "basgo-national-buildings",
        minzoom: 12,
        paint: { "line-color": "#334155", "line-width": 1, "line-opacity": 0.72 },
      });

      map.addSource("basgo-real-roads", { type: "geojson", data: emptyGeoJson as any });
      map.addLayer({
        id: "basgo-real-roads",
        type: "line",
        source: "basgo-real-roads",
        minzoom: 9,
        paint: {
          "line-color": ["match", ["get", "highway"], "motorway", "#be123c", "trunk", "#c2410c", "primary", "#d97706", "secondary", "#2563eb", "tertiary", "#0891b2", "residential", "#475569", "#64748b"],
          "line-width": ["interpolate", ["linear"], ["zoom"], 9, 1.2, 12, 2.6, 15, 4.6],
          "line-opacity": 0.9,
        },
      });

      map.addSource("basgo-real-buildings", { type: "geojson", data: emptyGeoJson as any });
      map.addLayer({
        id: "basgo-real-building-fill",
        type: "fill",
        source: "basgo-real-buildings",
        minzoom: 12,
        paint: { "fill-color": "#64748b", "fill-opacity": 0.25 },
      });
      map.addLayer({
        id: "basgo-real-building-outline",
        type: "line",
        source: "basgo-real-buildings",
        minzoom: 12,
        paint: { "line-color": "#1e293b", "line-width": 0.7, "line-opacity": 0.62 },
      });

      map.addSource("basgo-national-poi", { type: "geojson", data: seedGeoJson as any });
      map.addLayer({
        id: "basgo-seed-points",
        type: "circle",
        source: "basgo-national-poi",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 9, 4, 14, 7],
          "circle-color": ["match", ["get", "kind"], "transport", "#0ea5e9", "service", "#22c55e", "#f97316"],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });
      map.addLayer({
        id: "basgo-seed-labels",
        type: "symbol",
        source: "basgo-national-poi",
        minzoom: 11,
        layout: { "text-field": ["get", "name"], "text-size": 11, "text-offset": [0, 1.3], "text-anchor": "top" },
        paint: { "text-color": "#0f172a", "text-halo-color": "#ffffff", "text-halo-width": 1.5 },
      });

      loadedRef.current = true;
      void loadRealCityData(map, cityByRegion[region]);
      onReadyRef.current?.();
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; loadedRef.current = false; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const next = views[region] ?? views["Весь Казахстан"];
    map.flyTo({ center: next.center, zoom: next.zoom, duration: 900, essential: true });
    if (loadedRef.current) void loadRealCityData(map, cityByRegion[region]);
  }, [region]);

  return <div ref={container} className="basgoMapCanvas" aria-label="Карта BASGO GID" />;
}
