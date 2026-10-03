"use client";

import { useState } from "react";

type Props = { onTrackingToken?: (token: string, order: any) => void };

export default function BasgoOrderFlow({ onTrackingToken }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [price, setPrice] = useState("");
  const [payment, setPayment] = useState("kaspi");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<any>(null);

  const submit = async () => {
    setError("");
    if (!message.trim() || !pickup.trim() || !destination.trim() || Number(price) <= 0) {
      setError("Опишите поручение, укажите откуда забрать, куда доставить и бюджет.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/basgo/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, pickup, destination, offerPrice: Number(price), paymentMethod: payment, passengerName: name, passengerPhone: phone }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Ошибка");
      setCreated(body.order);
      onTrackingToken?.(body.order.tracking_token, body.order);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось создать поручение");
    } finally {
      setBusy(false);
    }
  };

  if (created) {
    return <div className="basgo-order-created">
      <div className="basgo-order-number"><span>ЗАКАЗ СОЗДАН</span><b>BASGO-{String(created.id).slice(0, 8).toUpperCase()}</b></div>
      <strong>Исполнители получили новое поручение.</strong>
      <span>{created.pickup} → {created.destination}</span>
      <small>Статус: {created.status === "pending" ? "ищем исполнителя" : created.status}</small>
      <button className="basgo-secondary" onClick={() => setCreated(null)}>Создать ещё поручение</button>
    </div>;
  }

  return <div className="basgo-order-box">
    <button className="basgo-task basgo-task-main" onClick={() => setOpen(v => !v)}><span>⚡</span><div><b>Новое поручение</b><small>Опишите задачу своими словами — BASGO найдёт исполнителя</small></div><span>{open ? "×" : "›"}</span></button>
    {open && <div className="basgo-order-form">
      <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Например: забрать документы в офисе и привезти мне домой" />
      <input value={pickup} onChange={e=>setPickup(e.target.value)} placeholder="Откуда забрать" />
      <input value={destination} onChange={e=>setDestination(e.target.value)} placeholder="Куда доставить" />
      <div className="basgo-order-row"><input value={price} onChange={e=>setPrice(e.target.value)} inputMode="numeric" placeholder="Бюджет, ₸" /><select value={payment} onChange={e=>setPayment(e.target.value)}><option value="kaspi">Kaspi</option><option value="card">Карта</option><option value="cash">Наличные</option></select></div>
      <div className="basgo-order-row"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Имя" /><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Телефон" /></div>
      {error && <div className="basgo-order-error">{error}</div>}
      <button className="basgo-primary" disabled={busy} onClick={submit}>{busy ? "Создаём…" : "Создать поручение"}</button>
    </div>}
    <div className="basgo-task"><span>📦</span><div><b>Доставка</b><small>Забрать и передать отправление</small></div><span>›</span></div>
    <div className="basgo-task"><span>🔄</span><div><b>Возврат</b><small>Вернуть товар отправителю</small></div><span>›</span></div>
  </div>;
}