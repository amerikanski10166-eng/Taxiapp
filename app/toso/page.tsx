"use client";

import "./basgo.css";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bike, Check, ChevronLeft, FileCheck2, Headphones, ShieldCheck, UserRound, WalletCards, MapPin, PackageCheck, Navigation, Radio } from "lucide-react";
import { sendDriverLocationFromBrowser, subscribeToOrderTracking, type TrackingPoint } from "../../lib/basgo-tracking";
import BasgoLiveMap from "./BasgoLiveMap";

const legalItems = [
  { title: "Пользовательское соглашение", text: "Правила использования платформы BASGO." },
  { title: "Политика конфиденциальности", text: "Как мы обрабатываем и защищаем персональные данные." },
  { title: "Согласие на обработку данных", text: "Отдельное подтверждение обработки данных, необходимых для работы сервиса." },
  { title: "Правила безопасности", text: "Правила передачи, получения, возврата и спорных ситуаций." },
];

export default function BasgoPrototype() {
  const [step, setStep] = useState<"welcome" | "legal" | "role" | "client" | "courier">("welcome");
  const [accepted, setAccepted] = useState<boolean[]>([false, false, false, false]);
  const [mapProvider, setMapProvider] = useState<"yandex" | "2gis" | "other">("yandex");
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [gpsText, setGpsText] = useState("GPS ожидает разрешение");
  const [trackingMode, setTrackingMode] = useState<"client" | "order">("order");
  const [livePoint, setLivePoint] = useState<TrackingPoint | null>(null);
  const [clientPoint, setClientPoint] = useState<TrackingPoint | null>(null);
  const [trackingConnected, setTrackingConnected] = useState(false);
  const [driverGpsEnabled, setDriverGpsEnabled] = useState(false);
  const [driverGpsText, setDriverGpsText] = useState("GPS исполнителя выключен");
  const [driverGpsError, setDriverGpsError] = useState("");
  const [driverRideId, setDriverRideId] = useState<string | null>(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("tracking");
    if (!token) return;
    setTrackingConnected(true);
    return subscribeToOrderTracking(token, setLivePoint);
  }, []);

  const allAccepted = accepted.every(Boolean);

  useEffect(() => {
    const ride = new URLSearchParams(window.location.search).get("ride");
    setDriverRideId(ride);
  }, []);

  useEffect(() => {
    if (step !== "courier" || !driverRideId || !navigator.geolocation) return;
    let lastSentAt = 0;
    const id = navigator.geolocation.watchPosition(
      async p => {
        setDriverGpsEnabled(true);
        setDriverGpsError("");
        setDriverGpsText(`GPS: ${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`);
        const now = Date.now();
        if (now - lastSentAt < 4000) return;
        lastSentAt = now;
        try {
          await sendDriverLocationFromBrowser(driverRideId, {
            latitude: p.coords.latitude,
            longitude: p.coords.longitude,
            accuracy_meters: p.coords.accuracy,
            heading_degrees: p.coords.heading,
            speed_mps: p.coords.speed,
          });
        } catch (error) {
          setDriverGpsError(error instanceof Error ? error.message : "GPS не отправлен");
        }
      },
      error => {
        setDriverGpsEnabled(false);
        setDriverGpsError(error.message || "Разрешите геолокацию");
        setDriverGpsText("Разрешение GPS не получено");
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [step, driverRideId]);

  const mapMarkerStyle = useMemo(() => {
    const point = trackingMode === "order" ? livePoint : clientPoint;
    if (!point) return undefined;
    const center = clientPoint ?? point;
    const left = Math.max(8, Math.min(92, 50 + (point.longitude - center.longitude) * 9000));
    const top = Math.max(10, Math.min(90, 50 - (point.latitude - center.latitude) * 9000));
    return { left: `${left}%`, top: `${top}%` };
  }, [trackingMode, livePoint, clientPoint]);
  useEffect(() => {
    if (step !== "client" || !navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      p => { setGpsEnabled(true); setGpsText(`GPS: ${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`); setClientPoint({ ride_id: "local", latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy_meters: p.coords.accuracy }); },
      () => { setGpsEnabled(false); setGpsText("Разрешите геолокацию для отслеживания заказа"); },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [step]);
  const toggle = (i: number) => setAccepted((x) => x.map((v, n) => (n === i ? !v : v)));

  return (
    <main className="basgo-shell">
      <section className="basgo-phone">
        <div className="basgo-glow" />
        <header className="basgo-header">
          {step !== "welcome" && (
            <button className="basgo-icon" onClick={() => setStep(step === "legal" ? "welcome" : step === "role" ? "legal" : "role")} aria-label="Назад">
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="basgo-logo">BAS<span>GO</span></div>
          <div className="basgo-status"><span /> защищено</div>
        </header>

        {step === "welcome" && (
          <div className="basgo-hero">
            <div className="basgo-orb"><PackageCheck size={54} strokeWidth={1.6} /></div>
            <div className="basgo-kicker">ГОРОДСКИЕ ПОРУЧЕНИЯ</div>
            <h1>Нужно сейчас?<br /><strong>BASGO решит.</strong></h1>
            <p>Доставка, получение, возврат и срочные поручения — с контролем каждого шага.</p>
            <div className="basgo-pills"><span><ShieldCheck size={15} /> Проверенные исполнители</span><span><Headphones size={15} /> Поддержка</span></div>
            <button className="basgo-primary" onClick={() => setStep("legal")}>Продолжить <ArrowRight size={18} /></button>
            <small>Сначала ознакомимся с правилами сервиса.</small>
          </div>
        )}

        {step === "legal" && (
          <div className="basgo-content">
            <div className="basgo-kicker">ПЕРЕД НАЧАЛОМ</div>
            <h2>Сначала — правила.</h2>
            <p className="basgo-muted">Мы показываем ключевые документы до входа в систему. Полные версии доступны по каждому пункту.</p>
            <div className="basgo-legal-list">
              {legalItems.map((item, i) => (
                <button key={item.title} className={"basgo-legal " + (accepted[i] ? "checked" : "")} onClick={() => toggle(i)}>
                  <div className="basgo-check">{accepted[i] ? <Check size={16} /> : null}</div>
                  <div><b>{item.title}</b><span>{item.text}</span></div>
                </button>
              ))}
            </div>
            <label className="basgo-master"><input type="checkbox" checked={allAccepted} onChange={(e) => setAccepted(legalItems.map(() => e.target.checked))} /><span>Я ознакомился с документами и согласен с применимыми условиями.</span></label>
            <button className="basgo-primary" disabled={!allAccepted} onClick={() => setStep("role")}>Продолжить <ArrowRight size={18} /></button>
            <small className="basgo-note"><FileCheck2 size={14} /> Версия и время каждого согласия будут фиксироваться в системе.</small>
          </div>
        )}

        {step === "role" && (
          <div className="basgo-content role">
            <div className="basgo-kicker">КАК ВЫ БУДЕТЕ ИСПОЛЬЗОВАТЬ BASGO?</div>
            <h2>Выберите роль</h2>
            <p className="basgo-muted">Роль можно будет изменить через обращение в поддержку по правилам сервиса.</p>
            <button className="basgo-role-card" onClick={() => setStep("client")}><div className="role-icon client"><UserRound /></div><div><b>Я заказчик</b><span>Создаю поручения и отслеживаю выполнение.</span></div><ArrowRight /></button>
            <button className="basgo-role-card" onClick={() => setStep("courier")}><div className="role-icon courier"><Bike /></div><div><b>Я исполнитель</b><span>Прохожу проверку и выполняю заказы.</span></div><ArrowRight /></button>
          </div>
        )}

        {step === "client" && (
          <div className="basgo-content">
            <div className="basgo-kicker">BASGO CLIENT</div>
            <h2>Чем помочь?</h2>
            <div className="basgo-task"><span>⚡</span><div><b>Срочное поручение</b><small>Опишите задачу своими словами</small></div><ArrowRight /></div>
            <div className="basgo-task"><span>📦</span><div><b>Доставка</b><small>Забрать и передать отправление</small></div><ArrowRight /></div>
            <div className="basgo-task"><span>🔄</span><div><b>Возврат</b><small>Вернуть товар отправителю</small></div><ArrowRight /></div>
            <div className="basgo-map"><div className="basgo-map-head"><div><b>Карта заказа</b><span>Маршрут и точки в одном экране</span></div><MapPin size={20} /></div><BasgoLiveMap livePoint={livePoint} clientPoint={clientPoint} provider={mapProvider} /><div className="basgo-map-switch"><button className={mapProvider==="yandex" ? "active" : ""} onClick={()=>setMapProvider("yandex")}>Яндекс</button><button className={mapProvider==="2gis" ? "active" : ""} onClick={()=>setMapProvider("2gis")}>2ГИС</button><button className={mapProvider==="other" ? "active" : ""} onClick={()=>setMapProvider("other")}>Другие</button></div><small className="basgo-map-caption">Провайдер карты: {mapProvider==="yandex" ? "Яндекс Карты" : mapProvider==="2gis" ? "2ГИС" : "другой подключённый сервис"}{trackingConnected ? " • live-канал подключён" : ""}</small></div><div className="basgo-track-card"><div className="basgo-track-head"><div><b>Живой статус</b><span>Заказ № BASGO-0001</span></div><span className="basgo-live-badge"><i/> LIVE</span></div><div className="basgo-track-line"><div className="basgo-track-node active"><strong>Исполнитель в пути</strong><small>Клиент видит движение на карте</small></div><div className="basgo-track-node"><strong>Прибытие</strong><small>GPS обновляется автоматически</small></div></div><button className="basgo-track-toggle" onClick={() => setTrackingMode(trackingMode === "order" ? "client" : "order")}><Radio size={15}/> {trackingMode === "order" ? "GPS заказа" : "Мой GPS"}</button></div><div className="basgo-trust"><ShieldCheck /><div><b>Каждая передача фиксируется</b><span>Код, время, статус и история заказа.</span></div></div>
            <div className="basgo-bottom-stat"><WalletCards /> Оплата: наличные или безналичные способы, доступные в сервисе</div>
          </div>
        )}

        {step === "courier" && (
          <div className="basgo-content">
            <div className="basgo-kicker">BASGO COURIER</div>
            <h2>Проверка исполнителя</h2>
            <p className="basgo-muted">До доступа к заказам — идентификация, документы и обязательные проверки.</p>
            <div className="basgo-verify"><div className="verify-line"><span>01</span><b>Удостоверение личности</b><em>обязательно</em></div><div className="verify-line"><span>02</span><b>Селфи-проверка</b><em>обязательно</em></div><div className="verify-line"><span>03</span><b>Транспорт и техпаспорт</b><em>если используется авто</em></div></div>
            <div className="basgo-security"><ShieldCheck size={22} /><div><b>Контроль доступа</b><span>Без завершения проверки заказы не открываются.</span></div></div>
            <div className={"basgo-gps " + (driverGpsEnabled ? "active" : "")}><div className={"basgo-gps-dot " + (driverGpsEnabled ? "on" : "")}/><div><b>GPS исполнителя</b><span>{driverRideId ? driverGpsText : "Откройте активный заказ с параметром ride"}</span>{driverGpsError ? <small>{driverGpsError}</small> : <small>{driverRideId ? "Координаты передаются только для активного заказа" : "GPS не передаётся"}</small>}</div></div>
            <button className="basgo-primary" onClick={() => setStep("role")}>Начать регистрацию <ArrowRight size={18} /></button>
          </div>
        )}
      </section>
    </main>
  );
}
