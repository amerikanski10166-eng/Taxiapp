"use client";

import { useEffect, useRef } from "react";
import type { TrackingPoint } from "../../lib/basgo-tracking";

declare global {
  interface Window {
    ymaps?: any;
  }
}

type Props = {
  livePoint: TrackingPoint | null;
  clientPoint: TrackingPoint | null;
  provider: "yandex" | "2gis" | "other";
};

const FALLBACK_CENTER: [number, number] = [71.4491, 51.1694];

function loadYandexMaps() {
  return new Promise<any>((resolve, reject) => {
    if (window.ymaps) {
      window.ymaps.ready(() => resolve(window.ymaps));
      return;
    }

    const key = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
    if (!key) {
      reject(new Error("Не задан NEXT_PUBLIC_YANDEX_MAPS_API_KEY"));
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-basgo-yandex="true"]');
    if (existing) {
      const wait = () => window.ymaps
        ? window.ymaps.ready(() => resolve(window.ymaps))
        : setTimeout(wait, 100);
      wait();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(key)}&lang=ru_RU`;
    script.async = true;
    script.dataset.basgoYandex = "true";
    script.onload = () => window.ymaps
      ? window.ymaps.ready(() => resolve(window.ymaps))
      : reject(new Error("Яндекс Карты не загрузились"));
    script.onerror = () => reject(new Error("Не удалось загрузить Яндекс Карты"));
    document.head.appendChild(script);
  });
}

export default function BasgoLiveMap({ livePoint, clientPoint, provider }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const clientMarkerRef = useRef<any>(null);

  useEffect(() => {
    if (provider !== "yandex" || !containerRef.current) return;

    let cancelled = false;

    loadYandexMaps()
      .then((ymaps) => {
        if (cancelled || !containerRef.current || mapRef.current) return;

        const initial = livePoint ?? clientPoint;
        const center: [number, number] = initial
          ? [initial.longitude, initial.latitude]
          : FALLBACK_CENTER;

        mapRef.current = new ymaps.Map(containerRef.current, {
          center,
          zoom: initial ? 15 : 11,
          controls: ["zoomControl", "geolocationControl"],
        }, {
          suppressMapOpenBlock: true,
        });

        if (clientPoint) {
          clientMarkerRef.current = new ymaps.Placemark(
            [clientPoint.longitude, clientPoint.latitude],
            { balloonContent: "Точка клиента" },
            { preset: "islands#blueCircleDotIcon" }
          );
          mapRef.current.geoObjects.add(clientMarkerRef.current);
        }

        if (livePoint) {
          markerRef.current = new ymaps.Placemark(
            [livePoint.longitude, livePoint.latitude],
            { balloonContent: "Исполнитель • LIVE" },
            { preset: "islands#redCircleDotIcon" }
          );
          mapRef.current.geoObjects.add(markerRef.current);
        }
      })
      .catch(() => {
        // The UI below remains available and explains that the API key is required.
      });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
      markerRef.current = null;
      clientMarkerRef.current = null;
    };
  }, [provider]);

  useEffect(() => {
    if (provider !== "yandex" || !mapRef.current || !livePoint) return;
    const coords = [livePoint.longitude, livePoint.latitude];
    if (!markerRef.current && window.ymaps) {
      markerRef.current = new window.ymaps.Placemark(
        coords,
        { balloonContent: "Исполнитель • LIVE" },
        { preset: "islands#redCircleDotIcon" }
      );
      mapRef.current.geoObjects.add(markerRef.current);
    } else {
      markerRef.current?.geometry?.setCoordinates(coords);
    }
    mapRef.current.setCenter(coords, Math.max(mapRef.current.getZoom(), 14), { duration: 300 });
  }, [livePoint, provider]);

  useEffect(() => {
    if (provider !== "yandex" || !mapRef.current || !clientPoint || !window.ymaps) return;
    const coords = [clientPoint.longitude, clientPoint.latitude];
    if (!clientMarkerRef.current) {
      clientMarkerRef.current = new window.ymaps.Placemark(
        coords,
        { balloonContent: "Точка клиента" },
        { preset: "islands#blueCircleDotIcon" }
      );
      mapRef.current.geoObjects.add(clientMarkerRef.current);
    } else {
      clientMarkerRef.current.geometry.setCoordinates(coords);
    }
  }, [clientPoint, provider]);

  if (provider !== "yandex") {
    return (
      <div className="basgo-real-map basgo-map-unavailable">
        <div>
          <b>{provider === "2gis" ? "2ГИС" : "Другой провайдер"}</b>
          <span>Этот провайдер подключим отдельным ключом. Сейчас выбран реальный режим Яндекс Карт.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="basgo-real-map">
      <div ref={containerRef} className="basgo-yandex-map" />
      {!process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY && (
        <div className="basgo-map-key-warning">
          Добавьте NEXT_PUBLIC_YANDEX_MAPS_API_KEY в переменные Vercel.
        </div>
      )}
      {livePoint && <div className="basgo-map-live-label">● LIVE • исполнитель</div>}
    </div>
  );
}
