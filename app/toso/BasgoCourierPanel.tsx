"use client";

import { useEffect, useState } from "react";

type Props = { onActiveRide?: (rideId: string | null) => void };

export default function BasgoCourierPanel({ onActiveRide }: Props) {
  const [driver, setDriver] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [requests, setRequests] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState<any>(null);

  const load = async () => {
    const me = await fetch("/api/auth/me").then(r=>r.json()).catch(()=>({}));
    if (me.driver) {
      setDriver(me.driver);
      const r = await fetch("/api/basgo/courier/requests");
      const d = await r.json();
      if (r.ok) setRequests(Array.isArray(d.requests) ? d.requests : []);
    }
  };

  useEffect(() => { load(); }, []);

  const login = async () => {
    setError(""); setBusy(true);
    try {
      const r = await fetch("/api/auth/login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({phone,password}) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Не удалось войти");
      setDriver(d.driver);
      const rr = await fetch("/api/basgo/courier/requests");
      const rd = await rr.json();
      setRequests(Array.isArray(rd.requests) ? rd.requests : []);
    } catch(e) { setError(e instanceof Error ? e.message : "Ошибка входа"); }
    finally { setBusy(false); }
  };

  const accept = async (rideId: string, price: number) => {
    setError(""); setBusy(true);
    try {
      const r = await fetch("/api/basgo/courier/accept", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({rideId,agreedPrice:price}) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Не удалось принять заказ");
      setActive(d.order);
      onActiveRide?.(rideId);
      await load();
    } catch(e) { setError(e instanceof Error ? e.message : "Ошибка"); }
    finally { setBusy(false); }
  };

  if (!driver) return <div className="basgo-courier-login">
    <div className="basgo-courier-login-head"><b>Вход исполнителя</b><span>После входа BASGO откроет доступ к заказам.</span></div>
    <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Телефон" />
    <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Пароль" />
    {error && <div className="basgo-order-error">{error}</div>}
    <button className="basgo-primary" disabled={busy} onClick={login}>{busy ? "Входим…" : "Войти как исполнитель"}</button>
  </div>;

  return <div className="basgo-courier-panel">
    <div className="basgo-courier-user"><div><b>{driver.name}</b><span>{driver.car || "Исполнитель"}{driver.plate ? " · "+driver.plate : ""}</span></div><em>онлайн</em></div>
    {active ? <div className="basgo-active-order"><b>Активный заказ</b><span>{active.id}</span><small>{active.status} · GPS можно передавать только для этого заказа</small><button className="basgo-secondary" onClick={()=>{setActive(null);onActiveRide?.(null);}}>Завершить режим GPS</button></div> : null}
    <div className="basgo-courier-list"><b>Доступные поручения</b>
      {requests.filter(x=>x.status==="pending").slice(0,8).map(x=><div className="basgo-courier-request" key={x.id}><div><strong>{x.message || "Поручение BASGO"}</strong><span>{x.pickup || "Точка забора"} → {x.destination}</span><small>{Number(x.offer_price||0).toLocaleString("ru-RU")} ₸ · {x.payment_method}</small></div><button onClick={()=>accept(x.id,Number(x.offer_price||0))} disabled={busy}>Принять</button></div>)}
      {!requests.some(x=>x.status==="pending") && <span className="basgo-muted">Новых поручений пока нет.</span>}
    </div>
    {error && <div className="basgo-order-error">{error}</div>}
  </div>;
}