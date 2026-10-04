"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { ASTANA_BASGO_SEED } from "../../lib/basgo-gid/astana-seed";
import { ASTANA_BASGO_ROADS, ASTANA_BASGO_BUILDINGS } from "../../lib/basgo-gid/astana-map";

type Props = {
  region: string;
  onReady?: () => void;
};

const views: Record<string, { center: [number, number]; zoom: number }> = {
  "Весь Казахстан": { center: [68.8, 48.2], zoom: 4.5 },
  "Астана": { center: [71.43, 51.13], zoom: 11.5 },
  "Алматы": { center: [76.89, 43.24], zoom: 11.5 },
  "Шымкент": { center: [69.59, 42.32], zoom: 11.5 },
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

export default function BasgoMap({ region, onReady }: Props) {
  const container = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

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
      map.addSource("basgo-astana-roads", { type: "geojson", data: roadsGeoJson });
      map.addLayer({
        id: "basgo-astana-roads",
        type: "line",
        source: "basgo-astana-roads",
        minzoom: 9,
        paint: {
          "line-color": ["match", ["get", "className"], "motorway", "#c026d3", "primary", "#f59e0b", "secondary", "#2563eb", "#64748b"],
          "line-width": ["interpolate", ["linear"], ["zoom"], 9, 1.5, 12, 3, 15, 5],
          "line-opacity": 0.92,
        },
      });

      map.addSource("basgo-astana-buildings", { type: "geojson", data: buildingsGeoJson });
      map.addLayer({
        id: "basgo-astana-building-fill",
        type: "fill",
        source: "basgo-astana-buildings",
        minzoom: 12,
        paint: {
          "fill-color": ["match", ["get", "kind"], "landmark", "#f97316", "public", "#0ea5e9", "commercial", "#8b5cf6", "#64748b"],
          "fill-opacity": 0.48,
        },
      });
      map.addLayer({
        id: "basgo-astana-building-outline",
        type: "line",
        source: "basgo-astana-buildings",
        minzoom: 12,
        paint: { "line-color": "#334155", "line-width": 1, "line-opacity": 0.72 },
      });

      map.addSource("basgo-astana-seed", { type: "geojson", data: seedGeoJson });
      map.addLayer({
        id: "basgo-seed-points",
        type: "circle",
        source: "basgo-astana-seed",
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
        source: "basgo-astana-seed",
        minzoom: 11,
        layout: {
          "text-field": ["get", "name"],
          "text-size": 11,
          "text-offset": [0, 1.3],
          "text-anchor": "top",
        },
        paint: { "text-color": "#0f172a", "text-halo-color": "#ffffff", "text-halo-width": 1.5 },
      });

      onReadyRef.current?.();
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const next = views[region] ?? views["Весь Казахстан"];
    map.flyTo({ center: next.center, zoom: next.zoom, duration: 900, essential: true });
  }, [region]);

  return <div ref={container} className="basgoMapCanvas" aria-label="Карта BASGO GID" />;
}
