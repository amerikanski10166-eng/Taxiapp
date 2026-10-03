"use client";

import { useEffect, useRef, useState } from "react";
import type { TrackingPoint } from "../../lib/basgo-tracking";

declare global {
  interface Window {
    ymaps?: any;
    mapgl?: any;
    L?: any;
  }
}

type Props = {
  livePoint: TrackingPoint | null;
  clientPoint: TrackingPoint | null;
  provider: "yandex" | "2gis" | "other";
};

const FALLBACK_CENTER: [number, number] = [71.4491, 51.1694];

function loadScript(src: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-basgo-map="${id}"]`);
    if (existing) {
      if (id === "yandex" && window.ymaps) return resolve();
      if (id === "2gis" && window.mapgl) return resolve();
      if (id === "leaflet" && window.L) return resolve();
      const wait = () => {
        if ((id === "yandex" && window.ymaps) || (id === "2gis" && window.mapgl) || (id === "leaflet" && window.L)) resolve();
        else setTimeout(wait, 100);
      };
      wait();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.basgoMap = id;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Не удалось загрузить ${id}`));
    document.head.appendChild(script);
  });
}

function loadYandexMaps() {
  const key = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
  if (!key) return Promise.reject(new Error("Не задан NEXT_PUBLIC_YANDEX_MAPS_API_KEY"));
  return loadScript(`https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(key)}&lang=ru_RU`, "yandex")
    .then(() => new Promise<any>((resolve) => window.ymaps!.ready(() => resolve(window.ymaps))));
}

function load2GIS() {
  const key = process.env.NEXT_PUBLIC_2GIS_MAPS_API_KEY;
  if (!key) return Promise.reject(new Error("Не задан NEXT_PUBLIC_2GIS_MAPS_API_KEY"));
  return loadScript("https://mapgl.2gis.com/api/js/v1", "2gis").then(() => window.mapgl);
}

async function loadLeaflet() {
  if (!window.L) {
    await loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js", "leaflet");
  }
  if (!document.querySelector('link[data-basgo-leaflet="true"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.dataset.basgoLeaflet = "true";
    document.head.appendChild(link);
  }
  return window.L;
}

export default function BasgoLiveMap({ livePoint, clientPoint, provider }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const clientMarkerRef = useRef<any>(null);
  const effectiveProviderRef = useRef<"yandex" | "2gis" | "other">("other");
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    const initial = livePoint ?? clientPoint;
    const center = initial ? [initial.longitude, initial.latitude] : FALLBACK_CENTER;

    const init = async () => {
      try {
        setMapError(null);
        const effectiveProvider = provider === "yandex" && process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ? "yandex" : provider === "2gis" && process.env.NEXT_PUBLIC_2GIS_MAPS_API_KEY ? "2gis" : "other";
        effectiveProviderRef.current = effectiveProvider;
        if (effectiveProvider !== provider) setMapError(provider === "yandex" ? "Ключ Яндекс Карт не подключён. Временно показана OpenStreetMap." : provider === "2gis" ? "Ключ 2ГИС не подключён. Временно показана OpenStreetMap." : null);
        if (effectiveProvider === "yandex") {
          const ymaps = await loadYandexMaps();
          if (cancelled || !containerRef.current) return;
          mapRef.current = new ymaps.Map(containerRef.current, { center, zoom: initial ? 15 : 11 }, {
            suppressMapOpenBlock: true,
          });
          addYandexMarkers(ymaps, mapRef.current, livePoint, clientPoint, markerRef, clientMarkerRef);
        } else if (effectiveProvider === "2gis") {
          const mapgl = await load2GIS();
          if (cancelled || !containerRef.current) return;
          mapRef.current = new mapgl.Map(containerRef.current, {
            center,
            zoom: initial ? 15 : 11,
            key: process.env.NEXT_PUBLIC_2GIS_MAPS_API_KEY,
          });
          add2GISMarkers(mapgl, mapRef.current, livePoint, clientPoint, markerRef, clientMarkerRef);
        } else {
          const L = await loadLeaflet();
          if (cancelled || !containerRef.current) return;
          mapRef.current = L.map(containerRef.current).setView([center[1], center[0]], initial ? 15 : 11);
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(mapRef.current);
          addLeafletMarkers(L, mapRef.current, livePoint, clientPoint, markerRef, clientMarkerRef);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("BASGO map", error);
          setMapError(error instanceof Error ? error.message : "Не удалось загрузить карту");
        }
      }
    };

    init();
    return () => {
      cancelled = true;
      if (mapRef.current?.destroy) mapRef.current.destroy();
      if (mapRef.current?.remove) mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
      clientMarkerRef.current = null;
    };
  }, [provider]);

  useEffect(() => {
    if (!mapRef.current || !livePoint) return;
    const coords = [livePoint.longitude, livePoint.latitude];
    if (effectiveProviderRef.current === "yandex") {
      markerRef.current?.geometry?.setCoordinates(coords);
      mapRef.current.setCenter(coords, Math.max(mapRef.current.getZoom(), 14), { duration: 300 });
    } else if (effectiveProviderRef.current === "2gis") {
      markerRef.current?.setCoordinates?.(coords);
      mapRef.current.setCenter(coords, Math.max(mapRef.current.getZoom(), 14));
    } else {
      markerRef.current?.setLatLng?.([livePoint.latitude, livePoint.longitude]);
      mapRef.current.setView([livePoint.latitude, livePoint.longitude], Math.max(mapRef.current.getZoom(), 14), { animate: true });
    }
  }, [livePoint, provider]);

  useEffect(() => {
    if (!mapRef.current || !clientPoint) return;
    const coords = [clientPoint.longitude, clientPoint.latitude];
    if (effectiveProviderRef.current === "yandex") clientMarkerRef.current?.geometry?.setCoordinates(coords);
    else if (effectiveProviderRef.current === "2gis") clientMarkerRef.current?.setCoordinates?.(coords);
    else clientMarkerRef.current?.setLatLng?.([clientPoint.latitude, clientPoint.longitude]);
  }, [clientPoint, provider]);

  const message = provider === "yandex"
    ? "Для Яндекс Карт нужен NEXT_PUBLIC_YANDEX_MAPS_API_KEY."
    : provider === "2gis"
      ? "Для 2ГИС нужен NEXT_PUBLIC_2GIS_MAPS_API_KEY."
      : "OpenStreetMap работает без отдельного ключа.";

  return (
    <div className="basgo-real-map">
      <div ref={containerRef} className="basgo-yandex-map" />
      {mapError && <div className="basgo-map-unavailable"><b>Карта временно недоступна</b><span>{mapError}</span></div>}
      <div className="basgo-map-provider">{provider === "yandex" ? "Яндекс Карты" : provider === "2gis" ? "2ГИС" : "OpenStreetMap"}</div>
      {livePoint && <div className="basgo-map-live-label">● LIVE • исполнитель</div>}
      {((provider === "yandex" && !process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY) || (provider === "2gis" && !process.env.NEXT_PUBLIC_2GIS_MAPS_API_KEY)) && (
        <div className="basgo-map-key-warning">{message}</div>
      )}
    </div>
  );
}

function addYandexMarkers(ymaps: any, map: any, live: TrackingPoint | null, client: TrackingPoint | null, liveRef: any, clientRef: any) {
  if (client) {
    clientRef.current = new ymaps.Placemark([client.longitude, client.latitude], { balloonContent: "Точка клиента" }, { preset: "islands#blueCircleDotIcon" });
    map.geoObjects.add(clientRef.current);
  }
  if (live) {
    liveRef.current = new ymaps.Placemark([live.longitude, live.latitude], { balloonContent: "Исполнитель • LIVE" }, { preset: "islands#redCircleDotIcon" });
    map.geoObjects.add(liveRef.current);
  }
}

function add2GISMarkers(mapgl: any, map: any, live: TrackingPoint | null, client: TrackingPoint | null, liveRef: any, clientRef: any) {
  if (client) clientRef.current = new mapgl.Marker(map, { coordinates: [client.longitude, client.latitude], color: "#2f80ed" });
  if (live) liveRef.current = new mapgl.Marker(map, { coordinates: [live.longitude, live.latitude], color: "#e53935" });
}

function addLeafletMarkers(L: any, map: any, live: TrackingPoint | null, client: TrackingPoint | null, liveRef: any, clientRef: any) {
  if (client) clientRef.current = L.marker([client.latitude, client.longitude]).addTo(map).bindPopup("Точка клиента");
  if (live) liveRef.current = L.marker([live.latitude, live.longitude]).addTo(map).bindPopup("Исполнитель • LIVE");
}
