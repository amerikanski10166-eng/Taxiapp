"use client";

import { useEffect, useState } from "react";

type Props = { trackingToken: string | null };

export default function BasgoOrderStatus({ trackingToken }: Props) {
  const [order, setOrder] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!trackingToken) { setOrder(null); return; }
    let stopped = false;
    const load = async () => {
      try {
        const r = await fetch("/api/basgo/tracking/status?token=" + encodeURIComponent(trackingToken), { cache: "no-store" });
        const d = await r.json();
        if (!stopped && r.ok) setOrder(d.order);
      } catch {}
    };
    void load();
    const id = window.setInterval(load, 4000);
    return () => { stopped = true; window.clearInterval(id); };
  }, [trackingToken]);

  const confirmPayment = async () => {
    if (!trackingToken || !order?.id) return;
    setError(""); setBusy(true);
    try {
      const r = await fetch("/api/basgo/payment/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingToken, rideId: order.id }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Не удалось подтвердить оплату");
      setOrder(d.order);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось подтвердить оплату");
    } finally {
      setBusy(false);
    }
  };

  if (!trackingToken || !order) return null;

  const statusText =
    order.status === "pending" ? "Ищем исполнителя" :
    order.status === "accepted" ? "Исполнитель принял заказ" :
    order.status === "completed" ? "Заказ завершён" : "Заказ выполняется";

  return (
    <div className="basgo-track-card">
      <div className="basgo-track-head">
        <div><b>Статус заказа</b><span>BASGO-{String(order.id).slice(0, 8).toUpperCase()}</span></div>
        <span className="basgo-live-badge"><i /> LIVE</span>
      </div>
      <div className="basgo-track-line">
        <div className={"basgo-track-node " + (order.status !== "pending" ? "active" : "")}>
          <strong>{statusText}</strong>
          <small>Статус обновляется автоматически</small>
        </div>
        <div className={"basgo-track-node " + (order.payment_status === "confirmed" ? "active" : "")}>
          <strong>{order.payment_status === "confirmed" ? "Оплата подтверждена" : "Оплата ожидает подтверждения"}</strong>
          <small>{Number(order.agreed_price || order.offer_price || 0).toLocaleString("ru-RU")} ₸ · {order.payment_method}</small>
        </div>
      </div>
      {order.status === "completed" && order.payment_status === "pending" && (
        <>
          <button type="button" className="basgo-primary" disabled={busy} onClick={confirmPayment}>
            {busy ? "Подтверждаем…" : "Подтвердить оплату"}
          </button>
          <small className="basgo-note">Это подтверждение клиента. Автоматическую проверку Kaspi/карты подключим через платёжного провайдера.</small>
        </>
      )}
      {error && <div className="basgo-order-error">{error}</div>}
    </div>
  );
}
