// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from "react";
import { Home, Map, Wallet, User, Radio, TrendingUp, Car, ChevronRight, Bell, CircleHelp, Gift, X, QrCode, Navigation, Clock } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

function DriverMap({ ride }: { ride:any }) {
  const mapRef = useRef<any>(null);
  const mapObj = useRef<any>(null);
  const layers = useRef<any[]>([]);
  const [mapReady,setMapReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const load = async () => {
      if (!(window as any).L) {
        await new Promise<void>((resolve) => {
          const css = document.createElement("link");
          css.rel = "stylesheet";
          css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(css);
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = () => resolve();
          document.body.appendChild(script);
        });
      }
      if (!mapRef.current || mapObj.current) return;
      const L = (window as any).L;
      mapObj.current = L.map(mapRef.current, { zoomControl:false }).setView([51.1605,71.4704], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapObj.current);
      L.control.zoom({ position:"bottomright" }).addTo(mapObj.current);
      setMapReady(true);
    };
    load();
    return () => {
      if (mapObj.current) {
        mapObj.current.remove();
        mapObj.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapObj.current || !ride) return;
    const L = (window as any).L;
    const clear = () => { layers.current.forEach(x => x.remove()); layers.current=[]; };
    clear();

    const geocode = async (q:string) => {
      if (!q) return null;
      try {
        const r = await fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=kz&q="+encodeURIComponent(q));
        const d = await r.json();
        return d?.[0] ? [Number(d[0].lat),Number(d[0].lon)] : null;
      } catch { return null; }
    };

    (async () => {
      const from = await geocode(ride.pickup || "");
      const to = await geocode(ride.destination || "");
      if (!from && !to) return;
      const points:any[] = [];
      if (from) {
        const marker=L.marker(from,{icon:L.divIcon({className:"pickupMarker",html:"<div>●</div>",iconSize:[28,28],iconAnchor:[14,14]})}).addTo(mapObj.current);
        marker.bindPopup("Точка A · "+(ride.pickup||"")).openPopup();
        layers.current.push(marker); points.push(from);
      }
      if (to) {
        const marker=L.marker(to,{icon:L.divIcon({className:"destinationMarker",html:"<div>B</div>",iconSize:[30,30],iconAnchor:[15,15]})}).addTo(mapObj.current);
        marker.bindPopup("Точка B · "+ride.destination);
        layers.current.push(marker); points.push(to);
      }
      if (from && to) {
        try {
          const rr=await fetch("https://router.project-osrm.org/route/v1/driving/"+from[1]+","+from[0]+";"+to[1]+","+to[0]+"?overview=full&geometries=geojson");
          const rd=await rr.json();
          const coords=rd?.routes?.[0]?.geometry?.coordinates?.map((p:any)=>[p[1],p[0]]);
          if (coords?.length) {
            const line=L.polyline(coords,{weight:5,opacity:.9}).addTo(mapObj.current);
            layers.current.push(line);
          }
        } catch {}
      }
      if (points.length) mapObj.current.fitBounds(L.latLngBounds(points),{padding:[35,35]});
    })();
  }, [mapReady, ride?.id, ride?.pickup, ride?.destination]);

  return <div className="driverMapWrap">
    <div className="mapHeader"><div><b>{ride ? "Маршрут заказа" : "Карта города"}</b><span>{ride ? "A → B · навигация готова" : "Вы на линии"}</span></div><Navigation size={21}/></div>
    <div ref={mapRef} className="driverMap"/>
    <div className="mapAttribution">Карта © OpenStreetMap · маршрут OSRM</div>
  </div>;
}

export default function HomePage(){
 const [tab,setTab]=useState("Главная");
 const [online,setOnline]=useState(false);
 const [modal,setModal]=useState<"notifications"|"car"|"help"|"map"|"referral"|"orders"|"income"|"profile"|null>(null);
 const [message,setMessage]=useState("");
 const [driver,setDriver]=useState<any>(null);
 const [authMode,setAuthMode]=useState<"login"|"register">("login");
 const [authForm,setAuthForm]=useState({name:"",phone:"",password:"",car:"",plate:"",color:""});
 const [authBusy,setAuthBusy]=useState(false);
 const [qrOpen,setQrOpen]=useState(false);
 const [requests,setRequests]=useState<any[]>([]);
 const [activeRide,setActiveRide]=useState<any>(null);
 const [lastSeen,setLastSeen]=useState("");
 
 const loadRequests=async()=>{
   if(!driver || !online) return;
   try{
     const r=await fetch("/api/ride/requests",{cache:"no-store"});
     const d=await r.json();
     if(r.ok) {
       const next=d.requests??[];
       const newest=next.find((x:any)=>x.status==="pending");
       if(newest && newest.id!==lastSeen) {
         setLastSeen(newest.id);
         notify("Новый заказ: "+Number(newest.offer_price||0).toLocaleString("ru-RU")+" ₸");
       }
       setRequests(next);
       if(activeRide) {
         const fresh=next.find((x:any)=>x.id===activeRide.id);
         if(fresh) setActiveRide(fresh);
       }
     }
   }catch{}
 };

 useEffect(()=>{
   fetch("/api/auth/me",{cache:"no-store"}).then(r=>r.json()).then(d=>{
     if(d.driver){setDriver(d.driver);setOnline(Boolean(d.driver.is_online));}
   }).catch(()=>{});
 },[]);

 useEffect(()=>{
   if(!driver || !online) return;
   loadRequests();
   const timer=window.setInterval(loadRequests,3000);
   return ()=>window.clearInterval(timer);
 },[driver?.id,online,activeRide?.id,lastSeen]);

 const notify=(text:string)=>{
   setMessage(text);
   window.setTimeout(()=>setMessage(""),2600);
 };

 const setOnlineStatus=async(next:boolean)=>{
   setOnline(next);
   try{
     const r=await fetch("/api/driver/status",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({online:next})});
     if(!r.ok) throw new Error();
     notify(next?"Вы вышли в онлайн — ждём заказы":"Вы вышли из онлайна");
     if(next) loadRequests();
   }catch{setOnline(!next);notify("Не удалось изменить статус");}
 };

 const submitAuth=async()=>{
   setAuthBusy(true);
   try{
     const endpoint=authMode==="login"?"/api/auth/login":"/api/auth/register";
     const res=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(authMode==="login"?{phone:authForm.phone,password:authForm.password}:authForm)});
     const data=await res.json(); if(!res.ok) throw new Error(data.error||"Ошибка");
     setDriver(data.driver); setOnline(Boolean(data.driver?.is_online)); setModal(null); notify(authMode==="login"?"Вход выполнен":"Регистрация завершена");
   }catch(e){notify(e instanceof Error?e.message:"Ошибка авторизации");}
   finally{setAuthBusy(false);}
 };

 const logout=async()=>{if(driver) await fetch("/api/driver/status",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({online:false})}).catch(()=>{}); await fetch("/api/auth/logout",{method:"POST"});setDriver(null);setOnline(false);setModal(null);setRequests([]);setActiveRide(null);notify("Вы вышли из аккаунта");};

 const respondRide=async(id:string,status:"accepted"|"countered"|"rejected",price?:number)=>{
   const ride=requests.find(x=>x.id===id);
   const reply=status==="accepted"?"Цена принята":status==="rejected"?"Предложение отклонено":"Могу поехать за "+Number(price||0).toLocaleString("ru-RU")+" ₸";
   const res=await fetch("/api/ride/requests/"+id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status,agreedPrice:price,reply})});
   const data=await res.json();
   if(res.ok){
     const updated={...ride,...data.request};
     setRequests(rs=>rs.filter(x=>x.id!==id || status!=="accepted").map(x=>x.id===id?updated:x));
     if(status==="accepted"){setActiveRide(updated);notify("Заказ принят — строим маршрут");}
     else if(status==="countered"){setActiveRide(updated);notify("Новая цена отправлена");}
     else notify("Предложение отклонено");
   } else notify(data.error||"Не удалось ответить");
 };

 const copyReferral=async()=>{
   const link=window.location.origin+"/invite/TAXIKZ";
   try{await navigator.clipboard.writeText(link);notify("Реферальная ссылка скопирована");}catch{notify("Ссылка: "+link);}
 };

 const nav=[{name:"Главная",icon:Home},{name:"Заказы",icon:Map},{name:"Доход",icon:Wallet},{name:"Профиль",icon:User}];
 const selectTab=(name:string)=>{setTab(name);if(name==="Заказы")setModal("orders");if(name==="Доход")setModal("income");if(name==="Профиль")setModal("profile");};
 const pending=requests.filter(r=>r.status==="pending");
 const current=activeRide || pending[0] || null;

 return <main className="shell">
   <header className="topbar">
    <div><div className="eyebrow">TAXI KZ</div><h1>{driver?.name ? "Привет, "+driver.name+" 👋" : "Привет, водитель 👋"}</h1></div>
    <button aria-label="Уведомления" onClick={()=>{setModal("notifications");loadRequests();}} className="iconBtn"><Bell size={20}/>{pending.length>0&&<span/>}</button>
   </header>

   <section className="statusCard">
    <div className="statusTop"><div><span className={online?"dot live":"dot"}></span>{online?"Вы на линии":"Вы офлайн"}</div><button aria-label="Переключить статус" onClick={()=>driver?setOnlineStatus(!online):setModal("profile")} className={online?"switch on":"switch"}><i/></button></div>
    <button className={online?"goOnline online":"goOnline"} onClick={()=>driver?setOnlineStatus(!online):setModal("profile")}>{online?"ВЫЙТИ ИЗ ОНЛАЙНА":"ВЫЙТИ В ОНЛАЙН"}</button>
    <div className="statusMain"><div><span>Сегодня</span><strong>18 750 ₸</strong></div><div><span>Поездок</span><strong>12</strong></div><div><span>Часов</span><strong>6ч 40м</strong></div></div>
    <div className="progress"><span style={{width:"72%"}}/></div><div className="goal"><span>До цели 25 000 ₸</span><b>75%</b></div>
   </section>

   {online && <DriverMap ride={current}/>}
   
   <section className="section">
    <div className="sectionHead"><h2>Доступные заказы</h2><button onClick={()=>setModal("orders")} className="textBtn">Все</button></div>
    <div className="orders">
     {pending.length ? pending.slice(0,5).map((o:any,i:number)=><button key={o.id} onClick={()=>setActiveRide(o)} className="order">
       <div className="route"><span className="pickup"/><div><b>{o.pickup||"Точка подачи"}</b><small>{o.destination}</small></div></div>
       <div className="orderRight"><strong>{Number(o.offer_price).toLocaleString("ru-RU")} ₸</strong><small><Clock size={11}/> {o.payment_method==="kaspi"?"Kaspi":o.payment_method==="card"?"Карта":"Наличные"}</small></div>
     </button>) : <div className="emptyOrders">{online?"Ждём новые заказы…":"Выйдите в онлайн, чтобы получать заказы"}</div>}
    </div>
   </section>

   <section className="statsGrid"><div className="miniCard"><div className="miniIcon"><TrendingUp size={18}/></div><span>Средний чек</span><strong>1 560 ₸</strong><small>+8% сегодня</small></div><div className="miniCard"><div className="miniIcon"><Gift size={18}/></div><span>Бонусы</span><strong>12 500 ₸</strong><small>за приглашения</small></div></section>

   <section className="promo"><div><span>ПРИГЛАШАЙ ВОДИТЕЛЕЙ</span><h3>Зарабатывай бонус<br/>за каждого друга</h3><p>Пригласи водителя в Taxi KZ и получай бонусы.</p><button onClick={copyReferral}>Моя реферальная ссылка <ChevronRight size={16}/></button></div><div className="giftArt"><Gift size={48}/></div></section>

   <section className="quick"><button onClick={()=>setModal("car")}><Car size={19}/><span>Мой автомобиль</span><ChevronRight/></button><button onClick={()=>setModal("help")}><CircleHelp size={19}/><span>Помощь и поддержка</span><ChevronRight/></button></section>
   <nav className="bottomNav">{nav.map(n=>{const Icon=n.icon;return <button key={n.name} onClick={()=>selectTab(n.name)} className={tab===n.name?"navItem active":"navItem"}><Icon size={21}/><span>{n.name}</span></button>})}</nav>

   {modal && <div className="modalBackdrop" onClick={()=>setModal(null)}><div className="modalCard" onClick={e=>e.stopPropagation()}><button aria-label="Закрыть" className="modalClose" onClick={()=>setModal(null)}><X size={18}/></button>
     {modal==="notifications" && <><div className="eyebrow">ЗАКАЗЫ В ОНЛАЙНЕ</div><h2>{pending.length?"Новый заказ":"Всё спокойно"}</h2>{pending.length?pending.map((r:any)=><div key={r.id} className="rideRequest"><b>{r.pickup||"Точка подачи"} → {r.destination}</b><span>{Number(r.offer_price).toLocaleString("ru-RU")} ₸ · {r.payment_method==="kaspi"?"Kaspi":r.payment_method==="card"?"Карта":"Наличные"}</span>{r.message&&<small>«{r.message}»</small>}<em>Клиент ждёт водителя</em><div className="rideActions"><button onClick={()=>respondRide(r.id,"accepted",r.offer_price)}>Принять</button><button onClick={()=>{const p=window.prompt("Ваша цена, ₸",String(r.offer_price));if(p)respondRide(r.id,"countered",Number(p))}}>Своя цена</button><button onClick={()=>respondRide(r.id,"rejected")}>Отказать</button></div></div>):<p>{online?"Новые заказы будут появляться автоматически каждые несколько секунд.":"Выйдите в онлайн, чтобы получать заказы."}</p>}</>}
     {modal==="orders" && <><div className="eyebrow">ЗАКАЗЫ</div><h2>Доступные заказы</h2>{pending.length?pending.map((o:any)=><button key={o.id} className="modalRow" onClick={()=>{setActiveRide(o);setModal(null)}}><span>{o.pickup||"Подача"} → {o.destination}</span><b>{Number(o.offer_price).toLocaleString("ru-RU")} ₸</b></button>):<p>Новых заказов нет.</p>}</>}
     {modal==="map" && <><div className="eyebrow">КАРТА</div><h2>Навигация</h2><p>Выходите в онлайн — карта и маршрут заказа будут доступны прямо на главном экране.</p></>}
     {modal==="income" && <><div className="eyebrow">ДОХОД</div><h2>Сегодня 18 750 ₸</h2><p>12 поездок · 6ч 40м · средний чек 1 560 ₸.</p></>}
     {modal==="profile" && driver && <><div className="eyebrow">ПРОФИЛЬ</div><h2>{driver.name}</h2><p>Телефон: {driver.phone}<br/>Статус: {online?"на линии":"офлайн"}<br/>Аккаунт: {driver.status==="pending"?"На проверке":"Активен"}</p><button className="modalAction" onClick={()=>setQrOpen(true)}>Мой QR-код</button><button className="modalAction" style={{marginTop:8}} onClick={logout}>Выйти из аккаунта</button></>}
     {modal==="profile" && !driver && <><div className="eyebrow">{authMode==="login"?"ВХОД":"РЕГИСТРАЦИЯ"}</div><h2>{authMode==="login"?"Вход водителя":"Регистрация водителя"}</h2>{authMode==="register"&&<input className="authInput" placeholder="Имя и фамилия" value={authForm.name} onChange={e=>setAuthForm({...authForm,name:e.target.value})}/>}<input className="authInput" placeholder="Номер телефона" value={authForm.phone} onChange={e=>setAuthForm({...authForm,phone:e.target.value})}/><input className="authInput" type="password" placeholder="Пароль (от 6 символов)" value={authForm.password} onChange={e=>setAuthForm({...authForm,password:e.target.value})}/>{authMode==="register"&&<><input className="authInput" placeholder="Автомобиль" value={authForm.car} onChange={e=>setAuthForm({...authForm,car:e.target.value})}/><input className="authInput" placeholder="Гос. номер" value={authForm.plate} onChange={e=>setAuthForm({...authForm,plate:e.target.value})}/><input className="authInput" placeholder="Цвет автомобиля" value={authForm.color} onChange={e=>setAuthForm({...authForm,color:e.target.value})}/></>}<button className="modalAction" disabled={authBusy} onClick={submitAuth}>{authBusy?"Подождите…":authMode==="login"?"Войти":"Зарегистрироваться"}</button><button className="authSwitch" onClick={()=>setAuthMode(authMode==="login"?"register":"login")}>{authMode==="login"?"Новый водитель? Зарегистрироваться":"Уже есть аккаунт? Войти"}</button></>}
     {modal==="car"&&<><div className="eyebrow">АВТОМОБИЛЬ</div><h2>Ваш автомобиль</h2><p>{driver?.car||"Автомобиль"} · {driver?.color||"цвет не указан"} · гос. номер {driver?.plate||"не указан"}.</p></>}
     {modal==="help"&&<><div className="eyebrow">ПОДДЕРЖКА</div><h2>Помощь и поддержка</h2><p>Заказы, онлайн и навигация работают автоматически. Если что-то не отображается, откройте приложение заново.</p></>}
   </div></div>}

   {qrOpen&&<div className="modalBackdrop" onClick={()=>setQrOpen(false)}><div className="modalCard qrCard" onClick={e=>e.stopPropagation()}><button aria-label="Закрыть" className="modalClose" onClick={()=>setQrOpen(false)}><X size={18}/></button><div className="eyebrow">ВАШ QR-КОД</div><h2>Клиенты могут найти вас</h2><p>Покажите этот QR-код клиенту — заказ попадёт в общий эфир водителей Taxi KZ.</p><div className="qrBox"><QRCodeCanvas value={window.location.origin+"/ride/"+(driver?.public_code??"demo")} size={220} includeMargin/></div></div></div>}
   {message&&<div className="toast" role="status">{message}</div>}
 </main>
}
