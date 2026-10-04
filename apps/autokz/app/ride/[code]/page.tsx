// @ts-nocheck
"use client";

import { useEffect, useState } from "react";

type Driver = { id:string; name:string; car:string|null; plate:string|null; public_code:string };
type RideRequest = { id:string; status:string; offer_price:number; payment_method:string; created_at:string };

export default function PassengerRidePage({ params }: { params: Promise<{ code:string }> }) {
  const [code,setCode]=useState("");
  const [driver,setDriver]=useState<Driver|null>(null);
  const [pickup,setPickup]=useState("");
  const [destination,setDestination]=useState("");
  const [offerPrice,setOfferPrice]=useState("");
  const [paymentMethod,setPaymentMethod]=useState("kaspi");
  const [name,setName]=useState("");
  const [phone,setPhone]=useState("");
  const [message,setMessage]=useState("");
  const [sent,setSent]=useState<RideRequest|null>(null);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);

  useEffect(()=>{params.then(p=>{setCode(p.code);return fetch("/api/ride/"+encodeURIComponent(p.code));}).then(r=>r.json()).then(d=>{if(d.driver)setDriver(d.driver);else setError(d.error||"Водитель не найден");}).catch(()=>setError("Не удалось открыть страницу водителя"));},[params]);
  useEffect(()=>{
    if(!sent || !code) return;
    const timer=window.setInterval(async()=>{
      const r=await fetch("/api/ride/"+encodeURIComponent(code)+"?request="+encodeURIComponent(sent.id));
      const d=await r.json();
      if(d.request) setSent(d.request);
    },4000);
    return ()=>window.clearInterval(timer);
  },[sent?.id,code]);

  const send=async()=>{
    setError("");
    if(!pickup.trim()||!destination.trim()||!offerPrice||Number(offerPrice)<=0){setError("Укажите пункт назначения и предложенную цену");return;}
    setBusy(true);
    try{
      const r=await fetch("/api/ride/"+encodeURIComponent(code),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pickup,destination,offerPrice:Number(offerPrice),paymentMethod,passengerName:name,passengerPhone:phone,message})});
      const d=await r.json();
      if(!r.ok) throw new Error(d.error||"Ошибка");
      setSent(d.request);
    }catch(e){setError(e instanceof Error?e.message:"Ошибка");}finally{setBusy(false);}
  };

  if(!driver) return <main className="passengerShell"><div className="passengerCard"><div className="eyebrow">TAXI KZ</div><h1>{error||"Загрузка…"}</h1></div></main>;

  return <main className="passengerShell">
    <div className="passengerCard">
      <div className="eyebrow">TAXI KZ · ВОДИТЕЛЬ</div>
      <h1>{driver.name}</h1>
      <p className="passengerMuted">{driver.car||"Автомобиль"}{driver.plate ? " · "+driver.plate : ""}</p>
      {sent ? <><div className="passengerSuccess"><b>Предложение отправлено</b><span>Цена: {sent.offer_price.toLocaleString("ru-RU")} ₸</span><span>Оплата: {paymentMethod==="kaspi"?"Kaspi перевод":paymentMethod==="card"?"Перевод на карту":"Наличные"}</span></div><p className="passengerMuted">{sent.status==="accepted" ? "Водитель принял предложение." : sent.status==="countered" ? "Водитель предложил другую цену: "+Number(sent.agreed_price||0).toLocaleString("ru-RU")+" ₸." : sent.status==="rejected" ? "Водитель отклонил предложение." : "Ждём ответа водителя. Если он предложит другую цену, она появится здесь."}</p></> :
      <><label>Откуда забрать?<input value={pickup} onChange={e=>setPickup(e.target.value)} placeholder="Адрес, где вас забрать"/></label>
      <label>Куда едем?<input value={destination} onChange={e=>setDestination(e.target.value)} placeholder="Адрес или место назначения"/></label>
      <label>Ваша цена, ₸<input type="number" min="1" value={offerPrice} onChange={e=>setOfferPrice(e.target.value)} placeholder="Например, 4000"/></label>
      <label>Способ оплаты<select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)}><option value="kaspi">Перевод по Kaspi</option><option value="card">Перевод на карту</option><option value="cash">Наличные</option></select></label>
      <label>Имя (необязательно)<input value={name} onChange={e=>setName(e.target.value)} placeholder="Как к вам обращаться"/></label>
      <label>Телефон (необязательно)<input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+7 ..."/></label>
      <label>Сообщение водителю<textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Например: буду у входа №2"/></label>
      {error&&<div className="passengerError">{error}</div>}
      <button className="passengerAction" disabled={busy} onClick={send}>{busy?"Отправляем…":"Предложить цену и заказать"}</button></>}
    </div>
  </main>;
}
