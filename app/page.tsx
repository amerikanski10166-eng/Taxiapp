// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Heart, User, Wallet, CarFront, X, Camera, Zap, ChevronRight, SlidersHorizontal } from "lucide-react";

const seed = [
  {id:"1", title:"Toyota Camry 70", year:2021, price:14500000, city:"Астана", mileage:62000, fuel:"Бензин", seller:"Частник", promoted:true},
  {id:"2", title:"Hyundai Tucson", year:2022, price:16900000, city:"Астана", mileage:41000, fuel:"Бензин", seller:"Автосалон"},
  {id:"3", title:"Lexus RX 350", year:2019, price:23500000, city:"Алматы", mileage:78000, fuel:"Бензин", seller:"Частник"},
];

const money=(n:number)=>new Intl.NumberFormat("ru-RU").format(n)+" ₸";

export default function HomePage(){
  const [listings,setListings]=useState<any[]>(seed);
  const [query,setQuery]=useState("");
  const [modal,setModal]=useState<"add"|"listing"|"cabinet"|"income"|null>(null);
  const [selected,setSelected]=useState<any>(null);
  const [form,setForm]=useState({title:"",year:"",price:"",city:"Астана",mileage:"",fuel:"Бензин",description:""});
  const [notice,setNotice]=useState("");

  useEffect(()=>{try{const x=localStorage.getItem("auto-market-listings");if(x)setListings(JSON.parse(x));}catch{}},[]);
  useEffect(()=>{try{localStorage.setItem("auto-market-listings",JSON.stringify(listings));}catch{}},[listings]);

  const filtered=useMemo(()=>listings.filter(x=>(x.title+" "+x.city).toLowerCase().includes(query.toLowerCase())),[listings,query]);

  const addListing=()=>{
    if(!form.title||!form.price){setNotice("Укажите марку/модель и цену");return;}
    const item={id:Date.now().toString(),...form,year:Number(form.year)||2020,price:Number(form.price),mileage:Number(form.mileage)||0,seller:"Частник",promoted:false};
    setListings([item,...listings]);setModal(null);setForm({title:"",year:"",price:"",city:"Астана",mileage:"",fuel:"Бензин",description:""});setNotice("Объявление сохранено");
  };
  const promote=()=>{if(!selected)return;setListings(xs=>xs.map(x=>x.id===selected.id?{...x,promoted:true}:x));setSelected({...selected,promoted:true});setNotice("Продвижение выбрано. Подключение реальной оплаты — следующий шаг.");};

  return <main className="market">
    <header className="marketTop">
      <div><div className="brand">AUTO<span>KZ</span></div><div className="brandSub">автомобили Казахстана</div></div>
      <button className="roundBtn" onClick={()=>setModal("cabinet")}><User size={20}/></button>
    </header>

    <section className="hero">
      <div><div className="eyebrow">AUTO MARKETPLACE</div><h1>Купи или продай<br/>автомобиль</h1><p>Объявления по всему Казахстану.</p></div>
      <button className="addBtn" onClick={()=>setModal("add")}><Plus size={18}/> Продать авто</button>
    </section>

    <div className="searchBox"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Марка, модель или город"/><button><SlidersHorizontal size={18}/></button></div>

    <div className="chips"><button className="chip active">Все авто</button><button className="chip">С пробегом</button><button className="chip">Новые</button><button className="chip">Салоны</button></div>

    <section className="marketSection">
      <div className="sectionHead"><div><h2>Автомобили</h2><span>{filtered.length} объявлений</span></div><button className="textBtn">Сортировка <ChevronRight size={14}/></button></div>
      <div className="carGrid">{filtered.map(car=><button key={car.id} className={"carCard "+(car.promoted?"promoted":"")} onClick={()=>{setSelected(car);setModal("listing")}}>
        <div className="carPhoto"><CarFront size={48}/>{car.promoted&&<b><Zap size={12}/> ТОП</b>}</div>
        <div className="carBody"><h3>{car.title}</h3><strong>{money(car.price)}</strong><p>{car.year} · {car.mileage.toLocaleString("ru-RU")} км · {car.fuel}</p><small>{car.city} · {car.seller}</small></div>
      </button>)}</div>
    </section>

    <section className="sellerBanner"><div><span>ДЛЯ ПРОДАВЦОВ</span><h2>Разместить авто<br/>можно за минуту</h2><p>Создай объявление, добавь фото и получай звонки от покупателей.</p></div><button onClick={()=>setModal("add")}>Подать объявление <ChevronRight size={16}/></button></section>

    <nav className="marketNav">
      <button className="active"><CarFront size={20}/><span>Авто</span></button>
      <button onClick={()=>setModal("add")}><Plus size={20}/><span>Продать</span></button>
      <button onClick={()=>setModal("income")}><Wallet size={20}/><span>Доход</span></button>
      <button onClick={()=>setModal("cabinet")}><User size={20}/><span>Кабинет</span></button>
    </nav>

    {modal&&<div className="marketBackdrop" onClick={()=>setModal(null)}><div className="marketModal" onClick={e=>e.stopPropagation()}><button className="closeBtn" onClick={()=>setModal(null)}><X size={18}/></button>
      {modal==="add"&&<><div className="eyebrow">НОВОЕ ОБЪЯВЛЕНИЕ</div><h2>Продать автомобиль</h2><p className="muted">Заполни данные. Фото можно добавить следующим шагом.</p>
        <div className="photoUpload"><Camera size={25}/><span>Добавить фото</span><small>до 10 фотографий</small></div>
        <input className="marketInput" placeholder="Марка и модель *" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
        <div className="two"><input className="marketInput" placeholder="Год" value={form.year} onChange={e=>setForm({...form,year:e.target.value})}/><input className="marketInput" placeholder="Пробег, км" value={form.mileage} onChange={e=>setForm({...form,mileage:e.target.value})}/></div>
        <input className="marketInput" placeholder="Цена, ₸ *" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/>
        <select className="marketInput" value={form.city} onChange={e=>setForm({...form,city:e.target.value})}><option>Астана</option><option>Алматы</option><option>Шымкент</option><option>Караганда</option><option>Другой город</option></select>
        <textarea className="marketInput" placeholder="Описание" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
        <button className="primaryBtn" onClick={addListing}>Опубликовать объявление</button>
      </>}

      {modal==="listing"&&selected&&<><div className="carPhoto big"><CarFront size={75}/>{selected.promoted&&<b><Zap size={12}/> ТОП</b>}</div><div className="listingHead"><div><div className="eyebrow">{selected.city}</div><h2>{selected.title}</h2></div><Heart size={21}/></div><strong className="bigPrice">{money(selected.price)}</strong><p className="muted">{selected.year} · {selected.mileage.toLocaleString("ru-RU")} км · {selected.fuel}</p><p>{selected.description||"Описание автомобиля будет отображаться здесь."}</p><div className="sellerBox"><b>{selected.seller}</b><span>Продавец на AutoKZ</span></div><button className="primaryBtn" onClick={promote}><Zap size={17}/> Продвинуть объявление — 500 ₸</button><small className="paymentNote">Сейчас демонстрационный режим. Реальная оплата подключается через официальный платёжный сервис.</small></>}

      {modal==="cabinet"&&<><div className="eyebrow">ЛИЧНЫЙ КАБИНЕТ</div><h2>Мои объявления</h2><div className="cabStat"><b>{listings.length}</b><span>объявлений</span></div>{listings.slice(0,5).map(x=><button className="cabRow" key={x.id} onClick={()=>{setSelected(x);setModal("listing")}}><span>{x.title}</span><b>{money(x.price)}</b></button>)}<button className="primaryBtn" onClick={()=>setModal("add")}><Plus size={16}/> Добавить автомобиль</button></>}

      {modal==="income"&&<><div className="eyebrow">ДОХОД ВЛАДЕЛЬЦА</div><h2>Доход</h2><div className="incomeBox"><Wallet size={22}/><b>0 ₸</b><span>Реальные платежи появятся после подключения платёжного сервиса.</span></div><p className="muted">Здесь будет закрытая админ-панель: платежи, продвижения, продавцы и статистика. Сейчас это только интерфейс, без притворной оплаты.</p></>}
    </div></div>}
    {notice&&<div className="marketToast">{notice}</div>}
  </main>;
}
