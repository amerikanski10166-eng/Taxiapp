"use client";

import { useState } from "react";
import { Home, Map, Wallet, User, Radio, TrendingUp, Car, ChevronRight, Bell, CircleHelp, Gift, Clock3, Navigation } from "lucide-react";

const orders=[
  {from:"ЖК Северное сияние",to:"ТРЦ Хан Шатыр",price:"2 450 ₸",time:"12 мин",coef:"КЭФ 1.8"},
  {from:"Аэропорт",to:"Центр города",price:"4 900 ₸",time:"27 мин",coef:"КЭФ 2.1"},
  {from:"Есильский район",to:"ЖД вокзал",price:"2 100 ₸",time:"16 мин",coef:"КЭФ 1.6"},
];

export default function HomePage(){
 const [tab,setTab]=useState("Главная");
 const [online,setOnline]=useState(true);
 const [selected,setSelected]=useState(0);
 const nav=[
  {name:"Главная",icon:Home},
  {name:"Заказы",icon:Map},
  {name:"Доход",icon:Wallet},
  {name:"Профиль",icon:User},
 ];
 return <main className="shell">
   <header className="topbar">
    <div><div className="eyebrow">TAXI KZ</div><h1>Привет, водитель 👋</h1></div>
    <button className="iconBtn"><Bell size={20}/><span/></button>
   </header>

   <section className="statusCard">
    <div className="statusTop"><div><span className={online?"dot live":"dot"}></span>{online?"Вы на линии":"Вы офлайн"}</div><button onClick={()=>setOnline(!online)} className={online?"switch on":"switch"}><i/></button></div>
    <div className="statusMain"><div><span>Сегодня</span><strong>18 750 ₸</strong></div><div><span>Поездок</span><strong>12</strong></div><div><span>Часов</span><strong>6ч 40м</strong></div></div>
    <div className="progress"><span style={{width:"72%"}}/></div><div className="goal"><span>До цели 25 000 ₸</span><b>75%</b></div>
   </section>

   <section className="section">
    <div className="sectionHead"><h2>Радар КЭФА</h2><span className="livePill"><Radio size={13}/> LIVE</span></div>
    <div className="radarCard">
      <div className="radarCircle"><div className="radarCore">1.8x</div></div>
      <div className="radarInfo"><span>Сейчас повышенный спрос</span><strong>КЭФ 1.8 — 2.1</strong><p>Больше заказов в районе центра</p><button>Открыть карту <ChevronRight size={16}/></button></div>
    </div>
   </section>

   <section className="section">
    <div className="sectionHead"><h2>Доступные заказы</h2><button className="textBtn">Все</button></div>
    <div className="orders">
     {orders.map((o,i)=><button key={i} onClick={()=>setSelected(i)} className={selected===i?"order active":"order"}>
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
    <div><span>ПРИГЛАШАЙ ВОДИТЕЛЕЙ</span><h3>Зарабатывай бонус<br/>за каждого друга</h3><p>Пригласи водителя в Taxi KZ и получай бонусы.</p><button>Моя реферальная ссылка <ChevronRight size={16}/></button></div>
    <div className="giftArt"><Gift size={48}/></div>
   </section>

   <section className="quick">
    <button><Car size={19}/><span>Мой автомобиль</span><ChevronRight/></button>
    <button><CircleHelp size={19}/><span>Помощь и поддержка</span><ChevronRight/></button>
   </section>

   <nav className="bottomNav">{nav.map(n=>{const Icon=n.icon; return <button key={n.name} onClick={()=>setTab(n.name)} className={tab===n.name?"navItem active":"navItem"}><Icon size={21}/><span>{n.name}</span></button>})}</nav>
 </main>
}