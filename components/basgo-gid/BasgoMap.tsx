"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type Map as MapLibreMap, type Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { ASTANA_BASGO_SEED } from "../../lib/basgo-gid/astana-seed";

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

export default function BasgoMap({ region, onReady }: Props) {
  const container = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);

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
        layers: [
          {
            id: "basgo-base",
            type: "raster",
            source: "basgo",
            paint: { "raster-opacity": 0.92 },
          },
        ],
      },
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "bottom-right");
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-left",
    );

    map.on("load", () => {
      onReady?.();
    });

    mapRef.current = map;

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [onReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const next = views[region] ?? views["Весь Казахстан"];
    map.flyTo({
      center: next.center,
      zoom: next.zoom,
      duration: 900,
      essential: true,
    });
  }, [region]);

  return <div ref={container} className="basgoMapCanvas" aria-label="Карта BASGO GID" />;
}
