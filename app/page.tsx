// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Heart, User, Wallet, CarFront, X, Images, Zap, ChevronRight, SlidersHorizontal, Share2 } from "lucide-react";
import { supabase } from "../lib/supabase";

const KZ_CITIES=["Все города","Астана","Алматы","Шымкент","Караганда","Актобе","Тараз","Павлодар","Усть-Каменогорск","Семей","Костанай","Кызылорда","Атырау","Актау","Петропавловск","Кокшетау","Талдыкорган","Туркестан","Жезказган","Темиртау","Экибастуз","Рудный","Балхаш","Каскелен","Другой город"];

const seed = [
  {id:"1", title:"Toyota Camry 70", year:2021, price:14500000, city:"Астана", mileage:62000, fuel:"Бензин", seller:"Частник", promoted:true},
  {id:"2", title:"Hyundai Tucson", year:2022, price:16900000, city:"Астана", mileage:41000, fuel:"Бензин", seller:"Автосалон"},
  {id:"3", title:"Lexus RX 350", year:2019, price:23500000, city:"Алматы", mileage:78000, fuel:"Бензин", seller:"Частник"},
];

const money=(n:number|string)=>{const value=Number(String(n??"").replace(/[^0-9.-]/g,""));return (Number.isFinite(value)?value:0).toLocaleString("ru-RU")+" ₸";};
const normalizePrice=(n:number|string)=>Number(String(n??"").replace(/[^0-9.-]/g,""))||0;
const fileToDataUrl=(file:File,maxSize=1600,quality=.82)=>new Promise<string>((resolve,reject)=>{
  const reader=new FileReader();
  reader.onerror=()=>reject(reader.error);
  reader.onload=()=>{
    const img=new Image();
    img.onload=()=>{
      const scale=Math.min(1,maxSize/Math.max(img.width,img.height));
      const canvas=document.createElement("canvas");
      canvas.width=Math.max(1,Math.round(img.width*scale));
      canvas.height=Math.max(1,Math.round(img.height*scale));
      const ctx=canvas.getContext("2d");
      if(!ctx)return reject(new Error("Не удалось обработать фото"));
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      resolve(canvas.toDataURL("image/jpeg",quality));
    };
    img.onerror=()=>reject(new Error("Не удалось прочитать фото"));
    img.src=String(reader.result);
  };
  reader.readAsDataURL(file);
});

export default function HomePage(){
  const [listings,setListings]=useState<any[]>(seed);
  const [query,setQuery]=useState("");
  const [modal,setModal]=useState<"add"|"listing"|"cabinet"|"income"|null>(null);
  const [selected,setSelected]=useState<any>(null);
  const [form,setForm]=useState({title:"",year:"",price:"",city:"Астана",mileage:"",vehicleCondition:"used",fuel:"Бензин",phone:"",description:""});
  const [notice,setNotice]=useState("");
  const [city,setCity]=useState("Все города");
  const [sort,setSort]=useState("new");
  const [favorites,setFavorites]=useState<string[]>([]);
  const [category,setCategory]=useState("all");
  const [galleryIndex,setGalleryIndex]=useState(0);

  useEffect(()=>{(async()=>{try{const x=localStorage.getItem("auto-market-listings");if(x)setListings(JSON.parse(x)); const f=localStorage.getItem("auto-market-favorites");if(f)setFavorites(JSON.parse(f));}catch{} try{const {data,error}=await supabase.from("listings").select("*").eq("status","published").order("created_at",{ascending:false}).limit(100); if(!error&&Array.isArray(data)&&data.length){const remote=data.map((x:any)=>({...x,year:Number(x.year)||2020,price:Number(x.price)||0,mileage:Number(x.mileage)||0,seller:x.seller||"Частник",vehicleCondition:x.vehicle_condition||"used",photos:Array.isArray(x.photos)?x.photos:[]})); setListings(remote);}}catch{}})();},[]);
  useEffect(()=>{setGalleryIndex(0);},[selected]);
  useEffect(()=>{const id=new URLSearchParams(window.location.search).get("listing"); if(!id)return; (async()=>{const {data,error}=await supabase.from("listings").select("*").eq("id",id).eq("status","published").maybeSingle(); if(!error&&data){setSelected({...data,price:Number(data.price)||0,mileage:Number(data.mileage)||0,photos:Array.isArray(data.photos)?data.photos:[]});setModal("listing");}})();},[]);
  useEffect(()=>{try{localStorage.setItem("auto-market-listings",JSON.stringify(listings));}catch{}},[listings]);
  useEffect(()=>{try{localStorage.setItem("auto-market-favorites",JSON.stringify(favorites));}catch{}},[favorites]);

  const filtered=useMemo(()=>{let xs=listings.filter(x=>(x.title+" "+x.city).toLowerCase().includes(query.toLowerCase())); if(city!=="Все города") xs=xs.filter(x=>x.city===city); if(category==="used") xs=xs.filter(x=>Number(x.mileage)>0); if(category==="new") xs=xs.filter(x=>Number(x.mileage)===0); if(category==="dealer") xs=xs.filter(x=>x.seller==="Автосалон"); return [...xs].sort((a,b)=>sort==="priceAsc"?a.price-b.price:sort==="priceDesc"?b.price-a.price:sort==="year"?b.year-a.year:(Number(b.promoted)-Number(a.promoted)));},[listings,query,city,sort,category]);
  const toggleFavorite=(id:string)=>setFavorites(xs=>xs.includes(id)?xs.filter(x=>x!==id):[...xs,id]);
  const shareListing=async()=>{if(!selected)return; const url=`${window.location.origin}/listing/${encodeURIComponent(selected.id)}`; const text=`${selected.title} — ${money(normalizePrice(selected.price))} · ${selected.city} · AutoKZ`; try{if(navigator.share) await navigator.share({title:`${selected.title} — AutoKZ`,text,url}); else {await navigator.clipboard?.writeText(url);setNotice("Ссылка на объявление AutoKZ скопирована");}}catch{}};
  const uploadSharePhotos=async(id:string,items:string[])=>{const urls:string[]=[]; for(let i=0;i<Math.min(items.length,6);i++){try{const blob=await (await fetch(items[i])).blob(); const path=`shares/${id}-${i}.jpg`; const {error}=await supabase.storage.from("vehicle-photos").upload(path,blob,{contentType:"image/jpeg",upsert:true}); if(!error){const {data}=supabase.storage.from("vehicle-photos").getPublicUrl(path); urls.push(data.publicUrl);}}catch{}} return urls;};

  const addListing=async()=>{
    if(!form.title||!form.price){setNotice("Укажите марку/модель и цену");return;} if(!form.phone){setNotice("Укажите номер телефона продавца");return;} const mileage=Number(form.mileage)||0; if(form.vehicleCondition==="new"&&mileage!==0){setNotice("Для нового автомобиля укажите пробег 0 км");return;} if(form.vehicleCondition==="used"&&mileage<=0){setNotice("Для автомобиля с пробегом укажите пробег больше 0 км");return;}
    setNotice("Публикуем объявление…");
    const id=crypto.randomUUID();
    const sharePhotos=await uploadSharePhotos(id,photos);
    const item={id,...form,year:Number(form.year)||2020,price:normalizePrice(form.price),mileage:mileage,vehicleCondition:form.vehicleCondition,seller:"Частник",promoted:false,photos:[...photos],share_code:id};
    const {error}=await supabase.from("listings").insert({id,title:item.title,year:item.year,price:item.price,city:item.city,mileage:item.mileage,fuel:item.fuel,description:item.description,status:"published",promoted:false,photos:sharePhotos,share_code:id,phone:item.phone,vehicle_condition:item.vehicleCondition});
    if(error){setNotice("Не удалось опубликовать объявление в AutoKZ. Попробуйте ещё раз.");return;}
    setListings(xs=>[item,...xs]);setSelected({...item,photos:sharePhotos.length?sharePhotos:item.photos});setPhotos([]);setForm({title:"",year:"",price:"",city:"Астана",mileage:"",vehicleCondition:"used",fuel:"Бензин",phone:"",description:""});setModal("listing");setNotice("Объявление опубликовано в AutoKZ");
  };
  const [photos,setPhotos]=useState<string[]>([]);
  const addPhotos=async(e:any)=>{
    const input=e.currentTarget as HTMLInputElement;
    const files=Array.from(input.files||[])
      .filter((f:any)=>f.type.startsWith("image/"))
      .slice(0,Math.max(0,10-photos.length)) as File[];
    try{
      const urls=await Promise.all(files.map((file:any)=>fileToDataUrl(file)));
      if(urls.length)setPhotos(xs=>[...xs,...urls].slice(0,10));
    }catch{
      setNotice("Не удалось загрузить фото. Попробуйте другое изображение.");
    }finally{input.value="";}
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
    <div className="filters"><select value={city} onChange={e=>setCity(e.target.value)}>{KZ_CITIES.map(x=><option key={x}>{x}</option>)}</select><select value={sort} onChange={e=>setSort(e.target.value)}><option value="new">Сначала новые</option><option value="priceAsc">Цена: дешевле</option><option value="priceDesc">Цена: дороже</option><option value="year">Год: новее</option></select></div>

    <div className="chips"><button className={"chip "+(category==="all"?"active":"")} onClick={()=>setCategory("all")}>Все авто</button><button className={"chip "+(category==="used"?"active":"")} onClick={()=>setCategory("used")}>С пробегом</button><button className={"chip "+(category==="new"?"active":"")} onClick={()=>setCategory("new")}>Новые</button><button className={"chip "+(category==="dealer"?"active":"")} onClick={()=>setCategory("dealer")}>Салоны</button></div>

    <section className="marketSection">
      <div className="sectionHead"><div><h2>Автомобили</h2><span>{filtered.length} объявлений</span></div><button className="textBtn">Сортировка <ChevronRight size={14}/></button></div>
      <div className="carGrid">{filtered.map(car=><div key={car.id} className={"carCard "+(car.promoted?"promoted":"")}><button className="cardMain" onClick={()=>{setSelected(car);setModal("listing")}}>
        <div className="carPhoto">
  {car.photos?.[0] ? <img className="cardVehiclePhoto" src={car.photos[0]} alt={car.title}/> : <><div className="carPhotoGlow"></div><CarFront size={52}/></>}
  {car.promoted&&<b><Zap size={12}/> ТОП</b>}
  <span className="photoCount"><Images size={12}/> {car.photos?.length||0} фото</span>
</div>
        <div className="carBody"><div className="cardCity">{car.city}</div><h3>{car.title}</h3><strong>{money(normalizePrice(car.price))}</strong><div className="carSpecs"><span>{car.year}</span><span>{car.mileage.toLocaleString("ru-RU")} км</span><span>{car.fuel}</span></div><small>{car.seller}</small></div>
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
        <div className="photoUpload"><Images size={25}/><span>{photos.length?"Выбрать ещё фото":"Выбрать фото автомобиля"}</span><input id="vehicle-photo-input" className="photoInput" type="file" accept="image/*" multiple onChange={addPhotos} /></div>
        {photos.length>0&&<div className="photoPreview">{photos.map((p,i)=><div className="photoThumb" key={p}><img src={p} alt={`Фото ${i+1}`}/><button type="button" onClick={()=>removePhoto(i)}>×</button></div>)}</div>}
        <input className="marketInput" placeholder="Марка и модель *" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
        <div className="two"><input className="marketInput" placeholder="Год" value={form.year} onChange={e=>setForm({...form,year:e.target.value})}/><input className="marketInput" placeholder="Пробег, км" value={form.mileage} onChange={e=>setForm({...form,mileage:e.target.value})}/></div>
        <input className="marketInput" placeholder="Цена, ₸ *" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/><select className="marketInput" value={form.vehicleCondition} onChange={e=>setForm({...form,vehicleCondition:e.target.value,mileage:e.target.value==="new"?"0":form.mileage})}><option value="used">С пробегом</option><option value="new">Новый, 0 км</option></select><input className="marketInput" type="tel" inputMode="tel" placeholder="Телефон продавца *" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
        <select className="marketInput" value={form.city} onChange={e=>setForm({...form,city:e.target.value})}>{KZ_CITIES.filter(x=>x!=="Все города").map(x=><option key={x}>{x}</option>)}</select>
        <textarea className="marketInput" placeholder="Описание" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
        <div className="freePublishNote"><b>Размещение бесплатно</b><span>Без оплаты и комиссий. Добавь фото и контакты — покупатели смогут позвонить.</span></div><button className="primaryBtn" onClick={addListing}>Опубликовать бесплатно</button>
      </>}

      {modal==="listing"&&selected&&<><div className="detailTop">{selected.photos?.length ? <div className="listingGallery"><div className="galleryStage"><img src={selected.photos[galleryIndex]} alt={`Фото ${selected.title} ${galleryIndex+1}`} />{selected.photos.length>1&&<><button className="galleryArrow galleryPrev" onClick={()=>setGalleryIndex(i=>(i-1+selected.photos.length)%selected.photos.length)} aria-label="Предыдущее фото">‹</button><button className="galleryArrow galleryNext" onClick={()=>setGalleryIndex(i=>(i+1)%selected.photos.length)} aria-label="Следующее фото">›</button></>}</div>{selected.photos.length>1&&<div className="galleryThumbs">{selected.photos.map((p:string,i:number)=><button className={"galleryThumb "+(i===galleryIndex?"active":"")} key={p} onClick={()=>setGalleryIndex(i)}><img src={p} alt={`Миниатюра ${i+1}`} /></button>)}</div>}<div className="galleryCounter">{galleryIndex+1} / {selected.photos.length}</div></div> : <div className="carPhoto big"><div className="carPhotoGlow"></div><CarFront size={82}/>{selected.promoted&&<b><Zap size={12}/> ТОП</b>}<span className="photoCount"><Images size={12}/> Галерея</span></div>}</div><div className="listingHead"><div><div className="eyebrow">{selected.city} · {selected.seller}</div><h2>{selected.title}</h2></div><div className="detailActions"><button className="shareBtn" onClick={shareListing} aria-label="Поделиться"><Share2 size={18}/></button><button className={"favoriteLarge "+(favorites.includes(selected.id)?"favOn":"")} onClick={()=>toggleFavorite(selected.id)}><Heart size={21} fill={favorites.includes(selected.id)?"currentColor":"none"}/></button></div></div><strong className="bigPrice">{money(normalizePrice(selected.price))}</strong><div className="detailSpecs"><div><span>Год</span><b>{selected.year}</b></div><div><span>Пробег</span><b>{selected.mileage.toLocaleString("ru-RU")} км</b></div><div><span>Топливо</span><b>{selected.fuel}</b></div></div><p className="detailDescription">{selected.description||"Описание автомобиля будет отображаться здесь."}</p><div className="sellerBox"><div className="sellerIdentity"><div className="sellerAvatar"><User size={18}/></div><div><b>{selected.seller}</b><span>Продавец на AutoKZ</span></div></div>{selected.phone&&<a className="callBtn" href={"tel:"+selected.phone}>Позвонить продавцу</a>}</div><button className="secondaryAction" onClick={()=>setNotice("Платное продвижение пока отключено. Сейчас объявления размещаются бесплатно.")}><Zap size={17}/> Продвижение — скоро</button><small className="paymentNote">Сейчас публикация объявлений бесплатная. Платные функции подключим позже.</small></>}

      {modal==="cabinet"&&<><div className="eyebrow">ЛИЧНЫЙ КАБИНЕТ</div><h2>Мои объявления</h2><div className="profileCard"><div className="profileAvatar"><User size={22}/></div><div className="profileInfo"><b>Мой профиль</b><span>Продавец на AutoKZ</span></div><div className="profileBadge">Бесплатно</div></div><div className="cabStat"><div><b>{listings.length}</b><span>объявлений</span></div><div><b>{favorites.length}</b><span>в избранном</span></div><div><b>{listings.filter(x=>x.promoted).length}</b><span>ТОП</span></div></div>{listings.slice(0,5).map(x=><button className="cabRow" key={x.id} onClick={()=>{setSelected(x);setModal("listing")}}><span>{x.title}</span><b>{money(normalizePrice(x.price))}</b></button>)}<button className="primaryBtn" onClick={()=>setModal("add")}><Plus size={16}/> Добавить автомобиль</button></>}

      {modal==="income"&&<><div className="eyebrow">ДОХОД ВЛАДЕЛЬЦА</div><h2>Доход</h2><div className="incomeBox"><Wallet size={22}/><b>0 ₸</b><span>Реальные платежи появятся после подключения платёжного сервиса.</span></div><p className="muted">Здесь будет закрытая админ-панель: платежи, продвижения, продавцы и статистика. Сейчас это только интерфейс, без притворной оплаты.</p></>}
    </div></div>}
    {notice&&<div className="marketToast">{notice}</div>}
  </main>;
}
