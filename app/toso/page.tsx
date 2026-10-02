"use client";

import { useState } from "react";
import { ArrowRight, Bike, Check, ChevronLeft, FileCheck2, Headphones, ShieldCheck, UserRound, WalletCards, MapPin, PackageCheck } from "lucide-react";

const legalItems = [
  { title: "Пользовательское соглашение", text: "Правила использования платформы TOSO." },
  { title: "Политика конфиденциальности", text: "Как мы обрабатываем и защищаем персональные данные." },
  { title: "Согласие на обработку данных", text: "Отдельное подтверждение обработки данных, необходимых для работы сервиса." },
  { title: "Правила безопасности", text: "Правила передачи, получения, возврата и спорных ситуаций." },
];

export default function TosoPrototype() {
  const [step, setStep] = useState<"welcome" | "legal" | "role" | "client" | "courier">("welcome");
  const [accepted, setAccepted] = useState<boolean[]>([false, false, false, false]);

  const allAccepted = accepted.every(Boolean);
  const toggle = (i: number) => setAccepted((x) => x.map((v, n) => (n === i ? !v : v)));

  return (
    <main className="toso-shell">
      <section className="toso-phone">
        <div className="toso-glow" />
        <header className="toso-header">
          {step !== "welcome" && (
            <button className="toso-icon" onClick={() => setStep(step === "legal" ? "welcome" : step === "role" ? "legal" : "role")} aria-label="Назад">
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="toso-logo">TO<span>SO</span></div>
          <div className="toso-status"><span /> защищено</div>
        </header>

        {step === "welcome" && (
          <div className="toso-hero">
            <div className="toso-orb"><PackageCheck size={54} strokeWidth={1.6} /></div>
            <div className="toso-kicker">ГОРОДСКИЕ ПОРУЧЕНИЯ</div>
            <h1>Нужно сейчас?<br /><strong>TOSO решит.</strong></h1>
            <p>Доставка, получение, возврат и срочные поручения — с контролем каждого шага.</p>
            <div className="toso-pills"><span><ShieldCheck size={15} /> Проверенные исполнители</span><span><Headphones size={15} /> Поддержка</span></div>
            <button className="toso-primary" onClick={() => setStep("legal")}>Продолжить <ArrowRight size={18} /></button>
            <small>Сначала ознакомимся с правилами сервиса.</small>
          </div>
        )}

        {step === "legal" && (
          <div className="toso-content">
            <div className="toso-kicker">ПЕРЕД НАЧАЛОМ</div>
            <h2>Сначала — правила.</h2>
            <p className="toso-muted">Мы показываем ключевые документы до входа в систему. Полные версии доступны по каждому пункту.</p>
            <div className="toso-legal-list">
              {legalItems.map((item, i) => (
                <button key={item.title} className={"toso-legal " + (accepted[i] ? "checked" : "")} onClick={() => toggle(i)}>
                  <div className="toso-check">{accepted[i] ? <Check size={16} /> : null}</div>
                  <div><b>{item.title}</b><span>{item.text}</span></div>
                </button>
              ))}
            </div>
            <label className="toso-master"><input type="checkbox" checked={allAccepted} onChange={(e) => setAccepted(legalItems.map(() => e.target.checked))} /><span>Я ознакомился с документами и согласен с применимыми условиями.</span></label>
            <button className="toso-primary" disabled={!allAccepted} onClick={() => setStep("role")}>Продолжить <ArrowRight size={18} /></button>
            <small className="toso-note"><FileCheck2 size={14} /> Версия и время каждого согласия будут фиксироваться в системе.</small>
          </div>
        )}

        {step === "role" && (
          <div className="toso-content role">
            <div className="toso-kicker">КАК ВЫ БУДЕТЕ ИСПОЛЬЗОВАТЬ TOSO?</div>
            <h2>Выберите роль</h2>
            <p className="toso-muted">Роль можно будет изменить через обращение в поддержку по правилам сервиса.</p>
            <button className="toso-role-card" onClick={() => setStep("client")}><div className="role-icon client"><UserRound /></div><div><b>Я заказчик</b><span>Создаю поручения и отслеживаю выполнение.</span></div><ArrowRight /></button>
            <button className="toso-role-card" onClick={() => setStep("courier")}><div className="role-icon courier"><Bike /></div><div><b>Я исполнитель</b><span>Прохожу проверку и выполняю заказы.</span></div><ArrowRight /></button>
          </div>
        )}

        {step === "client" && (
          <div className="toso-content">
            <div className="toso-kicker">TOSO CLIENT</div>
            <h2>Чем помочь?</h2>
            <div className="toso-task"><span>⚡</span><div><b>Срочное поручение</b><small>Опишите задачу своими словами</small></div><ArrowRight /></div>
            <div className="toso-task"><span>📦</span><div><b>Доставка</b><small>Забрать и передать отправление</small></div><ArrowRight /></div>
            <div className="toso-task"><span>🔄</span><div><b>Возврат</b><small>Вернуть товар отправителю</small></div><ArrowRight /></div>
            <div className="toso-trust"><ShieldCheck /><div><b>Каждая передача фиксируется</b><span>Код, время, статус и история заказа.</span></div></div>
            <div className="toso-bottom-stat"><WalletCards /> Оплата: наличные или безналичные способы, доступные в сервисе</div>
          </div>
        )}

        {step === "courier" && (
          <div className="toso-content">
            <div className="toso-kicker">TOSO COURIER</div>
            <h2>Проверка исполнителя</h2>
            <p className="toso-muted">До доступа к заказам — идентификация, документы и обязательные проверки.</p>
            <div className="toso-verify"><div className="verify-line"><span>01</span><b>Удостоверение личности</b><em>обязательно</em></div><div className="verify-line"><span>02</span><b>Селфи-проверка</b><em>обязательно</em></div><div className="verify-line"><span>03</span><b>Транспорт и техпаспорт</b><em>если используется авто</em></div></div>
            <div className="toso-security"><ShieldCheck size={22} /><div><b>Контроль доступа</b><span>Без завершения проверки заказы не открываются.</span></div></div>
            <button className="toso-primary" onClick={() => setStep("role")}>Начать регистрацию <ArrowRight size={18} /></button>
          </div>
        )}
      </section>
    </main>
  );
}
