"use client";

import "./basgo.css";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Bike, Check, ChevronLeft, FileCheck2, Headphones, ShieldCheck, UserRound, WalletCards, MapPin, PackageCheck, Navigation, Radio } from "lucide-react";
import { sendDriverLocationFromBrowser, subscribeToOrderTracking, type TrackingPoint } from "../../lib/basgo-tracking";
import BasgoLiveMap from "./BasgoLiveMap";
import BasgoOrderFlow from "./BasgoOrderFlow";
import BasgoCourierPanel from "./BasgoCourierPanel";

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
  const [trackingToken, setTrackingToken] = useState<string | null>(null);
  const [activeRideId, setActiveRideId] = useState<string | null>(null);
  const [driverGpsEnabled, setDriverGpsEnabled] = useState(false);
  const [driverGpsText, setDriverGpsText] = useState("GPS исполнителя выключен");
  const [driverGpsError, setDriverGpsError] = useState("");
  const [driverRideId, setDriverRideId] = useState<string | null>(null);
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [vehicleFile, setVehicleFile] = useState<File | null>(null);
  const identityRef = useRef<HTMLInputElement | null>(null);
  const selfieRef = useRef<HTMLInputElement | null>(null);
  const vehicleRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("tracking");
    if (token) setTrackingToken(token);
  }, []);

  useEffect(() => {
    if (!trackingToken) return;
    setTrackingConnected(true);
    return subscribeToOrderTracking(trackingToken, setLivePoint);
  }, [trackingToken]);

  const allAccepted = accepted.every(Boolean);

  useEffect(() => {
    const ride = new URLSearchParams(window.location.search).get("ride");
    if (ride) setDriverRideId(ride);
  }, []);

  useEffect(() => {
    setDriverRideId(activeRideId);
  }, [activeRideId]);

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
            <button type="button" className="basgo-icon" onClick={() => setStep(step === "legal" ? "welcome" : step === "role" ? "legal" : "role")} aria-label="Назад">
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
            <button type="button" className="basgo-primary" onClick={() => setStep("legal")}>Продолжить <ArrowRight size={18} /></button>
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
                <button type="button" key={item.title} className={"basgo-legal " + (accepted[i] ? "checked" : "")} onClick={() => toggle(i)}>
                  <div className="basgo-check">{accepted[i] ? <Check size={16} /> : null}</div>
                  <div><b>{item.title}</b><span>{item.text}</span></div>
                </button>
              ))}
            </div>
            <label className="basgo-master"><input type="checkbox" checked={allAccepted} onChange={(e) => setAccepted(legalItems.map(() => e.target.checked))} /><span>Я ознакомился с документами и согласен с применимыми условиями.</span></label>
            <button type="button" className="basgo-primary" disabled={!allAccepted} onClick={() => setStep("role")}>Продолжить <ArrowRight size={18} /></button>
            <small className="basgo-note"><FileCheck2 size={14} /> Версия и время каждого согласия будут фиксироваться в системе.</small>
          </div>
        )}

        {step === "role" && (
          <div className="basgo-content role">
            <div className="basgo-kicker">КАК ВЫ БУДЕТЕ ИСПОЛЬЗОВАТЬ BASGO?</div>
            <h2>Выберите роль</h2>
            <p className="basgo-muted">Роль можно будет изменить через обращение в поддержку по правилам сервиса.</p>
            <button type="button" className="basgo-role-card" onClick={() => setStep("client")}><div className="role-icon client"><UserRound /></div><div><b>Я заказчик</b><span>Создаю поручения и отслеживаю выполнение.</span></div><ArrowRight /></button>
            <button type="button" className="basgo-role-card" onClick={() => setStep("courier")}><div className="role-icon courier"><Bike /></div><div><b>Я исполнитель</b><span>Прохожу проверку и выполняю заказы.</span></div><ArrowRight /></button>
          </div>
        )}

        {step === "client" && (
          <div className="basgo-content">
            <div className="basgo-kicker">BASGO CLIENT</div>
            <h2>Чем помочь?</h2>
            <BasgoOrderFlow onTrackingToken={(token) => { setTrackingToken(token); setLivePoint(null); }} />
            <div className="basgo-map"><div className="basgo-map-head"><div><b>Карта заказа</b><span>Маршрут и точки в одном экране</span></div><MapPin size={20} /></div><BasgoLiveMap livePoint={livePoint} clientPoint={clientPoint} provider={mapProvider} /><div className="basgo-map-switch"><button type="button" className={mapProvider==="yandex" ? "active" : ""} onClick={()=>setMapProvider("yandex")}>Яндекс</button><button type="button" className={mapProvider==="2gis" ? "active" : ""} onClick={()=>setMapProvider("2gis")}>2ГИС</button><button type="button" className={mapProvider==="other" ? "active" : ""} onClick={()=>setMapProvider("other")}>Другие</button></div><small className="basgo-map-caption">Провайдер карты: {mapProvider==="yandex" ? "Яндекс Карты" : mapProvider==="2gis" ? "2ГИС" : "другой подключённый сервис"}{trackingConnected ? " • live-канал подключён" : ""}</small></div><div className="basgo-track-card"><div className="basgo-track-head"><div><b>Живой статус</b><span>Заказ № BASGO-0001</span></div><span className="basgo-live-badge"><i/> LIVE</span></div><div className="basgo-track-line"><div className="basgo-track-node active"><strong>Исполнитель в пути</strong><small>Клиент видит движение на карте</small></div><div className="basgo-track-node"><strong>Прибытие</strong><small>GPS обновляется автоматически</small></div></div><button type="button" className="basgo-track-toggle" onClick={() => setTrackingMode(trackingMode === "order" ? "client" : "order")}><Radio size={15}/> {trackingMode === "order" ? "GPS заказа" : "Мой GPS"}</button></div><div className="basgo-trust"><ShieldCheck /><div><b>Каждая передача фиксируется</b><span>Код, время, статус и история заказа.</span></div></div>
            <div className="basgo-bottom-stat"><WalletCards /> Оплата: наличные или безналичные способы, доступные в сервисе</div>
          </div>
        )}

        {step === "courier" && (
          <div className="basgo-content">
            <div className="basgo-kicker">BASGO COURIER</div>
            <h2>Проверка исполнителя</h2>
            <p className="basgo-muted">До доступа к заказам — идентификация, документы и обязательные проверки.</p>
            <div className="basgo-verify"><input ref={identityRef} className="basgo-file-input" type="file" accept="image/*,.pdf" onChange={(e)=>setIdentityFile(e.target.files?.[0]||null)} /><input ref={selfieRef} className="basgo-file-input" type="file" accept="image/*" capture="user" onChange={(e)=>setSelfieFile(e.target.files?.[0]||null)} /><input ref={vehicleRef} className="basgo-file-input" type="file" accept="image/*,.pdf" onChange={(e)=>setVehicleFile(e.target.files?.[0]||null)} /><button type="button" className={"verify-line verify-action "+(identityFile?"done":"")} onClick={()=>identityRef.current?.click()}><span>01</span><b>{identityFile ? "Удостоверение загружено" : "Загрузить удостоверение личности"}</b><em>{identityFile ? identityFile.name : "нажмите для выбора"}</em></button><button type="button" className={"verify-line verify-action verify-action-selfie "+(selfieFile?"done":"")} onClick={()=>selfieRef.current?.click()}><span>02</span><b>{selfieFile ? "Селфи загружено" : "Сделать селфи-проверку"}</b><em>{selfieFile ? selfieFile.name : "откроется камера"}</em></button><button type="button" className={"verify-line verify-action "+(vehicleFile?"done":"")} onClick={()=>vehicleRef.current?.click()}><span>03</span><b>{vehicleFile ? "Техпаспорт загружен" : "Загрузить техпаспорт"}</b><em>{vehicleFile ? vehicleFile.name : "если используется авто"}</em></button></div><button type="button" className="basgo-primary" disabled={!identityFile || !selfieFile} onClick={()=>setDriverGpsText("Документы и селфи приняты на проверку")}>Отправить на проверку <ShieldCheck size={18}/></button>
            <div className="basgo-security"><ShieldCheck size={22} /><div><b>Контроль доступа</b><span>Заказы и GPS открываются только после входа и назначения заказа.</span></div></div>
            <BasgoCourierPanel onActiveRide={(rideId) => setActiveRideId(rideId)} />
            <div className={"basgo-gps " + (driverGpsEnabled ? "active" : "")}><div className={"basgo-gps-dot " + (driverGpsEnabled ? "on" : "")}/><div><b>GPS исполнителя</b><span>{driverRideId ? driverGpsText : "Сначала войдите и примите активное поручение"}</span>{driverGpsError ? <small>{driverGpsError}</small> : <small>{driverRideId ? "Координаты передаются только для активного заказа" : "GPS не передаётся"}</small>}</div></div>
          </div>
        )}
      </section>
    </main>
  );
}
