// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Heart, User, Wallet, CarFront, X, Images, Zap, ChevronRight, SlidersHorizontal } from "lucide-react";

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
  const [form,setForm]=useState({title:"",year:"",price:"",city:"Астана",mileage:"",fuel:"Бензин",phone:"",description:""});
  const [notice,setNotice]=useState("");
  const [city,setCity]=useState("Все города");
  const [sort,setSort]=useState("new");
  const [favorites,setFavorites]=useState<string[]>([]);

  useEffect(()=>{try{const x=localStorage.getItem("auto-market-listings");if(x)setListings(JSON.parse(x)); const f=localStorage.getItem("auto-market-favorites");if(f)setFavorites(JSON.parse(f));}catch{}},[]);
  useEffect(()=>{try{localStorage.setItem("auto-market-listings",JSON.stringify(listings));}catch{}},[listings]);
  useEffect(()=>{try{localStorage.setItem("auto-market-favorites",JSON.stringify(favorites));}catch{}},[favorites]);

  const filtered=useMemo(()=>{let xs=listings.filter(x=>(x.title+" "+x.city).toLowerCase().includes(query.toLowerCase())); if(city!=="Все города") xs=xs.filter(x=>x.city===city); return [...xs].sort((a,b)=>sort==="priceAsc"?a.price-b.price:sort==="priceDesc"?b.price-a.price:sort==="year"?b.year-a.year:(Number(b.promoted)-Number(a.promoted)));},[listings,query,city,sort]);
  const toggleFavorite=(id:string)=>setFavorites(xs=>xs.includes(id)?xs.filter(x=>x!==id):[...xs,id]);

  const addListing=()=>{
    if(!form.title||!form.price){setNotice("Укажите марку/модель и цену");return;} if(!form.phone){setNotice("Укажите номер телефона продавца");return;}
    const item={id:Date.now().toString(),...form,year:Number(form.year)||2020,price:Number(form.price),mileage:Number(form.mileage)||0,seller:"Частник",promoted:false};
    setListings([item,...listings]);setModal(null);setForm({title:"",year:"",price:"",city:"Астана",mileage:"",fuel:"Бензин",phone:"",description:""});setNotice("Объявление сохранено");
  };
  const [photos,setPhotos]=useState<string[]>([]);
  const addPhotos=(e:any)=>{
    const files=Array.from(e.target.files||[]).filter((f:any)=>f.type.startsWith("image/")).slice(0,10-photos.length) as File[];
    const urls=files.map((file:any)=>URL.createObjectURL(file));
    setPhotos(xs=>[...xs,...urls].slice(0,10));
    e.target.value="";
  };
  const removePhoto=(i:number)=>setPhotos(xs=>xs.filter((_,n)=>n!==i));
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

    <div className="searchBox"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Марка, модель или город"/><button onClick={()=>setSort(sort==="priceAsc"?"new":"priceAsc")} title="Сортировка"><SlidersHorizontal size={18}/></button></div>
    <div className="filters"><select value={city} onChange={e=>setCity(e.target.value)}><option>Все города</option><option>Астана</option><option>Алматы</option><option>Шымкент</option><option>Караганда</option></select><select value={sort} onChange={e=>setSort(e.target.value)}><option value="new">Сначала новые</option><option value="priceAsc">Цена: дешевле</option><option value="priceDesc">Цена: дороже</option><option value="year">Год: новее</option></select></div>

    <div className="chips"><button className="chip active">Все авто</button><button className="chip">С пробегом</button><button className="chip">Новые</button><button className="chip">Салоны</button></div>

    <section className="marketSection">
      <div className="sectionHead"><div><h2>Автомобили</h2><span>{filtered.length} объявлений</span></div><button className="textBtn">Сортировка <ChevronRight size={14}/></button></div>
      <div className="carGrid">{filtered.map(car=><div key={car.id} className={"carCard "+(car.promoted?"promoted":"")}><button className="cardMain" onClick={()=>{setSelected(car);setModal("listing")}}>
        <div className="carPhoto"><CarFront size={48}/>{car.promoted&&<b><Zap size={12}/> ТОП</b>}</div>
        <div className="carBody"><h3>{car.title}</h3><strong>{money(car.price)}</strong><p>{car.year} · {car.mileage.toLocaleString("ru-RU")} км · {car.fuel}</p><small>{car.city} · {car.seller}</small></div>
      </button><button className={"favBtn "+(favorites.includes(car.id)?"favOn":"")} onClick={()=>toggleFavorite(car.id)} aria-label="Избранное"><Heart size={16} fill={favorites.includes(car.id)?"currentColor":"none"}/></button></div>)}</div>
    </section>

    <section className="sellerBanner"><div><span>ДЛЯ ПРОДАВЦОВ</span><h2>Разместить авто<br/>можно за минуту</h2><p>Создай объявление, добавь фото и получай звонки от покупателей.</p></div><button onClick={()=>setModal("add")}>Подать объявление <ChevronRight size={16}/></button></section>

    <nav className="marketNav">
      <button className="active"><CarFront size={20}/><span>Авто</span></button>
      <button onClick={()=>setModal("add")}><Plus size={20}/><span>Продать</span></button>
      <button onClick={()=>setModal("income")}><Wallet size={20}/><span>Доход</span></button>
      <button onClick={()=>setModal("cabinet")}><User size={20}/><span>Кабинет</span></button>
    </nav>

    {modal&&<div className="marketBackdrop" onClick={()=>setModal(null)}><div className="marketModal" onClick={e=>e.stopPropagation()}><button className="closeBtn" onClick={()=>setModal(null)}><X size={18}/></button>
      {modal==="add"&&<><div className="eyebrow">НОВОЕ ОБЪЯВЛЕНИЕ</div><h2>Продать автомобиль</h2><p className="muted">Заполни данные и выбери фотографии автомобиля из галереи.</p>
        <label className="photoUpload" htmlFor="vehicle-photo-input"><Images size={25}/><span>{photos.length?"Добавить ещё фото":"Выбрать фото автомобиля"}</span><small>{photos.length}/10 · галерея</small><input id="vehicle-photo-input" type="file" accept="image/*" multiple onChange={addPhotos} /></label>
        {photos.length>0&&<div className="photoPreview">{photos.map((p,i)=><div className="photoThumb" key={p}><img src={p} alt={`Фото ${i+1}`}/><button type="button" onClick={()=>removePhoto(i)}>×</button></div>)}</div>}
        <input className="marketInput" placeholder="Марка и модель *" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
        <div className="two"><input className="marketInput" placeholder="Год" value={form.year} onChange={e=>setForm({...form,year:e.target.value})}/><input className="marketInput" placeholder="Пробег, км" value={form.mileage} onChange={e=>setForm({...form,mileage:e.target.value})}/></div>
        <input className="marketInput" placeholder="Цена, ₸ *" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/><input className="marketInput" type="tel" inputMode="tel" placeholder="Телефон продавца *" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
        <select className="marketInput" value={form.city} onChange={e=>setForm({...form,city:e.target.value})}><option>Астана</option><option>Алматы</option><option>Шымкент</option><option>Караганда</option><option>Другой город</option></select>
        <textarea className="marketInput" placeholder="Описание" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
        <button className="primaryBtn" onClick={addListing}>Опубликовать объявление</button>
      </>}

      {modal==="listing"&&selected&&<><div className="carPhoto big"><CarFront size={75}/>{selected.promoted&&<b><Zap size={12}/> ТОП</b>}</div><div className="listingHead"><div><div className="eyebrow">{selected.city}</div><h2>{selected.title}</h2></div><button className={"favoriteLarge "+(favorites.includes(selected.id)?"favOn":"")} onClick={()=>toggleFavorite(selected.id)}><Heart size={21} fill={favorites.includes(selected.id)?"currentColor":"none"}/></button></div><strong className="bigPrice">{money(selected.price)}</strong><p className="muted">{selected.year} · {selected.mileage.toLocaleString("ru-RU")} км · {selected.fuel}</p><p>{selected.description||"Описание автомобиля будет отображаться здесь."}</p><div className="sellerBox"><b>{selected.seller}</b><span>Продавец на AutoKZ</span>{selected.phone&&<a href={"tel:"+selected.phone}>Позвонить: {selected.phone}</a>}</div><button className="primaryBtn" onClick={promote}><Zap size={17}/> Продвинуть объявление — 500 ₸</button><small className="paymentNote">Сейчас демонстрационный режим. Реальная оплата подключается через официальный платёжный сервис.</small></>}

      {modal==="cabinet"&&<><div className="eyebrow">ЛИЧНЫЙ КАБИНЕТ</div><h2>Мои объявления</h2><div className="cabStat"><b>{listings.length}</b><span>объявлений</span></div>{listings.slice(0,5).map(x=><button className="cabRow" key={x.id} onClick={()=>{setSelected(x);setModal("listing")}}><span>{x.title}</span><b>{money(x.price)}</b></button>)}<button className="primaryBtn" onClick={()=>setModal("add")}><Plus size={16}/> Добавить автомобиль</button></>}

      {modal==="income"&&<><div className="eyebrow">ДОХОД ВЛАДЕЛЬЦА</div><h2>Доход</h2><div className="incomeBox"><Wallet size={22}/><b>0 ₸</b><span>Реальные платежи появятся после подключения платёжного сервиса.</span></div><p className="muted">Здесь будет закрытая админ-панель: платежи, продвижения, продавцы и статистика. Сейчас это только интерфейс, без притворной оплаты.</p></>}
    </div></div>}
    {notice&&<div className="marketToast">{notice}</div>}
  </main>;
}
