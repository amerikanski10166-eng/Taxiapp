"use client";

import { useEffect, useState } from "react";
import { Home, Map, Wallet, User, Radio, TrendingUp, Car, ChevronRight, Bell, CircleHelp, Gift, X, QrCode } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

const orders=[
  {from:"ЖК Северное сияние",to:"ТРЦ Хан Шатыр",price:"2 450 ₸",time:"12 мин",coef:"КЭФ 1.8"},
  {from:"Аэропорт",to:"Центр города",price:"4 900 ₸",time:"27 мин",coef:"КЭФ 2.1"},
  {from:"Есильский район",to:"ЖД вокзал",price:"2 100 ₸",time:"16 мин",coef:"КЭФ 1.6"},
];

export default function HomePage(){
 const [tab,setTab]=useState("Главная");
 const [online,setOnline]=useState(true);
 const [selected,setSelected]=useState(0);
 const [modal,setModal]=useState<"notifications"|"car"|"help"|"map"|"referral"|"orders"|"income"|"profile"|null>(null);
 const [message,setMessage]=useState("");
 const [driver,setDriver]=useState<any>(null);
 const [authMode,setAuthMode]=useState<"login"|"register">("login");
 const [authForm,setAuthForm]=useState({name:"",phone:"",password:"",car:"",plate:""});
 const [authBusy,setAuthBusy]=useState(false);
 const [qrOpen,setQrOpen]=useState(false);
 const [requests,setRequests]=useState<any[]>([]);
 useEffect(()=>{fetch("/api/auth/me").then(r=>r.json()).then(d=>setDriver(d.driver??null)).catch(()=>{});},[]);
 useEffect(()=>{if(modal==="notifications" && driver){fetch("/api/ride/requests").then(r=>r.json()).then(d=>setRequests(d.requests??[])).catch(()=>{});}},[modal,driver]);
 const submitAuth=async()=>{setAuthBusy(true);try{const endpoint=authMode==="login"?"/api/auth/login":"/api/auth/register";const res=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(authMode==="login"?{phone:authForm.phone,password:authForm.password}:authForm)});const data=await res.json();if(!res.ok)throw new Error(data.error||"Ошибка");setDriver(data.driver);setModal(null);notify(authMode==="login"?"Вход выполнен":"Регистрация завершена");}catch(e){notify(e instanceof Error?e.message:"Ошибка авторизации");}finally{setAuthBusy(false);}};
 const logout=async()=>{await fetch("/api/auth/logout",{method:"POST"});setDriver(null);setModal(null);notify("Вы вышли из аккаунта");};
 const respondRide=async(id:string,status:"accepted"|"countered"|"rejected",price?:number)=>{
   const reply=status==="accepted"?"Цена принята":status==="rejected"?"Предложение отклонено":"Могу поехать за "+Number(price||0).toLocaleString("ru-RU")+" ₸";
   const res=await fetch("/api/ride/requests/"+id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status,agreedPrice:price,reply})});
   const data=await res.json();
   if(res.ok){setRequests(rs=>rs.map(x=>x.id===id?{...x,...data.request}:x));notify(status==="accepted"?"Заказ принят":status==="countered"?"Новая цена отправлена":"Предложение отклонено");}
   else notify(data.error||"Не удалось ответить");
 };

 const notify=(text:string)=>{
   setMessage(text);
   window.setTimeout(()=>setMessage(""),2200);
 };

 const copyReferral=async()=>{
   const link=window.location.origin+"/invite/TAXIKZ";
   try{
     await navigator.clipboard.writeText(link);
     notify("Реферальная ссылка скопирована");
   }catch{
     notify("Ссылка: "+link);
   }
 };

 const nav=[
  {name:"Главная",icon:Home},
  {name:"Заказы",icon:Map},
  {name:"Доход",icon:Wallet},
  {name:"Профиль",icon:User},
 ];

 const selectTab=(name:string)=>{
   setTab(name);
   if(name==="Заказы") setModal("orders");
   if(name==="Доход") setModal("income");
   if(name==="Профиль") setModal("profile");
 };

 return <main className="shell">
   <header className="topbar">
    <div><div className="eyebrow">TAXI KZ</div><h1>{driver?.name ? "Привет, "+driver.name+" 👋" : "Привет, водитель 👋"}</h1></div>
    <button aria-label="Уведомления" onClick={()=>setModal("notifications")} className="iconBtn"><Bell size={20}/><span/></button>
   </header>

   <section className="statusCard">
    <div className="statusTop"><div><span className={online?"dot live":"dot"}></span>{online?"Вы на линии":"Вы офлайн"}</div><button aria-label="Переключить статус" onClick={()=>{setOnline(!online);notify(online?"Вы вышли с линии":"Вы снова на линии")}} className={online?"switch on":"switch"}><i/></button></div>
    <div className="statusMain"><div><span>Сегодня</span><strong>18 750 ₸</strong></div><div><span>Поездок</span><strong>12</strong></div><div><span>Часов</span><strong>6ч 40м</strong></div></div>
    <div className="progress"><span style={{width:"72%"}}/></div><div className="goal"><span>До цели 25 000 ₸</span><b>75%</b></div>
   </section>

   <section className="section">
    <div className="sectionHead"><h2>Радар КЭФА</h2><button className="qrDriverBtn" onClick={()=>setQrOpen(true)}><QrCode size={15}/> Мой QR</button><span className="livePill"><Radio size={13}/> LIVE</span></div>
    <div className="radarCard">
      <div className="radarCircle"><div className="radarCore">1.8x</div></div>
      <div className="radarInfo"><span>Сейчас повышенный спрос</span><strong>КЭФ 1.8 — 2.1</strong><p>Больше заказов в районе центра</p><button onClick={()=>setModal("map")}>Открыть карту <ChevronRight size={16}/></button></div>
    </div>
   </section>

   <section className="section">
    <div className="sectionHead"><h2>Доступные заказы</h2><button onClick={()=>setModal("orders")} className="textBtn">Все</button></div>
    <div className="orders">
     {orders.map((o,i)=><button key={i} onClick={()=>{setSelected(i);notify(`Заказ выбран: ${o.from} → ${o.to}`)}} className={selected===i?"order active":"order"}>
       <div className="route"><span className="pickup"/><div><b>{o.from}</b><small>{o.to}</small></div></div>
       <div className="orderRight"><strong>{o.price}</strong><small>{o.time} · {o.coef}</small></div>
     </button>)}
    </div>
   </section>

   <section className="statsGrid">
    <div className="miniCard"><div className="miniIcon"><TrendingUp size={18}/></div><span>Средний чек</span><strong>1 560 ₸</strong><small>+8% сегодня</small></div>
    <div className="miniCard"><div className="miniIcon"><Gift size={18}/></div><span>Бонусы</span><strong>12 500 ₸</strong><small>за приглашения</small></div>
   </section>

   <section className="promo">
    <div><span>ПРИГЛАШАЙ ВОДИТЕЛЕЙ</span><h3>Зарабатывай бонус<br/>за каждого друга</h3><p>Пригласи водителя в Taxi KZ и получай бонусы.</p><button onClick={copyReferral}>Моя реферальная ссылка <ChevronRight size={16}/></button></div>
    <div className="giftArt"><Gift size={48}/></div>
   </section>

   <section className="quick">
    <button onClick={()=>setModal("car")}><Car size={19}/><span>Мой автомобиль</span><ChevronRight/></button>
    <button onClick={()=>setModal("help")}><CircleHelp size={19}/><span>Помощь и поддержка</span><ChevronRight/></button>
   </section>

   <nav className="bottomNav">{nav.map(n=>{const Icon=n.icon; return <button key={n.name} onClick={()=>selectTab(n.name)} className={tab===n.name?"navItem active":"navItem"}><Icon size={21}/><span>{n.name}</span></button>})}</nav>

   {modal && <div className="modalBackdrop" onClick={()=>setModal(null)}>
     <div className="modalCard" onClick={e=>e.stopPropagation()}>
       <button aria-label="Закрыть" className="modalClose" onClick={()=>setModal(null)}><X size={18}/></button>
       {modal==="notifications" && <><div className="eyebrow">ЗАПРОСЫ КЛИЕНТОВ</div><h2>{requests.length ? "Новые предложения" : "Всё спокойно"}</h2>{requests.length ? requests.map((r:any)=><div key={r.id} className="rideRequest"><b>{r.destination}</b><span>{Number(r.offer_price).toLocaleString("ru-RU")} ₸ · {r.payment_method==="kaspi"?"Kaspi":r.payment_method==="card"?"Карта":"Наличные"}</span>{r.message&&<small>«{r.message}»</small>}<em>{r.status==="pending"?"Ожидает ответа":r.status==="accepted"?"Принято":r.status==="countered"?"Водитель предложил другую цену":"Отклонено"}</em>{r.status==="pending"&&<div className="rideActions"><button onClick={()=>respondRide(r.id,"accepted",r.offer_price)}>Принять</button><button onClick={()=>{const p=window.prompt("Ваша цена, ₸",String(r.offer_price));if(p)respondRide(r.id,"countered",Number(p))}}>Своя цена</button><button onClick={()=>respondRide(r.id,"rejected")}>Отказать</button></div>}</div>) : <p>Когда клиент отсканирует ваш QR и предложит цену, запрос появится здесь.</p>}</>}
       {modal==="map" && <><div className="eyebrow">РАДАР КЭФА</div><h2>Карта спроса</h2><p>Повышенный спрос сейчас в районе центра Астаны. Откройте карты, чтобы построить маршрут.</p><button className="modalAction" onClick={()=>window.open("https://www.google.com/maps/search/?api=1&query=Astana","_blank","noopener,noreferrer")}>Открыть карты</button></>}
       {modal==="orders" && <><div className="eyebrow">ЗАКАЗЫ</div><h2>Доступные заказы</h2>{orders.map((o,i)=><button key={i} className="modalRow" onClick={()=>{setSelected(i);setModal(null);notify(`Выбран заказ на ${o.price}`)}}><span>{o.from} → {o.to}</span><b>{o.price}</b></button>)}</>}
       {modal==="income" && <><div className="eyebrow">ДОХОД</div><h2>Сегодня 18 750 ₸</h2><p>12 поездок · 6ч 40м · средний чек 1 560 ₸.</p></>}
              {modal==="profile" && driver && <><div className="eyebrow">ПРОФИЛЬ</div><h2>{driver.name}</h2><p>Телефон: {driver.phone}<br/>Статус: {online?"на линии":"офлайн"}<br/>Аккаунт: {driver.status==="pending"?"На проверке":"Активен"}</p><button className="modalAction" onClick={()=>setModal("car")}>Мой автомобиль</button><button className="modalAction" style={{marginTop:8}} onClick={logout}>Выйти из аккаунта</button></>}
       {modal==="profile" && !driver && <><div className="eyebrow">{authMode==="login"?"ВХОД":"РЕГИСТРАЦИЯ"}</div><h2>{authMode==="login"?"Вход водителя":"Регистрация водителя"}</h2>{authMode==="register" && <input className="authInput" placeholder="Имя и фамилия" value={authForm.name} onChange={e=>setAuthForm({...authForm,name:e.target.value})}/>}<input className="authInput" placeholder="Номер телефона" value={authForm.phone} onChange={e=>setAuthForm({...authForm,phone:e.target.value})}/><input className="authInput" type="password" placeholder="Пароль (от 6 символов)" value={authForm.password} onChange={e=>setAuthForm({...authForm,password:e.target.value})}/>{authMode==="register" && <><input className="authInput" placeholder="Автомобиль" value={authForm.car} onChange={e=>setAuthForm({...authForm,car:e.target.value})}/><input className="authInput" placeholder="Гос. номер" value={authForm.plate} onChange={e=>setAuthForm({...authForm,plate:e.target.value})}/></>}<button className="modalAction" disabled={authBusy} onClick={submitAuth}>{authBusy?"Подождите…":authMode==="login"?"Войти":"Зарегистрироваться"}</button><button className="authSwitch" onClick={()=>setAuthMode(authMode==="login"?"register":"login")}>{authMode==="login"?"Новый водитель? Зарегистрироваться":"Уже есть аккаунт? Войти"}</button></>}
       {modal==="car" && <><div className="eyebrow">АВТОМОБИЛЬ</div><h2>Ваш автомобиль</h2><p>{driver?.car || "Toyota Camry"} · гос. номер {driver?.plate || "не указан"}.</p><button className="modalAction" onClick={()=>notify("Данные автомобиля готовы к изменению")}>Изменить данные</button></>}
       {modal==="help" && <><div className="eyebrow">ПОДДЕРЖКА</div><h2>Помощь и поддержка</h2><p>Выберите действие: мы сохранили интерфейс без изменений.</p><button className="modalAction" onClick={()=>notify("Запрос в поддержку создан")}>Связаться с поддержкой</button></>}
     </div>
   </div>}

   {qrOpen && <div className="modalBackdrop" onClick={()=>setQrOpen(false)}>
     <div className="modalCard qrCard" onClick={e=>e.stopPropagation()}>
       <button aria-label="Закрыть" className="modalClose" onClick={()=>setQrOpen(false)}><X size={18}/></button>
       <div className="eyebrow">ВАШ QR-КОД</div>
       <h2>Клиенты могут найти вас</h2>
       <p>Покажите этот QR-код клиенту. После сканирования он сможет написать вам и предложить цену поездки.</p>
       <div className="qrBox"><QRCodeCanvas value={window.location.origin+"/ride/"+(driver?.id ?? "demo")} size={220} includeMargin /></div>
       <small className="qrCodeText">Код водителя: {driver?.id ?? "Войдите в аккаунт"}</small>
       {!driver && <p>Для персонального QR-кода войдите в аккаунт водителя.</p>}
     </div>
   </div>}

   {message && <div className="toast" role="status">{message}</div>}
 </main>
}